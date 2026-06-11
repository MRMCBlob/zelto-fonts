import { siteConfig } from "@/lib/site";
import { MotionA, MotionLink, pressable } from "@/components/motion-primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-12 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-foreground">
            zelto<span className="text-brand">.</span>
          </span>{" "}
          — fonts that are actually good.
        </p>
        <div className="flex items-center gap-6">
          <MotionLink href="/docs" {...pressable} className="hover:text-foreground">
            Docs
          </MotionLink>
          <MotionLink href="/submit" {...pressable} className="hover:text-foreground">
            Submit a font
          </MotionLink>
          <MotionA href={siteConfig.github} target="_blank" rel="noreferrer" {...pressable} className="hover:text-foreground">
            GitHub
          </MotionA>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          All fonts under their own open licenses (OFL).
        </p>
      </div>
    </footer>
  );
}
