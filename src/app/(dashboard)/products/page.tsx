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
import { Plus, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ProductDialog } from "@/components/features/inventory/product-dialog";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let products: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    unit_price: number;
    description: string | null;
  }[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile?.company_id) {
      const { data } = await supabase
        .from("products")
        .select("id, name, sku, unit, unit_price, description")
        .eq("company_id", profile.company_id)
        .order("name");

      if (data) products = data;
    }
  }

  return (
    <PageContainer
      title="Products"
      description="Manage your product catalog"
      action={
        <ProductDialog>
          <Button id="add-product-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </ProductDialog>
      }
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Product Catalog</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" id="search-products" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No products yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Start by adding your first product to the catalog. Products can be assigned to warehouses and used in deliveries.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {product.sku}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₱{product.unit_price.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <ProductDialog product={product}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          Edit
                        </Button>
                      </ProductDialog>
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
