import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Warehouse as WarehouseIcon, MapPin, Package, Edit2 } from "lucide-react";
import { WarehouseDialog } from "@/components/features/inventory/warehouse-dialog";

export const metadata = { title: "Warehouses" };

export default async function WarehousesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let warehouses: {
    id: string;
    name: string;
    location: string;
    is_active: boolean;
  }[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile?.company_id) {
      const { data } = await supabase
        .from("warehouses")
        .select("id, name, location, is_active")
        .eq("company_id", profile.company_id)
        .order("name");

      if (data) warehouses = data;
    }
  }

  return (
    <PageContainer
      title="Warehouses"
      description="Manage your storage locations"
      action={
        <WarehouseDialog>
          <Button id="add-warehouse-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </WarehouseDialog>
      }
    >
      {warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <WarehouseIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No warehouses yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Add your first warehouse to start tracking inventory across locations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <Card
              key={warehouse.id}
              className="group border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <WarehouseIcon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        warehouse.is_active
                          ? "bg-success/15 text-success border-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {warehouse.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <WarehouseDialog warehouse={warehouse}>
                      <button className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Edit Warehouse">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </WarehouseDialog>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{warehouse.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {warehouse.location}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/30 pt-3">
                  <Package className="h-3.5 w-3.5" />
                  <span>Click to view stock</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
