"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";
import { formatNumber, compactNumber } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  className?: string;
  startOnView?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  compact = false,
  className,
  startOnView = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);

  useEffect(() => {
    if (startOnView && !inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (!ref.current) return;
        const num = compact
          ? compactNumber(latest)
          : formatNumber(latest, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        ref.current.textContent = `${prefix}${num}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals, prefix, suffix, compact, startOnView, mv]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {compact ? compactNumber(0) : formatNumber(0, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
