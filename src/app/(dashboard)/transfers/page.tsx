import { createClient } from "@/lib/supabase/server";
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
import { Plus, ArrowRightLeft } from "lucide-react";

export const metadata = { title: "Stock Transfers" };

export default async function TransfersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let transfers: {
    id: string;
    quantity: number;
    status: string;
    notes: string | null;
    created_at: string;
    from_warehouse: string;
    to_warehouse: string;
    product_name: string;
  }[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile?.company_id) {
      const { data } = await supabase
        .from("stock_transfers")
        .select(
          "id, quantity, status, notes, created_at, from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(name), to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(name), products(name)"
        )
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (data) {
        transfers = data.map((t) => ({
          id: t.id,
          quantity: t.quantity,
          status: t.status,
          notes: t.notes,
          created_at: t.created_at,
          from_warehouse: (t.from_warehouse && !Array.isArray(t.from_warehouse)) ? t.from_warehouse.name : "—",
          to_warehouse: (t.to_warehouse && !Array.isArray(t.to_warehouse)) ? t.to_warehouse.name : "—",
          product_name: (t.products && !Array.isArray(t.products)) ? t.products.name : "—",
        }));
      }
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-warning/15 text-warning border-warning/20",
    completed: "bg-success/15 text-success border-success/20",
    cancelled: "bg-destructive/15 text-destructive border-destructive/20",
  };

  return (
    <PageContainer
      title="Stock Transfers"
      description="Track movement of stock between warehouses"
      action={
        <Button id="add-transfer-btn">
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      }
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No transfers yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Transfer stock between your warehouses to keep inventory balanced.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      {t.product_name}
                    </TableCell>
                    <TableCell>{t.from_warehouse}</TableCell>
                    <TableCell>{t.to_warehouse}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {t.quantity}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[t.status] || ""}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
