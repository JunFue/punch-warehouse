"use client";

import { useOptimistic } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeliveryDialog } from "./delivery-dialog";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string, color: string }> = {
    pending: { label: "Pending", color: "bg-warning/15 text-warning border-warning/20" },
    in_transit: { label: "In Transit", color: "bg-primary/15 text-primary border-primary/20" },
    delivered: { label: "Delivered", color: "bg-success/15 text-success border-success/20" },
    cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive border-destructive/20" },
  };
  const config = map[status] || map.pending;
  
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
};

export function DeliveriesClient({ 
  initialDeliveries,
  clients,
  warehouses,
  products
}: { 
  initialDeliveries: any[];
  clients: any[];
  warehouses: any[];
  products: any[];
}) {
  // Setup optimistic state
  const [optimisticDeliveries, addOptimisticDelivery] = useOptimistic(
    initialDeliveries,
    (state, newDelivery: any) => {
      return [newDelivery, ...state];
    }
  );

  return (
    <>
      <div className="absolute top-0 right-0 -mt-14 mr-6">
        <DeliveryDialog 
          clients={clients} 
          warehouses={warehouses} 
          products={products}
          onOptimisticAdd={(delivery) => addOptimisticDelivery(delivery)}
        >
          <Button id="add-delivery-btn">
            Dispatch Delivery
          </Button>
        </DeliveryDialog>
      </div>

      {optimisticDeliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Truck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No active deliveries</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Dispatch your first delivery to a client to start generating revenue.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispatch #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Invoice</TableHead>
              <TableHead className="text-right">Receivable</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticDeliveries.map((delivery: any) => {
              const balance = delivery.total_amount - (delivery.amount_collected || 0);
              const dispNum = delivery.id.includes("-") 
                ? "DSP-" + delivery.id.split("-")[0].toUpperCase()
                : "DSP-PENDING";
              
              return (
                <TableRow key={delivery.id} className={`hover:bg-muted/50 cursor-pointer group ${delivery.pending ? 'opacity-60' : ''}`}>
                  <TableCell className="font-mono text-xs">{dispNum}</TableCell>
                  <TableCell className="font-medium">
                    {delivery.clients?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(delivery.delivery_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={delivery.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₱{delivery.total_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {!delivery.pending && (
                      <Link href={`/deliveries/${delivery.id}`}>
                         <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <ChevronRight className="h-4 w-4" />
                         </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
}
