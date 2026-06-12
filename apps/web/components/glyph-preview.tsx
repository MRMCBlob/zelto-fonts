"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Font } from "@zelto/registry";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { previewFamily } from "@/lib/preview";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");
const NUMERALS = "0123456789".split("");
const PUNCTUATION = ".,:;!?'\"`«»‹›…·".split("");
const SYMBOLS = "@#$%^&*()[]{}<>/\\|-_=+~".split("");

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

const DIGIT_NAMES = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

const PUNCT_NAMES: Record<string, string> = {
  ".": "Full Stop",
  ",": "Comma",
  ":": "Colon",
  ";": "Semicolon",
  "!": "Exclamation Mark",
  "?": "Question Mark",
  "'": "Apostrophe",
  '"': "Quotation Mark",
  "`": "Grave Accent",
  "«": "Left Guillemet",
  "»": "Right Guillemet",
  "‹": "Single Left Guillemet",
  "›": "Single Right Guillemet",
  "…": "Ellipsis",
  "·": "Middle Dot",
  "@": "At Sign",
  "#": "Number Sign",
  $: "Dollar Sign",
  "%": "Percent Sign",
  "^": "Circumflex",
  "&": "Ampersand",
  "*": "Asterisk",
  "(": "Left Parenthesis",
  ")": "Right Parenthesis",
  "[": "Left Square Bracket",
  "]": "Right Square Bracket",
  "{": "Left Curly Bracket",
  "}": "Right Curly Bracket",
  "<": "Less-Than Sign",
  ">": "Greater-Than Sign",
  "/": "Solidus",
  "\\": "Reverse Solidus",
  "|": "Vertical Bar",
  "-": "Hyphen-Minus",
  _: "Low Line",
  "=": "Equals Sign",
  "+": "Plus Sign",
  "~": "Tilde",
};

function glyphName(ch: string): string {
  if (ch >= "A" && ch <= "Z") return `Capital Letter ${ch}`;
  if (ch >= "a" && ch <= "z") return `Small Letter ${ch.toUpperCase()}`;
  if (ch >= "0" && ch <= "9") return `Digit ${DIGIT_NAMES[Number(ch)]}`;
  return PUNCT_NAMES[ch] ?? "Symbol";
}

function codePoint(ch: string): string {
  return `U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`;
}

type Metrics = {
  capHeight: number;
  xHeight: number;
  ascender: number;
  descender: number;
};

const EM = 1000;

