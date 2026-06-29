"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, PanelLeftClose } from "lucide-react";
import { JalRakshakLogo } from "@/components/shared/logo";
import { Icon } from "@/components/shared/icon";
import { DASHBOARD_NAV } from "@/lib/constants";
import { useUIStore } from "@/lib/store/ui";
import { useAuthStore } from "@/lib/store/auth";
import type { RoleId } from "@/lib/types";
import { cn } from "@/lib/utils";

const GROUP_ORDER = ["Overview", "Monitoring", "Governance"];

function groupNav(role: RoleId | null) {
  const visible = DASHBOARD_NAV.filter((item) => !role || item.roles.includes(role));
  const groups: Record<string, typeof DASHBOARD_NAV> = {};
  for (const item of visible) {
    const g = item.group ?? "Other";
    (groups[g] ??= []).push(item);
  }
  return GROUP_ORDER.filter((g) => groups[g]).map((g) => ({ group: g, items: groups[g] }));
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarContent({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const groups = groupNav(role);

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        {collapsed ? <JalRakshakLogo showText={false} size={34} /> : <JalRakshakLogo />}
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {groups.map(({ group, items }) => (
          <div key={group} className="mb-5">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group}
              </p>
            )}
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-primary/12 text-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-2")}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {!collapsed && "Back to site"}
        </Link>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar backdrop-blur-xl transition-[width] duration-300 lg:block",
        collapsed ? "w-[76px]" : "w-[264px]",
      )}
    >
      <SidebarContent collapsed={collapsed} />
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary"
        aria-label="Toggle sidebar"
      >
        <PanelLeftClose className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
