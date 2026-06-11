"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ShuffleIcon } from "@phosphor-icons/react";

export function RandomFontButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();

  function goRandom() {
    const slug = slugs[Math.floor(Math.random() * slugs.length)];
    if (slug) router.push(`/fonts/${slug}`);
  }

  return (
    <motion.button
      type="button"
      onClick={goRandom}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      aria-label="Open a random font"
      title="Random font"
      className="flex size-8 items-center justify-center border border-border text-foreground hover:bg-secondary"
    >
      <ShuffleIcon className="size-4" />
    </motion.button>
  );
}
