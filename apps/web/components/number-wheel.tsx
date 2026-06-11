"use client";

import { motion } from "motion/react";

/**
 * Slot-machine number: each digit column spins through 0-9 a couple of
 * times on mount, then lands on the target digit, staggered left to right.
 */
export function NumberWheel({ value, className }: { value: number; className?: string }) {
  const digits = String(Math.max(0, Math.floor(value))).split("").map(Number);
  return (
    <span
      aria-label={String(value)}
      className={`inline-flex leading-none tabular-nums ${className ?? ""}`}
      style={{ height: "1em" }}
    >
      {digits.map((digit, i) => (
        <Digit key={`${digits.length}-${i}`} digit={digit} delay={i * 0.1} />
      ))}
    </span>
  );
}

const CYCLES = 2;

function Digit({ digit, delay }: { digit: number; delay: number }) {
  const steps = CYCLES * 10 + digit;
  const strip = Array.from({ length: steps + 1 }, (_, i) => i % 10);
  return (
    <span aria-hidden className="inline-block overflow-hidden" style={{ height: "1em" }}>
      <motion.span
        className="flex flex-col"
        initial={{ y: "0em" }}
        animate={{ y: `-${steps}em` }}
        transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {strip.map((n, i) => (
          <span key={i} className="flex items-center justify-center" style={{ height: "1em" }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
