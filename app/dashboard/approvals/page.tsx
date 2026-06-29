"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ImageIcon, ImageOff, Camera } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApprovalTimeline } from "@/components/dashboard/approval-timeline";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/data";
import { useAuthStore } from "@/lib/store/auth";
import { ALERT_META, ROLES } from "@/lib/constants";
import { formatNumber, formatDate, cn } from "@/lib/utils";

const TABS = [
  { key: "queue", label: "Queue" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

export default function ApprovalsPage() {
  const approvals = useDataStore((s) => s.approvals);
  const decide = useDataStore((s) => s.decideApproval);
  const role = useAuthStore((s) => s.role);
  const reviewer = (ROLES.find((r) => r.id === role)?.name) ?? "Inspector";
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("queue");

  const filtered = useMemo(() => {
    const sorted = [...approvals].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    if (tab === "queue") return sorted.filter((a) => a.stage === "submitted" || a.stage === "verification");
    if (tab === "approved") return sorted.filter((a) => a.stage === "approved");
    if (tab === "rejected") return sorted.filter((a) => a.stage === "rejected");
    return sorted;
  }, [approvals, tab]);

  const counts = useMemo(
    () => ({
      queue: approvals.filter((a) => a.stage === "submitted" || a.stage === "verification").length,
      approved: approvals.filter((a) => a.stage === "approved").length,
      rejected: approvals.filter((a) => a.stage === "rejected").length,
    }),
    [approvals],
  );

  const handle = (id: string, name: string, decision: "approved" | "rejected") => {
    decide(id, decision, reviewer);
    toast[decision === "approved" ? "success" : "error"](
      decision === "approved" ? "Reading approved" : "Reading rejected",
      { description: `${name} · by ${reviewer}` },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Approval Workflow"
        description="Verify submitted readings against photos, differences and auto-raised alerts before they enter the compliance record."
      />

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
            {t.key !== "all" && (
              <span className="rounded-full bg-current/15 px-1.5 text-xs font-bold">
                {t.key === "queue" ? counts.queue : t.key === "approved" ? counts.approved : counts.rejected}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((a) => {
            const decided = a.stage === "approved" || a.stage === "rejected";
            return (
              <motion.div
                layout
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-foreground">{a.industryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.meterPoint} · {formatDate(a.submittedAt, true)}
                    </p>
                  </div>
                  <StatusBadge status={a.stage} />
                </div>

                {/* reading photo + difference */}
                <div className="mt-4 flex items-stretch gap-3">
                  <div className={cn("flex h-20 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border", a.hasPhoto ? "border-border bg-muted/40 text-muted-foreground" : "border-dashed border-amber-500/40 bg-amber-500/5 text-amber-400")}>
                    {a.hasPhoto ? <ImageIcon className="h-6 w-6" /> : <ImageOff className="h-6 w-6" />}
                    <span className="text-[10px] font-medium">{a.hasPhoto ? "Photo" : "No photo"}</span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center rounded-xl border border-border bg-muted/30 px-4">
                    <p className="text-xs text-muted-foreground">Difference</p>
                    <p className="font-mono text-2xl font-bold text-primary">
                      {formatNumber(a.difference)} <span className="text-sm font-medium text-muted-foreground">{a.unit}</span>
                    </p>
                  </div>
                </div>

                {/* alerts */}
                {a.alerts.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.alerts.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `${ALERT_META[t].color}1a`, color: ALERT_META[t].color }}>
                        <Icon name={ALERT_META[t].icon} className="h-3 w-3" />
                        {ALERT_META[t].label}
                      </span>
                    ))}
                  </div>
                )}

                {a.remarks && <p className="mt-3 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">“{a.remarks}”</p>}

                {/* timeline */}
                <div className="mt-4 border-t border-border pt-4">
                  <ApprovalTimeline steps={a.timeline} />
                </div>

                {/* actions */}
                {!decided ? (
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => handle(a.id, a.industryName, "approved")} className="h-10 flex-1 gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90">
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button onClick={() => handle(a.id, a.industryName, "rejected")} variant="outline" className="h-10 flex-1 gap-1.5 rounded-xl border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400">
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {a.stage === "approved" ? "Approved" : "Rejected"} by{" "}
                    <span className="font-semibold text-foreground">{a.reviewer}</span> · {formatDate(a.reviewedAt, true)}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <Camera className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nothing here — the queue is clear.</p>
        </div>
      )}
    </div>
  );
}
