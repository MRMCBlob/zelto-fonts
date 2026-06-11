import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GitHubIcon } from "@/components/icons/github";
import { InstallCommand } from "@/components/install-command";
import { TypeTester } from "@/components/type-tester";
import { DownloadButton } from "@/components/download-button";
import { MotionA, MotionLink, pressable } from "@/components/motion-primitives";
import { getFont, getFonts } from "@/lib/fonts-data";
import { previewFamily } from "@/lib/preview";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getFonts().map((font) => ({ slug: font.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const font = getFont(slug);
  if (!font) return {};
  const description = `${font.displayName} — ${font.variable ? "variable " : ""}${font.category} typeface by ${font.designer}. Free, ${font.license.type}-licensed. ${font.description}`;
  return {
    title: font.displayName,
    description,
    alternates: { canonical: "./" },
    openGraph: {
      type: "website",
      title: font.displayName,
      description,
      url: `/fonts/${font.name}`,
    },
    twitter: { card: "summary", title: font.displayName, description },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  sans: "Sans Serif",
  serif: "Serif",
  mono: "Monospace",
  display: "Display",
};

export default async function FontPage({ params }: Props) {
  const { slug } = await params;
  const font = getFont(slug);
  if (!font) notFound();

  const ladderWeights = font.variable && font.axes?.wght
    ? rangeWeights(font.axes.wght[0], font.axes.wght[1])
    : font.weights;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: font.displayName,
    description: font.description,
    creator: { "@type": "Person", name: font.designer },
    version: font.version,
    license: font.license.url,
    url: `${siteConfig.url}/fonts/${font.name}`,
    isAccessibleForFree: true,
  };

  return (
    <>
      {font.files
        .filter((file) => file.style === "normal")
        .map((file) => (
          <link key={file.path} rel="preload" href={file.path} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
        <MotionLink
          href="/"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="inline-block font-mono text-xs text-muted-foreground hover:text-brand"
        >
          ← all fonts
        </MotionLink>

        <div className="mt-6 flex flex-col gap-10 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-4">
              <h1
                className="break-words text-6xl text-foreground sm:text-7xl"
                style={{ fontFamily: previewFamily(font.name, font.fallback), fontWeight: 600 }}
              >
                {font.displayName}
              </h1>
              <Badge variant="secondary" className="font-mono text-[11px] font-normal text-muted-foreground">
                {CATEGORY_LABELS[font.category] ?? font.category}
              </Badge>
            </div>
            <p className="mt-4 max-w-xl leading-6 text-muted-foreground">{font.description}</p>

            <div className="mt-8 flex max-w-xl flex-wrap items-end gap-3">
              <div className="w-full max-w-md">
                <InstallCommand fontName={font.name} />
              </div>
              <DownloadButton slug={font.name} displayName={font.displayName} />
            </div>

            <Separator className="my-10" />

            <h2 className="mb-6 font-mono text-xs uppercase tracking-wide text-muted-foreground">Type tester</h2>
            <TypeTester font={font} />

            <Separator className="my-10" />

            <h2 className="mb-6 font-mono text-xs uppercase tracking-wide text-muted-foreground">Weights</h2>
            <div className="flex flex-col divide-y divide-border border border-border bg-card">
              {ladderWeights.map((weight) => (
                <div key={weight} className="flex items-baseline gap-6 px-6 py-4">
                  <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{weight}</span>
                  <p
                    className="min-w-0 truncate text-3xl text-foreground"
                    style={{ fontFamily: previewFamily(font.name, font.fallback), fontWeight: weight }}
                  >
                    {font.previewText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="w-full shrink-0 lg:w-72">
            <div className="flex flex-col gap-5 border border-border bg-card p-6 text-sm shadow-card">
              <MetaRow label="Designer" value={font.designer} />
              <MetaRow label="Version" value={font.version} />
              <MetaRow
                label="License"
                value={
                  <a href={font.license.url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    {font.license.type}
                  </a>
                }
              />
              <MetaRow
                label="Source"
                value={
                  <a href={font.source} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    {font.source.replace("https://github.com/", "")}
                  </a>
                }
              />
              <MetaRow
                label="Styles"
                value={`${font.variable ? "Variable" : `${font.weights.length} static weights`}${font.styles.includes("italic") ? " + italics" : ""}`}
              />
              <Separator />
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Submitted by</span>
                <MotionA
                  href={`https://github.com/${font.submittedBy.github}`}
                  target="_blank"
                  rel="noreferrer"
                  {...pressable}
                  className="group flex items-center gap-3"
                >
                  <Image
                    src={`https://github.com/${font.submittedBy.github}.png?size=64`}
                    alt={`${font.submittedBy.github}'s GitHub avatar`}
                    width={32}
                    height={32}
                    unoptimized
                    className="border border-border"
                  />
                  <span className="font-medium text-foreground group-hover:text-brand">
                    @{font.submittedBy.github}
                  </span>
                  <GitHubIcon className="ml-auto size-4 text-muted-foreground" />
                </MotionA>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function rangeWeights(min: number, max: number): number[] {
  const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  return steps.filter((w) => w >= min && w <= max);
}
