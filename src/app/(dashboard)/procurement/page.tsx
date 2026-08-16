import { getPurchases } from "@/actions/procurement";
import { getManufacturers } from "@/actions/manufacturers";
import { getWarehouses } from "@/actions/warehouses";
import { getProducts } from "@/actions/products";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProcurementClient } from "@/components/features/procurement/procurement-client";

export const metadata = { title: "Procurement" };

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
    >
      <Card className="border-border/50 relative">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Purchase Orders</CardTitle>
          <div className="relative w-64 mr-32">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search purchases..." className="pl-9" id="search-purchases" />
          </div>
        </CardHeader>
        <CardContent>
          <ProcurementClient 
            initialPurchases={purchases} 
            manufacturers={manufacturers} 
            warehouses={warehouses} 
            products={products} 
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
