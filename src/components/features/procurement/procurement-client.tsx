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
import { ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PurchaseDialog } from "./purchase-dialog";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string, color: string }> = {
    pending: { label: "Pending", color: "bg-warning/15 text-warning border-warning/20" },
    partial: { label: "Partial", color: "bg-primary/15 text-primary border-primary/20" },
    received: { label: "Received", color: "bg-success/15 text-success border-success/20" },
    cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive border-destructive/20" },
  };
  const config = map[status] || map.pending;
  
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
};

export function ProcurementClient({ 
  initialPurchases,
  manufacturers,
  warehouses,
  products
}: { 
  initialPurchases: any[];
  manufacturers: any[];
  warehouses: any[];
  products: any[];
}) {
  const [optimisticPurchases, addOptimisticPurchase] = useOptimistic(
    initialPurchases,
    (state, newPurchase: any) => {
      return [newPurchase, ...state];
    }
  );

  return (
    <>
      <div className="absolute top-0 right-0 -mt-14 mr-6">
        <PurchaseDialog 
          manufacturers={manufacturers} 
          warehouses={warehouses} 
          products={products}
          onOptimisticAdd={(purchase) => addOptimisticPurchase(purchase)}
        >
          <Button id="add-purchase-btn">
            Create Purchase Order
          </Button>
        </PurchaseDialog>
      </div>

      {optimisticPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No purchase orders yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Start procuring inventory by creating a purchase order from your manufacturers.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Unpaid Balance</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticPurchases.map((purchase: any) => {
              const balance = purchase.total_amount - (purchase.amount_paid || 0);
              const poNum = purchase.id.includes("-") 
                ? "PO-" + purchase.id.split("-")[0].toUpperCase()
                : "PO-PENDING";
              
              return (
                <TableRow key={purchase.id} className={`hover:bg-muted/50 cursor-pointer group ${purchase.pending ? 'opacity-60' : ''}`}>
                  <TableCell className="font-mono text-xs">{poNum}</TableCell>
                  <TableCell className="font-medium">
                    {purchase.manufacturers?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(purchase.order_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={purchase.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₱{purchase.total_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {!purchase.pending && (
                      <Link href={`/procurement/${purchase.id}`}>
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
