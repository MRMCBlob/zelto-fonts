"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { Font } from "@zelto/registry";
import { FontCard } from "@/components/font-card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "sans", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
  { value: "display", label: "Display" },
];

const FEATURE_OPTIONS = [
  { value: "any", label: "Anything" },
  { value: "variable", label: "Variable axes" },
  { value: "italics", label: "Italics" },
  { value: "ligatures", label: "Ligatures" },
  { value: "extended-charset", label: "Extended charset" },
  { value: "nerd-font", label: "Nerd Font" },
  { value: "rtl", label: "RTL support" },
];

function hasFeature(font: Font, feature: string): boolean {
  if (feature === "any") return true;
  if (feature === "variable") return font.variable;
  if (feature === "italics") return font.styles.includes("italic");
  return (font.features ?? []).includes(feature as NonNullable<Font["features"]>[number]);
}

export function Catalog({ fonts }: { fonts: Font[] }) {
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [size, setSize] = useState(56);
  const [category, setCategory] = useState("all");
  const [feature, setFeature] = useState("any");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fonts.filter((font) => {
      if (q !== "" && !`${font.displayName} ${font.name} ${font.designer}`.toLowerCase().includes(q)) {
        return false;
      }
      if (category !== "all" && font.category !== category) return false;
      return hasFeature(font, feature);
    });
  }, [fonts, query, category, feature]);

  return (
    <section id="fonts" className="mx-auto max-w-screen-xl px-4 sm:px-6">
      <h2 className="sr-only">Font catalog</h2>
      <div className="sticky top-16 z-40 -mx-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3">
          {/* Airbnb-style segmented search bar */}
          <div className="flex items-stretch divide-x divide-border border border-border bg-card shadow-card">
            <Segment label="Search" className="flex-[1.2]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fonts…"
                className="w-full bg-transparent text-sm text-foreground outline-none ring-ring/50 focus-visible:ring-2 placeholder:text-muted-foreground"
              />
            </Segment>
            <Segment label="Preview text" className="hidden flex-[1.2] md:flex">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your own text…"
                className="w-full bg-transparent text-sm text-foreground outline-none ring-ring/50 focus-visible:ring-2 placeholder:text-muted-foreground"
              />
            </Segment>
            <Segment label="Type" className="flex-1">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-transparent dark:hover:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Segment>
            <Segment label="Features" className="flex-1">
              <Select value={feature} onValueChange={setFeature}>
                <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-transparent dark:hover:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Segment>
            <div className="flex items-center px-3 py-2">
              <motion.button
                type="button"
                aria-label="Search fonts"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}
                className="flex size-10 items-center justify-center bg-brand text-brand-foreground"
              >
                <MagnifyingGlassIcon className="size-4" weight="bold" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Size</span>
            <div className="w-48">
              <Slider
                value={[size]}
                onValueChange={([v]) => setSize(v ?? 56)}
                min={16}
                max={120}
                step={1}
                aria-label="Preview size"
              />
            </div>
            <span className="w-10 text-right font-mono text-xs text-muted-foreground">{size}px</span>
          </div>
        </div>
      </div>

      <div id="results" className="grid grid-cols-1 gap-4 py-10">
        {filtered.map((font) => (
          <FontCard key={font.name} font={font} text={text} size={size} />
        ))}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 border border-border bg-card p-16 text-center">
            <p className="text-sm text-muted-foreground">No fonts match those filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setFeature("any");
              }}
              className="font-mono text-xs text-brand underline-offset-4 hover:underline"
            >
              reset filters
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Segment({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col justify-center gap-0.5 px-4 py-2 ${className ?? ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
