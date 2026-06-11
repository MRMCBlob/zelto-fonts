import { getFonts } from "@/lib/fonts-data";
import { Catalog } from "@/components/catalog";
import { InstallCommand } from "@/components/install-command";

export default function HomePage() {
  const fonts = getFonts();

  return (
    <>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-24 sm:px-6 sm:py-32">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
            {fonts.length} curated open-source fonts
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-7xl">
            Fonts that are actually good<span className="text-brand-bright">.</span>
          </h1>
          <p className="max-w-xl text-lg leading-7 text-ink-muted">
            A hand-picked registry of open-source typefaces. Install any of them into your React
            project like a component — files, code, and license included.
          </p>
          <div className="max-w-md">
            <InstallCommand fontName="inter" />
          </div>
        </div>
      </section>

      <Catalog fonts={fonts} />
    </>
  );
}
