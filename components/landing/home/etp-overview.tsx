"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Gauge, Droplets, Recycle, Factory } from "lucide-react";
import { industries } from "@/lib/data/seed";
import { formatNumber } from "@/lib/utils";
import { SectionReveal } from "@/components/shared/section-reveal";

const ACCENTS = [
  { from: "#0d9488", to: "#06b6d4", ring: "ring-teal-400/40" },
  { from: "#0ea5e9", to: "#2563eb", ring: "ring-sky-400/40" },
  { from: "#059669", to: "#10b981", ring: "ring-emerald-400/40" },
];

export function EtpUnitsOverview() {
  const etpUnits = industries.filter((i) => i.isIndividualETP);
  return (
    <section id="etp" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionReveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Individual Effluent Treatment Plants</span>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Every ETP unit. One transparent network.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Real-time water balance, recovery and compliance monitoring for textile
          units running their own Effluent Treatment Plant across the Balotra cluster.
        </p>
      </SectionReveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {etpUnits.map((unit, i) => {
          const a = ACCENTS[i % ACCENTS.length];
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-2xl hover:ring-1 ${a.ring}`}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: `radial-gradient(circle, ${a.to}, transparent 70%)` }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                  >
                    <Factory className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-foreground">{unit.name}</h3>
                  <p className="text-sm text-muted-foreground">{unit.area}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold" style={{ color: a.from }}>
                    {unit.complianceScore}%
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Compliance</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
                <Stat icon={<Gauge className="h-4 w-4" />} value={formatNumber(unit.permittedKLD)} label="KLD" />
                <Stat icon={<Droplets className="h-4 w-4" />} value={formatNumber(unit.etpCapacity)} label="ETP" />
                <Stat icon={<Recycle className="h-4 w-4" />} value={formatNumber(unit.roCapacity)} label="RO" />
              </div>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
              >
                Explore unit
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-center text-muted-foreground">{icon}</div>
      <div className="mt-1 font-display text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
