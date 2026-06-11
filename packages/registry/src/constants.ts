export const FONT_CATEGORIES = ["sans", "serif", "mono", "display"] as const;
export const FONT_STYLES = ["normal", "italic"] as const;
/** Extra capabilities a font can declare beyond category/weights/styles. */
export const FONT_FEATURES = ["ligatures", "extended-charset", "nerd-font", "rtl"] as const;

export type FontCategory = (typeof FONT_CATEGORIES)[number];
export type FontStyle = (typeof FONT_STYLES)[number];
export type FontFeature = (typeof FONT_FEATURES)[number];
