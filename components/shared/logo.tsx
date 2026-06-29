import { cn } from "@/lib/utils";

export function JalRakshakLogo({
  className,
  size = 36,
  showText = true,
  tone = "auto",
}: {
  className?: string;
  size?: number;
  showText?: boolean;
  tone?: "auto" | "light" | "dark";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-xl"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 48 48" width={size} height={size} className="drop-shadow-sm" aria-hidden>
          <defs>
            <linearGradient id="jr-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#jr-grad)" />
          {/* shield */}
          <path
            d="M24 11l9 3.4v7.2c0 6.1-3.9 10.7-9 12.4-5.1-1.7-9-6.3-9-12.4v-7.2L24 11z"
            fill="rgba(255,255,255,0.16)"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.4"
          />
          {/* water drop */}
          <path
            d="M24 18c2.8 3.1 4.4 5.6 4.4 8.1A4.4 4.4 0 0124 30.5a4.4 4.4 0 01-4.4-4.4c0-2.5 1.6-5 4.4-8.1z"
            fill="#ffffff"
          />
          {/* wave */}
          <path d="M17 32c2.3 1.6 4.7 1.6 7 0s4.7-1.6 7 0" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.9" />
        </svg>
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[15px] font-extrabold tracking-tight",
              tone === "light" && "text-white",
              tone === "dark" && "text-slate-900",
              tone === "auto" && "text-foreground",
            )}
          >
            JalRakshak
          </span>
          <span
            className={cn(
              "text-[9.5px] font-semibold uppercase tracking-[0.18em]",
              tone === "light" ? "text-white/70" : "text-primary",
            )}
          >
            RSPCB · Balotra
          </span>
        </span>
      )}
    </div>
  );
}
