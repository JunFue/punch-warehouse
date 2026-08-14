"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ArrowRightLeft,
  Factory,
  ShoppingCart,
  Truck,
  Users,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    section: "main",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    section: "inventory",
  },
  {
    label: "Warehouses",
    href: "/warehouses",
    icon: Warehouse,
    section: "inventory",
  },
  {
    label: "Transfers",
    href: "/transfers",
    icon: ArrowRightLeft,
    section: "inventory",
  },
  {
    label: "Manufacturers",
    href: "/manufacturers",
    icon: Factory,
    section: "procurement",
  },
  {
    label: "Purchases",
    href: "/procurement",
    icon: ShoppingCart,
    section: "procurement",
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Users,
    section: "deliveries",
  },
  {
    label: "Deliveries",
    href: "/deliveries",
    icon: Truck,
    section: "deliveries",
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: Receipt,
    section: "finance",
  },
];

const sections: Record<string, string> = {
  main: "",
  inventory: "Inventory",
  procurement: "Procurement",
  deliveries: "Sales",
  finance: "Finance",
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  let lastSection = "";

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Package className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sidebar-foreground tracking-tight animate-fade-in">
            Punch
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          // Render section label
          let sectionLabel = null;
          if (
            item.section !== lastSection &&
            sections[item.section]
          ) {
            lastSection = item.section;
            if (!collapsed) {
              sectionLabel = (
                <p
                  key={`section-${item.section}`}
                  className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40"
                >
                  {sections[item.section]}
                </p>
              );
            } else {
              sectionLabel = (
                <div key={`section-${item.section}`} className="my-2 mx-3 h-px bg-sidebar-border" />
              );
            }
          } else {
            lastSection = item.section;
          }

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary/15 text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                )}
              />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );

          const wrappedLink = collapsed ? (
            <TooltipProvider key={item.href} delay={0}>
              <Tooltip>
                <TooltipTrigger>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            linkContent
          );

          return (
            <div key={item.href}>
              {sectionLabel}
              {wrappedLink}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
