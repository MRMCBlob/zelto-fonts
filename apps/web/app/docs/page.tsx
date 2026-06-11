import type { Metadata } from "next";
import Link from "next/link";
import { InstallCommand } from "@/components/install-command";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Docs",
  description: "How to install and use Zelto fonts in your React project.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Docs</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">
        Install fonts like components<span className="text-brand">.</span>
      </h1>

      <Section title="Quick start">
        <p>
          Pick a font from the <Link href="/" className="text-brand hover:underline">catalog</Link> and run the
          add command in your project root:
        </p>
        <div className="my-4 max-w-md">
          <InstallCommand fontName="inter" />
        </div>
        <p>
          The CLI detects your setup, downloads the <Code>.woff2</Code> files into your project, and
          generates ready-to-use code. No package dependency, no external requests at runtime — you
          own the files.
        </p>
      </Section>

      <Section title="Next.js (App Router)">
        <p>
          Font files land in <Code>app/fonts/&lt;name&gt;/</Code> and a module is generated at{" "}
          <Code>app/fonts/&lt;name&gt;.ts</Code> using <Code>next/font/local</Code>:
        </p>
        <CodeBlock>{`import { inter } from "./fonts/inter";

// app/layout.tsx
<html className={inter.variable}>`}</CodeBlock>
        <p>Then wire it into Tailwind v4 in <Code>globals.css</Code>:</p>
        <CodeBlock>{`@theme inline {
  --font-sans: var(--font-inter);
}`}</CodeBlock>
      </Section>

      <Section title="React / Vite">
        <p>
          Files land in <Code>public/fonts/&lt;name&gt;/</Code> with an <Code>@font-face</Code>{" "}
          stylesheet at <Code>src/styles/fonts/&lt;name&gt;.css</Code>:
        </p>
        <CodeBlock>{`// src/main.tsx
import "./styles/fonts/inter.css";

/* anywhere in CSS */
font-family: var(--font-inter);`}</CodeBlock>
      </Section>

      <Section title="CLI reference">
        <CodeBlock>{`npx zelto-fonts add <name>     install a font
  --force                      overwrite existing files
  --dir <path>                 override the font files directory
  --registry <url>             use a different registry

npx zelto-fonts list           list all available fonts`}</CodeBlock>
      </Section>

      <Section title="Registry API">
        <p>The registry is plain static JSON — usable by anything, not just the CLI:</p>
        <CodeBlock>{`GET ${siteConfig.url}/r/registry.json      full catalog
GET ${siteConfig.url}/r/<name>.json        single font
GET ${siteConfig.url}/r/fonts/<name>/*     woff2 files + license`}</CodeBlock>
      </Section>

      <Section title="Self-hosting">
        <p>
          Point the CLI at your own mirror with <Code>--registry</Code> or the{" "}
          <Code>ZELTO_REGISTRY_URL</Code> environment variable. File URLs in the registry JSON are
          relative, so a full mirror is just a copy of <Code>/r</Code>.
        </p>
      </Section>

      <Section title="Licenses">
        <p>
          Every font in the registry uses the SIL Open Font License (or equivalent). The license
          text is downloaded next to the font files — keep it there; the OFL requires it to
          accompany the fonts.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-secondary px-1.5 py-0.5 font-mono text-[13px] text-foreground">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto bg-ink p-4 font-mono text-[13px] leading-5 text-ink-foreground">
      {children}
    </pre>
  );
}
