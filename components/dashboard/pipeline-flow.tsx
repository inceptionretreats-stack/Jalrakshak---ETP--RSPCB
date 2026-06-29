"use client";

import { motion } from "framer-motion";
import { Droplets, Waves, Recycle, Zap } from "lucide-react";
import type { FlowNode } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS: Record<string, { color: string; label: string }> = {
  normal: { color: "#6366f1", label: "Normal" },
  warning: { color: "#f59e0b", label: "Watch" },
  critical: { color: "#ef4444", label: "Critical" },
};

const TYPE_ICON = { raw: Droplets, treatment: Waves, recovery: Recycle, energy: Zap };

export function PipelineFlow({ flow }: { flow: FlowNode[] }) {
  const maxVal = Math.max(...flow.map((n) => n.value)) || 1; // guard all-zero flows (avoid NaN%)

  return (
    <div className="relative">
      {flow.map((node, i) => {
        const s = STATUS[node.status];
        const TypeIcon = TYPE_ICON[node.type] ?? Waves;
        const pct = Math.round((node.value / maxVal) * 100);
        const isLast = i === flow.length - 1;

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex gap-3 pb-4 last:pb-0 sm:gap-4"
          >
            {/* rail */}
            <div className="relative flex w-10 flex-col items-center sm:w-12">
              <span
                className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl ring-2 ring-inset sm:h-12 sm:w-12"
                style={{
                  background: `${s.color}1a`,
                  color: s.color,
                  boxShadow: `0 0 22px -6px ${s.color}`,
                }}
              >
                <TypeIcon className="h-5 w-5" />
              </span>

              {!isLast && (
                <div className="relative mt-1 w-1.5 flex-1 overflow-hidden rounded-full" style={{ background: `${s.color}22` }}>
                  {/* flowing gradient */}
                  <div
                    className="absolute inset-0 motion-safe:animate-[flow-bg-down_0.9s_linear_infinite]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(180deg, ${s.color}00 0px, ${s.color}88 6px, ${s.color}00 12px)`,
                      backgroundSize: "100% 22px",
                    }}
                  />
                  {/* droplets */}
                  {[0, 0.45, 0.9].map((d, k) => (
                    <span
                      key={k}
                      className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full motion-safe:animate-[flow-down_1.5s_linear_infinite]"
                      style={{ background: s.color, boxShadow: `0 0 8px ${s.color}`, animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* node card */}
            <div className="flex-1 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    Stage {i + 1}
                  </p>
                  <h4 className="font-display text-base font-bold text-foreground">{node.label}</h4>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ background: `${s.color}1a`, color: s.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div className="font-mono text-xl font-bold text-foreground sm:text-2xl">
                  {formatNumber(node.value)}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">{node.unit}</span>
                </div>
                <span className="text-xs text-muted-foreground">{pct}% of inlet</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
