import Image from "next/image";
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
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src="/rspcb-logo.jpeg"
          alt="RSPCB JalRakshak"
          width={size}
          height={size}
          className="h-full w-full object-contain p-0.5"
          priority
        />
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
