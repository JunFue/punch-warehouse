"use client";

import { signOut } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useTransition } from "react";

interface HeaderProps {
  user: {
    email?: string;
    fullName?: string;
    companyName?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {user?.companyName || "Punch Warehouse"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Inventory & Delivery Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Currency badge */}
        <div className="hidden sm:flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          ₱ PHP
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted outline-none"
            id="user-menu-trigger"
          >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem id="menu-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem id="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                id="menu-signout"
                disabled={isPending}
                onClick={() => startTransition(() => { signOut() })}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? "Signing out..." : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
