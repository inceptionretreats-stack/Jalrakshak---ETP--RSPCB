import Link from "next/link";
import { JalRakshakLogo } from "@/components/shared/logo";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "ETP Units", href: "#etp" },
      { label: "Command Center", href: "#platform" },
      { label: "Enter Platform", href: "/login" },
    ],
  },
  {
    title: "Monitoring",
    links: [
      { label: "Individual ETP", href: "/login" },
      { label: "Water Balance", href: "/login" },
      { label: "Daily Entry", href: "/login" },
      { label: "Water Recovery", href: "/login" },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Compliance", href: "/login" },
      { label: "Approvals", href: "/login" },
      { label: "Alerts", href: "/login" },
      { label: "Reports", href: "/login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <JalRakshakLogo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              An initiative by the Rajasthan State Pollution Control Board — Balotra,
              for smart textile wastewater monitoring &amp; environmental compliance.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Rajasthan State Pollution Control Board · Balotra. Demonstration prototype.</p>
          <p className="rounded-full bg-amber-500/10 px-3 py-1 font-medium text-amber-600 dark:text-amber-400">
            Demo only — mock data, no real submissions.
          </p>
        </div>
      </div>
    </footer>
  );
}
