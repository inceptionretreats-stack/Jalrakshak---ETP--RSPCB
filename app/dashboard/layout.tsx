import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-dash">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
