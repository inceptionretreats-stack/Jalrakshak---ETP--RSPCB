"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalRakshakLogo } from "@/components/shared/logo";
import { useScrolled } from "@/lib/hooks/use-capabilities";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "ETP Units", href: "#etp" },
  { label: "Platform", href: "#platform" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-500",
        scrolled
          ? "border-border/70 bg-background/80 py-2.5 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/70 py-3 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <JalRakshakLogo tone="auto" />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Enter Platform
            </Link>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-4 mt-2 rounded-2xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur-xl lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              {l.label}
            </a>
          ))}
          <Button asChild className="mt-2 w-full rounded-lg">
            <Link href="/login">Enter Platform</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
