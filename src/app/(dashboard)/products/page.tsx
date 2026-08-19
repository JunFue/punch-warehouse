import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductsClient } from "@/components/features/products/products-client";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let products: any[] = [];
  let manufacturers: { id: string; name: string }[] = [];
  let warehouses: { id: string; name: string }[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile?.company_id) {
      const [productsRes, mfgRes, whRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, sku, unit, unit_price, description, manufacturer_id, warehouse_stock(quantity)")
          .eq("company_id", profile.company_id)
          .order("name"),
        supabase
          .from("manufacturers")
          .select("id, name")
          .eq("company_id", profile.company_id)
          .order("name"),
        supabase
          .from("warehouses")
          .select("id, name")
          .eq("company_id", profile.company_id)
          .eq("is_active", true)
          .order("name")
      ]);

      if (productsRes.data) {
        products = productsRes.data.map(p => {
          // @ts-ignore - warehouse_stock is an array from the joined query
          const totalStock = p.warehouse_stock?.reduce((sum, stock) => sum + (Number(stock.quantity) || 0), 0) || 0;
          return {
            ...p,
            current_stock: totalStock
          };
        });
      }
      
      if (mfgRes.data) manufacturers = mfgRes.data;
      if (whRes.data) warehouses = whRes.data;
    }
  }

  return (
    <PageContainer
      title="Products"
      description="Manage your product catalog"
    >
      <Card className="border-border/50 relative">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Product Catalog</CardTitle>
          <div className="relative w-64 mr-32">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9" id="search-products" />
          </div>
        </CardHeader>
        <CardContent>
          <ProductsClient 
            initialProducts={products} 
            manufacturers={manufacturers}
            warehouses={warehouses}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
