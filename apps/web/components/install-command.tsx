"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RUNNERS = [
  { id: "npm", run: "npx" },
  { id: "pnpm", run: "pnpm dlx" },
  { id: "bun", run: "bunx" },
] as const;

export function InstallCommand({ fontName }: { fontName: string }) {
  return (
    <Tabs defaultValue="npm" className="w-full">
      <TabsList className="h-8 bg-secondary p-1">
        {RUNNERS.map((runner) => (
          <TabsTrigger
            key={runner.id}
            value={runner.id}
            className="px-3 text-xs transition-transform active:scale-95"
          >
            {runner.id}
          </TabsTrigger>
        ))}
      </TabsList>
      {RUNNERS.map((runner) => (
        <TabsContent key={runner.id} value={runner.id}>
          <CommandLine command={`${runner.run} zelto-fonts add ${fontName}`} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3">
      <code className="overflow-x-auto whitespace-nowrap font-mono text-[13px] text-ink-foreground">
        <span className="select-none text-ink-muted">$ </span>
        {command}
      </code>
      <motion.button
        type="button"
        onClick={copy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="shrink-0 bg-brand px-3 py-1 font-mono text-xs font-medium text-brand-foreground"
      >
        {copied ? "copied" : "copy"}
      </motion.button>
    </div>
  );
}
