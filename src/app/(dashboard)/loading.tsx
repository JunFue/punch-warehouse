import { PageContainer } from "@/components/layout/page-container";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardGlobalLoading() {
  return (
    <PageContainer
      title=""
      description=""
    >
      <div className="absolute top-8 left-8 space-y-2">
        <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-4 w-64 rounded-md bg-muted/40 animate-pulse" />
      </div>

      <Card className="border-border/50 relative mt-6 h-[600px] overflow-hidden flex flex-col items-center justify-center bg-card/40">
         <div className="flex flex-col items-center gap-4 opacity-50 mix-blend-luminosity">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground animate-pulse">Loading Workspace</p>
         </div>
      </Card>
    </PageContainer>
  );
}
