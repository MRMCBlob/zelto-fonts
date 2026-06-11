"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { Font } from "@zelto/registry";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { previewFamily } from "@/lib/preview";

export function TypeTester({ font }: { font: Font }) {
  const defaultWeight = font.weights.includes(400) ? 400 : font.weights[0];
  const editorRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(72);
  const [weight, setWeight] = useState<number>(defaultWeight);
  const [italic, setItalic] = useState(false);
  const [tracking, setTracking] = useState(0);

  const hasItalic = font.styles.includes("italic");

  function reset() {
    if (editorRef.current) editorRef.current.textContent = font.previewText;
    setSize(72);
    setWeight(defaultWeight);
    setItalic(false);
    setTracking(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Control label={`Size ${size}px`} className="w-44">
          <Slider value={[size]} onValueChange={([v]) => setSize(v ?? 72)} min={12} max={220} step={1} aria-label="Font size" />
        </Control>
        <Control label={`Tracking ${tracking}px`} className="w-36">
          <Slider value={[tracking]} onValueChange={([v]) => setTracking(v ?? 0)} min={-5} max={10} step={0.5} aria-label="Letter spacing" />
        </Control>
        <Control label="Weight">
          <ToggleGroup
            type="single"
            value={String(weight)}
            onValueChange={(v) => v && setWeight(Number(v))}
            className="bg-secondary p-1"
          >
            {font.weights.map((w) => (
              <ToggleGroupItem
                key={w}
                value={String(w)}
                className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                {w}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Control>
        {hasItalic ? (
          <Control label="Style">
            <ToggleGroup
              type="single"
              value={italic ? "italic" : "normal"}
              onValueChange={(v) => v && setItalic(v === "italic")}
              className="bg-secondary p-1"
            >
              <ToggleGroupItem value="normal" className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 data-[state=on]:bg-card data-[state=on]:shadow-sm">
                roman
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" className="h-6 px-2.5 font-mono text-xs transition-transform active:scale-95 italic data-[state=on]:bg-card data-[state=on]:shadow-sm">
                italic
              </ToggleGroupItem>
            </ToggleGroup>
          </Control>
        ) : null}
        <motion.button
          type="button"
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="self-end pb-1 font-mono text-xs text-muted-foreground underline-offset-4 hover:text-brand hover:underline"
        >
          reset
        </motion.button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-label="Type tester"
        className="min-h-40 w-full cursor-text break-words border border-border bg-card p-6 leading-[1.1] text-foreground caret-brand outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:p-8"
        style={{
          fontFamily: previewFamily(font.name, font.fallback),
          fontSize: `${size}px`,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
          letterSpacing: `${tracking}px`,
        }}
      >
        {font.previewText}
      </div>
      <p className="font-mono text-xs text-muted-foreground">Click the text and type — it&apos;s editable.</p>
    </div>
  );
}

function Control({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
