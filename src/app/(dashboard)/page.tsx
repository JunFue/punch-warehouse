import { getDashboardMetrics } from "@/actions/dashboard";
import { PageContainer } from "@/components/layout/page-container";
import { KpiCard } from "@/components/features/dashboard/kpi-card";
import { RevenueChart } from "@/components/features/dashboard/revenue-chart";
import { InventoryChart } from "@/components/features/dashboard/inventory-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  Banknote,
  AlertTriangle,
  Truck,
  ShoppingCart,
  Users
} from "lucide-react";

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function DashboardPage() {
  const { data: metrics, error } = await getDashboardMetrics();

  if (error || !metrics) {
    return (
      <PageContainer title="Dashboard" description="Overview of your business operations">
        <div className="py-12 text-center text-muted-foreground border rounded-xl bg-muted/20">
          Failed to load dashboard metrics. Please check your connection.
        </div>
      </PageContainer>
    );
  }

  const {
    productsCount,
    clientsCount,
    unreceivedPurchases,
    activeDeliveries,
    accountsPayable,
    accountsReceivable,
    recentPurchases,
    recentDeliveries
  } = metrics;

  const statusColors: Record<string, string> = {
    pending: "bg-warning/15 text-warning border-warning/20",
    partial: "bg-chart-4/15 text-chart-4 border-chart-4/20",
    received: "bg-success/15 text-success border-success/20",
    delivered: "bg-success/15 text-success border-success/20",
    in_transit: "bg-primary/15 text-primary border-primary/20",
    cancelled: "bg-destructive/15 text-destructive border-destructive/20",
  };

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your business operations"
    >
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Manufacturer Payable"
          value={formatCurrency(accountsPayable)}
          description="Total owed to suppliers"
          icon={TrendingDown}
          variant="destructive"
        />
        <KpiCard
          title="Accounts Receivable"
          value={formatCurrency(accountsReceivable)}
          description="Outstanding client payments"
          icon={Banknote}
          variant="success"
        />
        <KpiCard
          title="Active Dispatch"
          value={String(activeDeliveries)}
          description="Deliveries in pending or transit"
          icon={Truck}
          variant="warning"
        />
        <KpiCard
          title="Active Clients"
          value={String(clientsCount)}
          description="Total active client organizations"
          icon={Users}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Inventory Distribution</CardTitle>
            <CardDescription>Stock levels by warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Deliveries */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Recent Deliveries</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No deliveries yet
              </p>
            ) : (
              recentDeliveries.map((d: any) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{d.clients?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(d.total_amount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={statusColors[d.status] || ""}
                    >
                      {d.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Recent Purchases</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No purchases yet
              </p>
            ) : (
              recentPurchases.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.manufacturers?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(p.total_amount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={statusColors[p.status] || ""}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