/** Resolves a CSS custom property (e.g. oklch) to an rgb() string canvas accepts. */
function resolveColor(varName: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${varName})`;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** Reads real per-em font metrics from the loaded face via the Canvas metrics API. */
function useFontMetrics(family: string, weight: number): Metrics | null {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function measure() {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = `${weight} ${EM}px ${family}`;
      ctx.textBaseline = "alphabetic";

      const cap = ctx.measureText("H");
      const ex = ctx.measureText("x");
      const desc = ctx.measureText("gjpqy");
      const ascender = cap.fontBoundingBoxAscent || cap.actualBoundingBoxAscent;
      const descender = desc.fontBoundingBoxDescent || desc.actualBoundingBoxDescent;

      setMetrics({
        capHeight: Math.round(cap.actualBoundingBoxAscent),
        xHeight: Math.round(ex.actualBoundingBoxAscent),
        ascender: Math.round(ascender),
        descender: Math.round(descender),
      });
    }
    measure();
    return () => {
      cancelled = true;
    };
  }, [family, weight]);

  return metrics;
}

export function GlyphPreview({ font }: { font: Font }) {
  const family = previewFamily(font.name, font.fallback);
  const { resolvedTheme } = useTheme();

  const weights = useMemo(
    () => [...new Set(font.weights)].sort((a, b) => a - b),
    [font.weights],
  );
  const defaultWeight = weights.includes(400) ? 400 : weights[Math.floor(weights.length / 2)];

  const [weight, setWeight] = useState<number>(defaultWeight);
  const [outline, setOutline] = useState(false);
  const [fullSet, setFullSet] = useState(false);
  const [custom, setCustom] = useState("");
  const [selected, setSelected] = useState("R");

  const metrics = useFontMetrics(family, weight);

  const customGlyphs = useMemo(() => [...new Set(custom.replace(/\s/g, "").split(""))], [custom]);

  const sections = useMemo(() => {
    const base: { label: string; glyphs: string[] }[] = [
      { label: "Uppercase", glyphs: UPPERCASE },
      { label: "Lowercase", glyphs: LOWERCASE },
      { label: "Numerals", glyphs: NUMERALS },
    ];
    if (fullSet) {
      base.push({ label: "Punctuation", glyphs: PUNCTUATION });
      base.push({ label: "Symbols", glyphs: SYMBOLS });
    }
    if (customGlyphs.length) base.unshift({ label: "Your Letters", glyphs: customGlyphs });
    return base;
  }, [fullSet, customGlyphs]);

  // Big preview: render glyph on a canvas so the baseline aligns exactly with the
  // HTML metric guide lines, which are positioned with the same formula below.
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PAD = 64;
  const layout = useMemo(() => {
    if (!metrics || size.h === 0) return null;
    const span = metrics.ascender + metrics.descender;
    const inner = size.h - PAD * 2;
    const fs = (inner * EM) / span;
    const baselineY = PAD + (metrics.ascender * fs) / EM;
    const u = fs / EM; // px per font unit
    return {
      fs,
      baselineY,
      ascenderY: baselineY - metrics.ascender * u,
      capY: baselineY - metrics.capHeight * u,
      xY: baselineY - metrics.xHeight * u,
      descenderY: baselineY + metrics.descender * u,
    };
  }, [metrics, size.h]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout || size.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    const text = customGlyphs.length ? custom.replace(/\s+/g, " ").trim() : selected;
    const ink = resolveColor("--foreground");

    // Shrink the type size if a long string would overflow the preview width.
    let fs = layout.fs;
    ctx.font = `${weight} ${fs}px ${family}`;
    const maxWidth = size.w * 0.88;
    const measured = ctx.measureText(text).width;
    if (measured > maxWidth) {
      fs = fs * (maxWidth / measured);
      ctx.font = `${weight} ${fs}px ${family}`;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    if (outline) {
      ctx.lineWidth = Math.max(1, fs / 90);
      ctx.strokeStyle = ink;
      ctx.strokeText(text, size.w / 2, layout.baselineY);
    } else {
      ctx.fillStyle = ink;
      ctx.fillText(text, size.w / 2, layout.baselineY);
    }
  }, [layout, size.w, size.h, selected, custom, customGlyphs.length, weight, outline, family, resolvedTheme]);

  const activeChar = customGlyphs.length === 1 ? customGlyphs[0] : selected;
  const showMetrics = customGlyphs.length <= 1;

  return (
    <div className="border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3 sm:px-6">
        <ToggleGroup
          type="single"
          value={outline ? "outlines" : "solid"}
          onValueChange={(v) => v && setOutline(v === "outlines")}
          className="bg-secondary p-1"
        >
          <ToggleGroupItem value="solid" className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 data-[state=on]:bg-card data-[state=on]:shadow-sm">
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem value="outlines" className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 data-[state=on]:bg-card data-[state=on]:shadow-sm">
            Outlines
          </ToggleGroupItem>
        </ToggleGroup>

        <Select value={String(weight)} onValueChange={(v) => setWeight(Number(v))}>
          <SelectTrigger size="sm" className="w-36 font-mono text-xs" aria-label="Weight">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weights.map((w) => (
              <SelectItem key={w} value={String(w)} className="font-mono text-xs">
                {WEIGHT_NAMES[w] ?? w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={fullSet ? "full" : "basic"}
          onValueChange={(v) => v && setFullSet(v === "full")}
          className="bg-secondary p-1"
        >
          <ToggleGroupItem value="basic" className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 data-[state=on]:bg-card data-[state=on]:shadow-sm">
            Basic Set
          </ToggleGroupItem>
          <ToggleGroupItem value="full" className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 data-[state=on]:bg-card data-[state=on]:shadow-sm">
            Full Set
          </ToggleGroupItem>
        </ToggleGroup>

        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Type your letters"
          aria-label="Type your letters"
          className="ml-auto h-7 w-44 font-mono"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Large preview with metric guides */}
        <div className="min-w-0 flex-1 border-b border-border p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-medium text-foreground">{glyphName(activeChar)}</span>
            <span className="font-mono text-xs text-muted-foreground">{codePoint(activeChar)}</span>
          </div>

          <div ref={wrapRef} className="relative mt-4 h-[360px] w-full sm:h-[460px]">
            <canvas ref={canvasRef} style={{ width: size.w, height: size.h }} className="block" />
            {showMetrics && layout
              ? (
                <>
                  <MetricLine y={layout.capY} label="Cap Height" value={metrics?.capHeight} />
                  <MetricLine y={layout.xY} label="X height" value={metrics?.xHeight} />
                  <MetricLine y={layout.baselineY} label="Baseline" value={0} />
                  <MetricLine y={layout.descenderY} label="Descender" value={metrics ? -metrics.descender : undefined} />
                </>
              )
              : null}
          </div>
        </div>

        {/* Glyph grid */}
        <div className="w-full shrink-0 p-4 sm:p-6 lg:w-[58%]">
          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <div key={section.label}>
                <div className="mb-3 text-right font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-px bg-border">
                  {section.glyphs.map((ch, i) => {
                    const isActive = customGlyphs.length === 0 && ch === selected;
                    return (
                      <button
                        key={`${section.label}-${ch}-${i}`}
                        type="button"
                        onClick={() => {
                          setSelected(ch);
                          setCustom("");
                        }}
                        aria-label={glyphName(ch)}
                        aria-pressed={isActive}
                        className={`flex aspect-square items-center justify-center bg-card text-2xl text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                          isActive ? "ring-2 ring-inset ring-brand" : ""
                        }`}
                        style={{ fontFamily: family, fontWeight: weight }}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricLine({ y, label, value }: { y: number; label: string; value?: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/70" style={{ top: y }}>
      <div className="absolute inset-x-0 -top-5 flex items-center justify-between px-1">
        <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
        {value !== undefined ? <span className="font-mono text-[11px] text-muted-foreground">{value}</span> : null}
      </div>
    </div>
  );
}
