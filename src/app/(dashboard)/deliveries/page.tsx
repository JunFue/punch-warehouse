import { getDeliveries } from "@/actions/deliveries";
import { getClients } from "@/actions/clients";
import { getWarehouses } from "@/actions/warehouses";
import { getProducts } from "@/actions/products";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeliveriesClient } from "@/components/features/deliveries/deliveries-client";

export const metadata = { title: "Deliveries" };

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
    >
      <Card className="border-border/50 relative">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Outbound Orders</CardTitle>
          <div className="relative w-64 mr-32">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search deliveries..." className="pl-9" id="search-deliveries" />
          </div>
        </CardHeader>
        <CardContent>
          <DeliveriesClient 
            initialDeliveries={deliveries} 
            clients={clients} 
            warehouses={warehouses} 
            products={products} 
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
