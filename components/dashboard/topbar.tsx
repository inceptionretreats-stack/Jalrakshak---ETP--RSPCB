"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, LogOut, ChevronDown, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarContent } from "./sidebar";
import { Icon } from "@/components/shared/icon";
import { useAuthStore, isAdmin } from "@/lib/store/auth";
import { useDataStore } from "@/lib/store/data";
import { ROLES } from "@/lib/constants";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function Topbar() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const industryId = useAuthStore((s) => s.industryId);
  const logout = useAuthStore((s) => s.logout);
  const alerts = useDataStore((s) => s.alerts);
  const industries = useDataStore((s) => s.industries);
  const hydrated = useHydrated();
  const roleMeta = ROLES.find((r) => r.id === role) ?? ROLES[0];
  const admin = isAdmin(role);
  const company = industries.find((i) => i.id === industryId);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === "active" && (admin || a.industryId === industryId)).length,
    [alerts, admin, industryId],
  );

  const signOut = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      {/* mobile nav */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[272px] border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* search */}
      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={admin ? "Search industries, readings, alerts…" : "Search your readings…"}
          className="h-9 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:inline-flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live · 24×7
        </span>

        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href={admin ? "/dashboard/alerts" : "/dashboard"} aria-label="Alerts">
            <Bell className="h-5 w-5" />
            {hydrated && activeAlerts > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {activeAlerts}
              </span>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 transition-colors hover:border-primary/40">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ background: roleMeta.accent }}
              >
                <Icon name={roleMeta.icon} className="h-4 w-4" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[160px] truncate text-xs font-semibold leading-tight text-foreground">
                  {admin ? roleMeta.name : company?.name ?? roleMeta.name}
                </span>
                <span className="block text-[10px] leading-tight text-muted-foreground">
                  {admin ? "Monitoring Body" : `${roleMeta.name} Panel`}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{admin ? roleMeta.name : company?.name ?? roleMeta.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{admin ? roleMeta.scope : company?.area ?? roleMeta.scope}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <UserCog className="h-4 w-4" />
                Switch role
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
