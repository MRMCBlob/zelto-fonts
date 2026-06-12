/**
 * Well-known categories shipped with curated labels and ordering. A font is not
 * limited to these — `category` accepts any kebab-case slug, so new categories
 * can be introduced without changing the schema (see `categorySchema`).
 */
export const FONT_CATEGORIES = ["sans", "serif", "mono", "display"] as const;
export const FONT_STYLES = ["normal", "italic"] as const;
/** Extra capabilities a font can declare beyond category/weights/styles. */
export const FONT_FEATURES = ["ligatures", "extended-charset", "nerd-font", "rtl"] as const;

/** Kebab-case slug shape shared by font names and categories. */
export const CATEGORY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Turn an arbitrary category slug into a display label, e.g. "hand-drawn" → "Hand Drawn". */
export function humanizeCategory(category: string): string {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** One of the curated categories. Fonts may also use any other kebab-case category. */
export type FontCategory = (typeof FONT_CATEGORIES)[number];
export type FontStyle = (typeof FONT_STYLES)[number];
export type FontFeature = (typeof FONT_FEATURES)[number];
