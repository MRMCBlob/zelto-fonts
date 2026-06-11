"use client";

import { motion } from "motion/react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";

/** Direct download of the font's woff2 files + license as a zip — no CLI needed. */
export function DownloadButton({ slug, displayName }: { slug: string; displayName: string }) {
  return (
    <motion.a
      href={`/r/${slug}.zip`}
      download={`${slug}.zip`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      aria-label={`Download ${displayName} as zip`}
      className="flex h-[46px] items-center gap-2 border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-secondary"
    >
      <DownloadSimpleIcon className="size-4" weight="bold" />
      Download
    </motion.a>
  );
}
