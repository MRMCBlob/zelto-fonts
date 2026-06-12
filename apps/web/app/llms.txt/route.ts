import { getFonts } from "@/lib/fonts-data";
import { buildLlmsTxt } from "@/lib/ai-metadata";

// Prerendered at build time from the generated registry, so it always reflects
// the current catalog without per-request work.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(getFonts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
