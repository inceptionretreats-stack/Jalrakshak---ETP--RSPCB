"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, TrendingUp, TriangleAlert, OctagonX } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDataStore } from "@/lib/store/data";
import { STATUS_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
] as const;

export default function CompliancePage() {
  const compliance = useDataStore((s) => s.compliance);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    return [...compliance].sort((a, b) => b.score - a.score);
  }, [compliance]);

  const summary = useMemo(() => {
    const compliant = compliance.filter((c) => c.status === "compliant").length;
    const warning = compliance.filter((c) => c.status === "warning").length;
    const nonCompliant = compliance.filter((c) => c.status === "non-compliant").length;
    const avg = Math.round(compliance.reduce((s, c) => s + c.score, 0) / Math.max(1, compliance.length));
    return { compliant, warning, nonCompliant, avg };
  }, [compliance]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Compliance Scorecard"
        description="Every unit scored on submission discipline, alerts and treatment performance — green, amber or red at a glance."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6">
          <div className="shrink-0 text-center">
            <p className="font-display text-5xl font-bold leading-none" style={{ color: STATUS_COLOR[summary.avg >= 85 ? "compliant" : summary.avg >= 70 ? "warning" : "non-compliant"] }}>
              {summary.avg}%
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">cluster avg</p>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Cluster Compliance</h3>
            <p className="mt-1 text-sm text-muted-foreground">Average across all monitored units</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard icon={<ShieldCheck className="h-5 w-5" />} label="Compliant" value={summary.compliant} color="#10b981" hint="≥ 85%" />
          <SummaryCard icon={<TriangleAlert className="h-5 w-5" />} label="Warning" value={summary.warning} color="#f59e0b" hint="70–84%" />
          <SummaryCard icon={<OctagonX className="h-5 w-5" />} label="Non-Compliant" value={summary.nonCompliant} color="#ef4444" hint="< 70%" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f.key ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const color = STATUS_COLOR[c.status];
          return (
            <div key={c.industryId} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-foreground">{c.industryName}</p>
                  <p className="text-xs capitalize text-muted-foreground">{c.cetpId ?? "Individual ETP"}</p>
                </div>
                <StatusBadge status={c.status} dot={false} />
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="shrink-0 text-center">
                  <p className="font-display text-3xl font-bold leading-none" style={{ color }}>{c.score}%</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">score</p>
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <Row label="Submission" value={`${c.submissionRate}%`} />
                  <Row label="Alerts" value={String(c.alertCount)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, hint }: { icon: React.ReactNode; label: string; value: number; color: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}1f`, color }}>
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}
