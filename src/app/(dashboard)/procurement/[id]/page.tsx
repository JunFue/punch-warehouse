
import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updatePurchaseStatus, receivePurchaseItems, addManufacturerPayment } from "@/actions/procurement";
import { Receipt, PackageCheck, Banknote, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentDialog } from "@/components/features/procurement/payment-dialog";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string, color: string }> = {
    pending: { label: "Pending", color: "bg-warning/15 text-warning border-warning/20" },
    partial: { label: "Partial", color: "bg-primary/15 text-primary border-primary/20" },
    received: { label: "Received", color: "bg-success/15 text-success border-success/20" },
    cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive border-destructive/20" },
  };
  const config = map[status] || map.pending;
  return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
};

export default async function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: purchase, error } = await supabase
    .from("purchases")
    .select(`
      *,
      manufacturers (*),
      warehouses (name, location),
      purchase_items (
        id, product_id, quantity, unit_cost, received_quantity,
        products (name, sku, unit)
      ),
      manufacturer_payments (
        id, amount, method, payment_date, reference_no, notes
      )
    `)
    .eq("id", id)
    .single();

  if (error || !purchase) {
    notFound();
  }

  const items = purchase.purchase_items || [];
  const payments = purchase.manufacturer_payments || [];
  const poNum = "PO-" + purchase.id.split("-")[0].toUpperCase();
  const balance = purchase.total_amount - (purchase.amount_paid || 0);

  // Mark all as received Action
  const receiveAllAction = async () => {
    "use server";
    const itemsToReceive = items.map((i: any) => ({
      id: i.id,
      quantity: i.quantity - i.received_quantity
    })).filter((i: any) => i.quantity > 0);
    
    if (itemsToReceive.length > 0) {
      await receivePurchaseItems(purchase.id, itemsToReceive);
      await updatePurchaseStatus(purchase.id, "received");
    }
  };

  return (
    <PageContainer
      title={`Purchase Order: ${poNum}`}
      description={`View and manage PO details for ${purchase.manufacturers?.name}`}
      action={
        <div className="flex items-center gap-2">
          <Link href="/procurement">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
          </Link>
          {purchase.status !== "received" && purchase.status !== "cancelled" && (
            <form action={receiveAllAction}>
              <Button type="submit"><PackageCheck className="mr-2 h-4 w-4"/> Receive All Items</Button>
            </form>
          )}
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* PO Highlights */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Line items ordered from supplier</CardDescription>
              </div>
              <StatusBadge status={purchase.status} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
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
                    <TableCell className="text-right">
                      {item.received_quantity}
                      {item.received_quantity < item.quantity && (
                        <Badge variant="outline" className="ml-2 bg-warning/10 text-warning text-[10px]">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">₱{item.unit_cost.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₱{(item.quantity * item.unit_cost).toLocaleString()}
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
              <CardTitle>PO Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-medium">{new Date(purchase.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium">{purchase.warehouses?.name}</span>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>₱{purchase.total_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Amount Paid</span>
                  <span>- ₱{purchase.amount_paid.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Balance Due</span>
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
                <CardTitle className="text-base">Payment History</CardTitle>
              </div>
              {balance > 0 && (
                <PaymentDialog purchaseId={purchase.id} balance={balance}>
                  <Button variant="outline" size="sm" className="h-8">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Pay
                  </Button>
                </PaymentDialog>
              )}
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No payments made yet
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
