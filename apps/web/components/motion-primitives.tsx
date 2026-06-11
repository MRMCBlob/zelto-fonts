"use client";

import Link from "next/link";
import { motion } from "motion/react";

/** Shared micro-interaction props for clickable elements. */
export const pressable = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 28 },
} as const;

export const MotionLink = motion.create(Link);
export const MotionA = motion.a;
export const MotionButton = motion.button;
export const MotionDiv = motion.div;
