import { getPurchases } from "@/actions/procurement";
import { getManufacturers } from "@/actions/manufacturers";
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
import { Plus, Search, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PurchaseDialog } from "@/components/features/procurement/purchase-dialog";
import Link from "next/link";

export const metadata = { title: "Procurement" };

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

export default async function ProcurementPage() {
  const [purchasesRes, manufacturersRes, warehousesRes, productsRes] = await Promise.all([
    getPurchases(),
    getManufacturers(),
    getWarehouses(),
    getProducts()
  ]);

  const purchases = purchasesRes.data || [];
  const manufacturers = (manufacturersRes.data || []).map(m => ({ id: m.id, name: m.name }));
  const warehouses = (warehousesRes.data || []).filter(w => w.is_active).map(w => ({ id: w.id, name: w.name }));
  const products = (productsRes.data || []).map(p => ({ id: p.id, name: p.name, unit_price: p.unit_price }));

  return (
    <PageContainer
      title="Procurement"
      description="Manage inbound purchase orders and deliveries"
      action={
        <PurchaseDialog manufacturers={manufacturers} warehouses={warehouses} products={products}>
          <Button id="add-purchase-btn">
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </PurchaseDialog>
      }
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Purchase Orders</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search purchases..." className="pl-9" id="search-purchases" />
          </div>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
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
                {/* 
                   Render map here. We map to simple PO display.
                   Using the ID split for pseudo PO number if wanted, or just ID.
                */}
                {purchases.map((purchase: any) => {
                  const balance = purchase.total_amount - (purchase.amount_paid || 0);
                  const poNum = "PO-" + purchase.id.split("-")[0].toUpperCase();
                  
                  return (
                    <TableRow key={purchase.id} className="hover:bg-muted/50 cursor-pointer group">
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
                        <Link href={`/procurement/${purchase.id}`}>
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
