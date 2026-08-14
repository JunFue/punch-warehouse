import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateDeliveryStatus } from "@/actions/deliveries";
import { Receipt, Truck, ArrowLeft, Plus, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientPaymentDialog } from "@/components/features/deliveries/client-payment-dialog";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string, color: string }> = {
    pending: { label: "Pending", color: "bg-warning/15 text-warning border-warning/20" },
    in_transit: { label: "In Transit", color: "bg-primary/15 text-primary border-primary/20" },
    delivered: { label: "Delivered", color: "bg-success/15 text-success border-success/20" },
    cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive border-destructive/20" },
  };
  const config = map[status] || map.pending;
  return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
};

export default async function DeliveryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: delivery, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      clients (*),
      warehouses (name, location),
      delivery_items (
        id, product_id, quantity, unit_price,
        products (name, sku, unit)
      ),
      client_payments (
        id, amount, method, payment_date, reference_no, notes
      )
    `)
    .eq("id", id)
    .single();

  if (error || !delivery) {
    notFound();
  }

  const items = delivery.delivery_items || [];
  const payments = delivery.client_payments || [];
  const dispNum = "DSP-" + delivery.id.split("-")[0].toUpperCase();
  const balance = delivery.total_amount - (delivery.amount_collected || 0);

  const setStatusTransit = async () => {
    "use server";
    await updateDeliveryStatus(delivery.id, "in_transit");
  };

  const setStatusDelivered = async () => {
    "use server";
    await updateDeliveryStatus(delivery.id, "delivered");
  };

  return (
    <PageContainer
      title={`Delivery Order: ${dispNum}`}
      description={`View dispatch and delivery details for ${delivery.clients?.name}`}
      action={
        <div className="flex items-center gap-2">
          <Link href="/deliveries">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
          </Link>
          {delivery.status === "pending" && (
            <form action={setStatusTransit}>
              <Button type="submit" variant="secondary"><Truck className="mr-2 h-4 w-4"/> Mark In-Transit</Button>
            </form>
          )}
          {(delivery.status === "pending" || delivery.status === "in_transit") && (
            <form action={setStatusDelivered}>
              <Button type="submit"><CheckCircle className="mr-2 h-4 w-4"/> Mark Delivered</Button>
            </form>
          )}
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Delivery Highlights */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dispatched Items</CardTitle>
                <CardDescription>Line items being shipped to the client</CardDescription>
              </div>
              <StatusBadge status={delivery.status} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.products?.name}</div>
                      <div className="text-xs text-muted-foreground">{item.products?.sku}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity} {item.products?.unit}</TableCell>
                    <TableCell className="text-right">₱{item.unit_price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₱{(item.quantity * item.unit_price).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary & Payments */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dispatch Date</span>
                <span className="font-medium">{new Date(delivery.delivery_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Source Warehouse</span>
                <span className="font-medium">{delivery.warehouses?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium truncate max-w-[150px]" title={delivery.clients?.address || "No address"}>
                  {delivery.clients?.address || "Address not provided"}
                </span>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Invoice</span>
                  <span>₱{delivery.total_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Amount Collected</span>
                  <span>- ₱{delivery.amount_collected.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Receivable</span>
                  <span className={balance > 0 ? "text-destructive" : "text-foreground"}>
                    ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Client Payments</CardTitle>
              </div>
              {balance > 0 && (
                <ClientPaymentDialog deliveryId={delivery.id} balance={balance}>
                  <Button variant="outline" size="sm" className="h-8">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Collect
                  </Button>
                </ClientPaymentDialog>
              )}
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No payments collected yet
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((pmt: any) => (
                    <div key={pmt.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">₱{pmt.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{new Date(pmt.payment_date).toLocaleDateString()}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">{pmt.method.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
