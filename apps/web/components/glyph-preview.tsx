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
const BASIC_CATS = ["Uppercase", "Lowercase", "Numerals"];

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
  if (PUNCT_NAMES[ch]) return PUNCT_NAMES[ch];
  if (/\p{Lu}/u.test(ch)) return `Capital Letter ${ch}`;
  if (/\p{Ll}/u.test(ch)) return `Small Letter ${ch}`;
  return `Glyph ${ch}`;
}

function codePoint(ch: string): string {
  return `U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`;
}

// ---- Full-set glyph categories (driven by the font's real cmap coverage) ----

const FRACTIONS = new Set(["½", "¼", "¾"]);
const CURRENCY = "$¢£¤¥";

const CATEGORY_ORDER = [
  "Your Letters",
  "Uppercase",
  "Lowercase",
  "Numerals",
  "Uppercase Accented",
  "Lowercase Accented",
  "Ligatures",
  "Fractions",
  "Ordinals",
  "Superscript",
  "Subscript",
  "Punctuation",
  "Currency",
  "Symbols",
  "Arrows",
  "Math",
  "Other",
];

/**
 * Truly non-printing code points: whitespace, control, format, surrogates.
 * Combining marks and uncategorised symbols are kept — the ink-check decides
 * whether they actually render, so anything visible still gets shown (in "Other").
 * Private-Use (logo) glyphs are intentionally not excluded.
 */
const INVISIBLE = /\p{Z}|\p{Cc}|\p{Cf}|\p{Cs}/u;

function categorize(ch: string): string {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp >= 0x41 && cp <= 0x5a) return "Uppercase";
  if (cp >= 0x61 && cp <= 0x7a) return "Lowercase";
  if (cp >= 0x30 && cp <= 0x39) return "Numerals";
  if (cp >= 0xfb00 && cp <= 0xfb4f) return "Ligatures";
  if (ch === "ª" || ch === "º" || cp === 0x2116) return "Ordinals";
  if (cp === 0x00b2 || cp === 0x00b3 || cp === 0x00b9 || (cp >= 0x2070 && cp <= 0x207f)) return "Superscript";
  if (cp >= 0x2080 && cp <= 0x209c) return "Subscript";
  if (FRACTIONS.has(ch) || (cp >= 0x2150 && cp <= 0x215f) || cp === 0x2044) return "Fractions";
  if (cp >= 0x2190 && cp <= 0x21ff) return "Arrows";
  if ((cp >= 0x20a0 && cp <= 0x20bf) || CURRENCY.includes(ch)) return "Currency";
  if (/\p{L}/u.test(ch)) {
    const up = ch.toUpperCase();
    const lo = ch.toLowerCase();
    if (ch === up && ch !== lo) return "Uppercase Accented";
    return "Lowercase Accented"; // lowercase + caseless letters (ß, etc.)
  }
  if (cp >= 0x2200 && cp <= 0x22ff) return "Math";
  if (/\p{P}/u.test(ch)) return "Punctuation";
  if (/\p{S}/u.test(ch)) return "Symbols";
  return "Other";
}

/** Canvas `ctx.font` can't parse `var(--x)`; expand custom properties to their value. */
function resolveFontStack(stack: string): string {
  return stack.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || "sans-serif";
  });
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
      ctx.font = `${weight} ${EM}px ${resolveFontStack(family)}`;
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

  // The font's real glyph coverage, derived from its cmap at build time.
  // Drop spaces / combining marks / control chars but keep Private-Use (logo) glyphs.
  const coverage = useMemo(
    () =>
      (font.glyphs ?? [])
        .map((cp) => String.fromCodePoint(cp))
        .filter((ch) => !INVISIBLE.test(ch)),
    [font.glyphs],
  );

  // Backstop: hide any glyph the font renders with no ink (e.g. a mapped-but-empty
  // code point), and confirm visible ones like the Private-Use logo glyph render.
  const [inkVisible, setInkVisible] = useState<Set<string> | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (cancelled || coverage.length === 0) return;
      const cv = document.createElement("canvas");
      cv.width = 48;
      cv.height = 48;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const fam = resolveFontStack(family);
      const visible = new Set<string>();
      for (const ch of coverage) {
        ctx.clearRect(0, 0, 48, 48);
        ctx.font = `400 36px ${fam}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.fillText(ch, 24, 24);
        const d = ctx.getImageData(0, 0, 48, 48).data;
        for (let i = 3; i < d.length; i += 4) {
          if (d[i] !== 0) {
            visible.add(ch);
            break;
          }
        }
      }
      if (!cancelled) setInkVisible(visible);
    })();
    return () => {
      cancelled = true;
    };
  }, [family, coverage]);

  const visibleCoverage = useMemo(
    () => (inkVisible ? coverage.filter((ch) => inkVisible.has(ch)) : coverage),
    [coverage, inkVisible],
  );

  const sections = useMemo(() => {
    const buckets = new Map<string, string[]>();
    const add = (ch: string) => {
      const cat = categorize(ch);
      const arr = buckets.get(cat) ?? [];
      arr.push(ch);
      buckets.set(cat, arr);
    };

    // Basic is always available even if cmap parsing was unavailable.
    const seen = new Set<string>();
    const addUnique = (ch: string) => {
      if (seen.has(ch)) return;
      seen.add(ch);
      add(ch);
    };
    [...UPPERCASE, ...LOWERCASE, ...NUMERALS].forEach(addUnique);

    if (fullSet) visibleCoverage.forEach(addUnique);

    const result = CATEGORY_ORDER.filter((c) => fullSet || BASIC_CATS.includes(c))
      .map((label) => ({
        label,
        glyphs: (buckets.get(label) ?? []).sort(
          (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
        ),
      }))
      .filter((s) => s.glyphs.length > 0);

    if (customGlyphs.length) result.unshift({ label: "Your Letters", glyphs: customGlyphs });
    return result;
  }, [fullSet, visibleCoverage, customGlyphs]);

  const totalGlyphs = useMemo(
    () => sections.reduce((n, s) => (s.label === "Your Letters" ? n : n + s.glyphs.length), 0),
    [sections],
  );

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
    const canvasFamily = resolveFontStack(family);

    // Shrink the type size if a long string would overflow the preview width.
    let fs = layout.fs;
    ctx.font = `${weight} ${fs}px ${canvasFamily}`;
    const maxWidth = size.w * 0.88;
    const measured = ctx.measureText(text).width;
    if (measured > maxWidth) {
      fs = fs * (maxWidth / measured);
      ctx.font = `${weight} ${fs}px ${canvasFamily}`;
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

          <div ref={wrapRef} className="relative mt-4 w-full" style={{ height: 460 }}>
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
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          {fullSet ? (
            <div className="mb-4 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {totalGlyphs} Glyphs
            </div>
          ) : null}
          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <div key={section.label}>
                <div className="mb-3 text-right font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </div>
                <div
                  className="grid border-l border-t border-border"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(3rem, 1fr))" }}
                >
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
                        className={`flex items-center justify-center border-r border-b border-border bg-card text-2xl text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                          isActive ? "ring-2 ring-inset ring-brand" : ""
                        }`}
                        style={{ fontFamily: family, fontWeight: weight, aspectRatio: "1 / 1" }}
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
