"use client";

import { motion, type Variant, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "article";
}

export function SectionReveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: SectionRevealProps) {
  const hidden: Variant = { opacity: 0, y };
  const visible: Variant = {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={{ hidden, visible }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container for revealing children in sequence. */
export function StaggerReveal({
  children,
  className,
  stagger = 0.12,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={{ visible: { transition: { staggerChildren: stagger } }, hidden: {} }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
