import { getFonts } from "@/lib/fonts-data";
import { buildAiTxt } from "@/lib/ai-metadata";

// Prerendered at build time from the generated registry, so it always reflects
// the current catalog without per-request work.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildAiTxt(getFonts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
