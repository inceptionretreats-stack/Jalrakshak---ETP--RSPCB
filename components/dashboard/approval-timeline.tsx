"use client";

import { Check, Send, Search, X } from "lucide-react";
import type { ApprovalStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = { submitted: Send, verification: Search, approved: Check, rejected: X };

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const Icon = ICONS[step.stage] ?? Check;
        const rejected = step.stage === "rejected";
        const done = step.done;
        const color = rejected ? "#f87171" : done ? "#22d3ee" : "#475569";
        return (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center text-center">
              <span
                className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-inset transition-colors")}
                style={{ background: done ? `${color}1f` : "transparent", color, borderColor: color, boxShadow: done ? `0 0 14px -3px ${color}` : "none" }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span className="mt-1.5 whitespace-nowrap text-[10px] font-medium" style={{ color: done ? "var(--foreground)" : "var(--muted-foreground)" }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-1 h-0.5 flex-1 rounded-full" style={{ background: steps[i + 1].done ? "#22d3ee" : "var(--border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
