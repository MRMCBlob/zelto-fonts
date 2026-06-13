"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";

/** Shared micro-interaction props for clickable elements. */
export const pressable = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 28 },
} as const;

export const MotionLink = motion.create(Link);
export const MotionA = motion.a;
export const MotionButton = motion.button;
export const MotionDiv = motion.div;

/**
 * Reveal-on-enter wrapper. Fades + slides its children up the first time they
 * scroll into view (and immediately for anything already on screen, e.g. the
 * hero). Use `delay` to stagger a sequence. Honours reduced-motion via motion's
 * global config — falls back to a plain block when disabled.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span" | "p";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
