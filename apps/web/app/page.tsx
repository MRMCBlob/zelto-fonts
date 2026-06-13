import { getFonts } from "@/lib/fonts-data";
import { Catalog } from "@/components/catalog";
import { InstallCommand } from "@/components/install-command";
import { Reveal } from "@/components/motion-primitives";

export default function HomePage() {
  const fonts = getFonts();

  return (
    <>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-24 sm:px-6 sm:py-32">
          <Reveal as="p" className="font-mono text-xs uppercase tracking-wide text-ink-muted">
            {fonts.length} curated open-source fonts
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-7xl">
              Fonts that are actually good<span className="text-brand-bright">.</span>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.16} className="max-w-xl text-lg leading-7 text-ink-muted">
            A hand-picked registry of open-source typefaces. Install any of them into your React
            project like a component — files, code, and license included.
          </Reveal>
          <Reveal delay={0.24} className="max-w-md">
            <InstallCommand fontName="inter" />
          </Reveal>
        </div>
      </section>

      <Catalog fonts={fonts} />
    </>
  );
}
