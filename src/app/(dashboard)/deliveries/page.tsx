import { getDeliveries } from "@/actions/deliveries";
import { getClients } from "@/actions/clients";
import { getWarehouses } from "@/actions/warehouses";
import { getProducts } from "@/actions/products";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Truck, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeliveryDialog } from "@/components/features/deliveries/delivery-dialog";
import Link from "next/link";

export const metadata = { title: "Deliveries" };

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

export default async function DeliveriesPage() {
  const [deliveriesRes, clientsRes, warehousesRes, productsRes] = await Promise.all([
    getDeliveries(),
    getClients(),
    getWarehouses(),
    getProducts()
  ]);

  const deliveries = deliveriesRes.data || [];
  const clients = (clientsRes.data || []).map(c => ({ id: c.id, name: c.name }));
  const warehouses = (warehousesRes.data || []).filter(w => w.is_active).map(w => ({ id: w.id, name: w.name }));
  const products = (productsRes.data || []).map(p => ({ id: p.id, name: p.name, unit_price: p.unit_price }));

  return (
    <PageContainer
      title="Outbound Deliveries"
      description="Manage client orders and dispatch tracking"
      action={
        <DeliveryDialog clients={clients} warehouses={warehouses} products={products}>
          <Button id="add-delivery-btn">
            <Plus className="mr-2 h-4 w-4" />
            Dispatch Delivery
          </Button>
        </DeliveryDialog>
      }
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Outbound Orders</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search deliveries..." className="pl-9" id="search-deliveries" />
          </div>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
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
                {deliveries.map((delivery: any) => {
                  const balance = delivery.total_amount - (delivery.amount_collected || 0);
                  const dispNum = "DSP-" + delivery.id.split("-")[0].toUpperCase();
                  
                  return (
                    <TableRow key={delivery.id} className="hover:bg-muted/50 cursor-pointer group">
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
                        <Link href={`/deliveries/${delivery.id}`}>
                           <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <ChevronRight className="h-4 w-4" />
                           </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
