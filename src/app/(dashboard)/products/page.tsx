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
          <ProductsClient initialProducts={products} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
