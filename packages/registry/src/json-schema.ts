import { z } from "zod";
import { fontSchema } from "./schema.ts";

/** JSON Schema for editor autocomplete in registry/fonts/<slug>/font.json */
export const fontJsonSchema = z.toJSONSchema(fontSchema, { io: "input" });
