"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";

const ORDER = ["system", "light", "dark"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // true after hydration, false during SSR — avoids a theme-icon hydration mismatch
  const mounted = useSyncExternalStore(subscribeNoop, getTrue, getFalse);

  const current = (ORDER as readonly string[]).includes(theme ?? "") ? (theme as (typeof ORDER)[number]) : "system";

  function cycle() {
    setTheme(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!);
  }

  const Icon = current === "light" ? SunIcon : current === "dark" ? MoonIcon : DesktopIcon;

  return (
    <motion.button
      type="button"
      onClick={cycle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      aria-label={`Theme: ${current}. Click to switch.`}
      title={`Theme: ${current}`}
      className="flex size-8 items-center justify-center border border-border text-foreground hover:bg-secondary"
    >
      {mounted ? <Icon className="size-4" /> : <span className="size-4" />}
    </motion.button>
  );
}

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;
