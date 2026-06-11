import { readFileSync } from "node:fs";
import path from "node:path";
import type { Font, Registry } from "@zelto/registry";

let cached: Registry | null = null;

/** Reads the generated registry (scripts/build-registry.ts) at build time. */
export function getRegistry(): Registry {
  if (!cached) {
    const file = path.join(process.cwd(), "public", "r", "registry.json");
    cached = JSON.parse(readFileSync(file, "utf8")) as Registry;
  }
  return cached;
}

export function getFonts(): Font[] {
  return getRegistry().items;
}

export function getFont(slug: string): Font | undefined {
  return getRegistry().items.find((font) => font.name === slug);
}
