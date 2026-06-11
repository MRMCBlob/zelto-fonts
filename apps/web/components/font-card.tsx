"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { Font } from "@zelto/registry";
import { Badge } from "@/components/ui/badge";
import { previewFamily } from "@/lib/preview";

const MotionCardLink = motion.create(Link);

const CATEGORY_LABELS: Record<string, string> = {
  sans: "Sans",
  serif: "Serif",
  mono: "Mono",
  display: "Display",
};

export function FontCard({ font, text, size }: { font: Font; text: string; size: number }) {
  const preview = text.trim() === "" ? font.displayName : text;

  return (
    <MotionCardLink
      href={`/fonts/${font.name}`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group flex flex-col gap-6 border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h3 className="text-sm font-medium text-foreground">{font.displayName}</h3>
          <span className="text-xs text-muted-foreground">{font.designer}</span>
        </div>
        <Badge variant="secondary" className="font-mono text-[11px] font-normal text-muted-foreground">
          {CATEGORY_LABELS[font.category] ?? font.category}
        </Badge>
      </div>
      <p
        className="min-h-20 break-words leading-[1.15] text-foreground"
        style={{ fontFamily: previewFamily(font.name, font.fallback), fontSize: `${size}px` }}
      >
        {preview}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">
          {font.variable ? "variable" : `${font.weights.length} weights`}
          {font.styles.includes("italic") ? " · italics" : ""}
        </span>
        <span className="font-mono transition-colors group-hover:text-brand">
          npx zelto-fonts add {font.name} →
        </span>
      </div>
    </MotionCardLink>
  );
}
