import Link from "next/link";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site";
import { getFonts } from "@/lib/fonts-data";
import { GitHubIcon } from "@/components/icons/github";
import { GradientHeartIcon } from "@/components/icons/heart";
import { NumberWheel } from "@/components/number-wheel";
import { ThemeToggle } from "@/components/theme-toggle";
import { RandomFontButton } from "@/components/random-font-button";
import { MotionA, MotionLink, pressable } from "@/components/motion-primitives";

const nav = [
  { href: "/", label: "Fonts" },
  { href: "/docs", label: "Docs" },
  { href: "/submit", label: "Submit" },
  { href: "/donor", label: "Donors" },
];

/** GitHub star count, revalidated hourly. Returns 0 until the repo exists. */
async function getStarCount(): Promise<number> {
  try {
    const repo = siteConfig.github.replace("https://github.com/", "");
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { stargazers_count?: number };
    return data.stargazers_count ?? 0;
  } catch {
    return 0;
  }
}

export async function SiteHeader() {
  const stars = await getStarCount();
  const fontCount = getFonts().length;
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex h-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
        <MotionLink href="/" {...pressable} className="text-lg font-semibold tracking-tight text-foreground">
          zelto<span className="text-brand">.</span>
        </MotionLink>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                {item.label}
                {item.href === "/donor" && <GradientHeartIcon className="size-4" />}
              </span>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-foreground transition-transform duration-200 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <RandomFontButton slugs={getFonts().map((font) => font.name)} />
          <ThemeToggle />
          <MotionA
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`GitHub repository — ${stars} stars, ${fontCount} fonts`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="flex h-8 items-center gap-2.5 border border-border px-3 text-foreground hover:bg-secondary"
          >
            <GitHubIcon className="size-4" />
            <span className="flex items-center gap-1 font-mono text-xs">
              <StarIcon weight="fill" className="size-3.5 text-brand" />
              <NumberWheel value={stars} />
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="flex items-center gap-1 font-mono text-xs">
              <NumberWheel value={fontCount} />
              <span className="text-muted-foreground">fonts</span>
            </span>
          </MotionA>
        </div>
      </div>
    </header>
  );
}
