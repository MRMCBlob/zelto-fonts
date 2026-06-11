// Client-safe helpers for rendering registry fonts on the site.

/**
 * CSS font-family stack for previewing a registry font.
 * Geist + Geist Mono are aliased to the next/font-loaded UI faces so the
 * browser doesn't download the same woff2 twice (next/font hashes its URLs).
 */
export function previewFamily(name: string, fallback: string): string {
  if (name === "geist") return `var(--font-geist-sans), ${fallback}`;
  if (name === "geist-mono") return `var(--font-geist-mono), ${fallback}`;
  return `"zelto-${name}", ${fallback}`;
}
