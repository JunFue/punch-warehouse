import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: KpiCardProps) {
  return (
    <div className="group rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight animate-count-up">
            {value}
          </p>
          {(description || trendValue) && (
            <div className="flex items-center gap-2">
              {trendValue && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-success",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trend === "up" && "↑"}
                  {trend === "down" && "↓"}
                  {trendValue}
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            variantStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
