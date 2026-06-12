import { z } from "zod";
import { CATEGORY_PATTERN, FONT_CATEGORIES, FONT_FEATURES, FONT_STYLES } from "./constants.ts";

export {
  CATEGORY_PATTERN,
  FONT_CATEGORIES,
  FONT_FEATURES,
  FONT_STYLES,
  humanizeCategory,
  type FontCategory,
  type FontFeature,
  type FontStyle,
} from "./constants.ts";

/**
 * Any kebab-case category slug. The curated `FONT_CATEGORIES` are advertised as
 * examples (for editor autocomplete) but are not enforced, so new categories
 * can be added without a schema change.
 */
export const categorySchema = z
  .string()
  .regex(CATEGORY_PATTERN)
  .meta({ examples: [...FONT_CATEGORIES] });

export const fontFileSchema = z.object({
  /** URL path relative to the registry base, e.g. "/r/fonts/inter/InterVariable.woff2" */
  path: z.string().regex(/^\/r\/fonts\/[a-z0-9-]+\/[^/]+\.woff2$/),
  /** Single weight (400) or a variable range ("100 900") */
  weight: z.union([z.number().int().min(1).max(1000), z.string().regex(/^\d+ \d+$/)]),
  style: z.enum(FONT_STYLES),
});

export const fontSchema = z.object({
  $schema: z.string().optional(),
  /** Unique kebab-case slug, used as the CLI install name */
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  displayName: z.string().min(1),
  /** Upstream font version */
  version: z.string().min(1),
  category: categorySchema,
  designer: z.string().min(1),
  license: z.object({
    type: z.string().min(1),
    url: z.url(),
  }),
  source: z.url(),
  variable: z.boolean(),
  /** Variable axes, e.g. { "wght": [100, 900], "opsz": [14, 32] } */
  axes: z.record(z.string(), z.tuple([z.number(), z.number()])).optional(),
  /** Named weights available (for static fonts: one per file; for variable: UI presets) */
  weights: z.array(z.number().int().min(1).max(1000)).nonempty(),
  styles: z.array(z.enum(FONT_STYLES)).nonempty(),
  /** Extra capabilities: ligatures, extended-charset, nerd-font, rtl */
  features: z.array(z.enum(FONT_FEATURES)).optional(),
  /** CSS generic fallback family appended to generated stacks */
  fallback: z.string().min(1),
  previewText: z.string().min(1),
  description: z.string().min(1),
  /** GitHub handle of the person who submitted the font (avatar = github.com/<handle>.png) */
  submittedBy: z.object({
    github: z.string().regex(/^[a-zA-Z0-9-]+$/),
  }),
  files: z.array(fontFileSchema).nonempty(),
});

export const registrySchema = z.object({
  name: z.literal("zelto"),
  homepage: z.url(),
  items: z.array(fontSchema),
});

export type FontFile = z.infer<typeof fontFileSchema>;
export type Font = z.infer<typeof fontSchema>;
export type Registry = z.infer<typeof registrySchema>;
