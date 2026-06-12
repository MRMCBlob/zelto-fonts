import type { Metadata } from "next";
import { GitHubIcon } from "@/components/icons/github";
import { MotionA, pressable } from "@/components/motion-primitives";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Submit a font",
  description: "Add a font to the Zelto registry via a GitHub pull request.",
};

const steps = [
  {
    title: "Fork the registry",
    body: "The whole registry lives in a public GitHub repo. Fork it and create a branch for your font.",
  },
  {
    title: "Add your font folder",
    body: "Create registry/fonts/<slug>/ with a font.json, the .woff2 files under files/, and the license as files/OFL.txt.",
  },
  {
    title: "Open a pull request",
    body: "CI validates the schema and license. Once merged, the font ships on the site and CLI — with your GitHub handle credited on the font page.",
  },
];

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Submit</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">
        Add a font to the registry<span className="text-brand">.</span>
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
        Zelto is community-curated. Submissions happen as pull requests — no accounts, no forms.
        Every accepted font credits its submitter on the font page.
      </p>

      <ol className="mt-12 flex flex-col gap-6">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-5 border border-border bg-card p-6 shadow-card">
            <span className="font-mono text-sm text-brand">0{i + 1}</span>
            <div>
              <h2 className="font-medium text-foreground">{step.title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-xl font-semibold tracking-tight text-foreground">Requirements</h2>
      <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-6 text-muted-foreground">
        <li>
          Open license that permits redistribution — <strong className="text-foreground">OFL-1.1</strong> or
          equivalent. Freeware/&quot;free for personal use&quot; fonts can&apos;t be accepted.
        </li>
        <li>
          <code className="bg-secondary px-1 font-mono text-[13px]">.woff2</code> files — variable
          preferred, static weights welcome.
        </li>
        <li>The license text must ship alongside the files (the OFL requires it).</li>
        <li>
          <code className="bg-secondary px-1 font-mono text-[13px]">submittedBy.github</code> set to
          your handle — that&apos;s how you get credited.
        </li>
        <li>It has to be actually good. Curated means curated.</li>
      </ul>

      <h2 className="mt-14 text-xl font-semibold tracking-tight text-foreground">font.json</h2>
      <pre className="mt-4 overflow-x-auto bg-ink p-4 font-mono text-[13px] leading-5 text-ink-foreground">
        {`{
  "$schema": "../../schema.json",
  "name": "your-font",
  "displayName": "Your Font",
  "version": "1.0",
  "category": "sans",  // sans · serif · mono · display, or your own slug
  "designer": "Jane Doe",
  "license": { "type": "OFL-1.1", "url": "https://…" },
  "source": "https://github.com/…",
  "variable": true,
  "axes": { "wght": [100, 900] },
  "weights": [400, 500, 700],
  "styles": ["normal", "italic"],
  "fallback": "sans-serif",
  "previewText": "Show it off in one line.",
  "description": "One or two sentences about the typeface.",
  "submittedBy": { "github": "your-handle" },
  "files": [
    { "path": "/r/fonts/your-font/YourFont.woff2", "weight": "100 900", "style": "normal" }
  ]
}`}
      </pre>

      <MotionA
        href={`${siteConfig.github}/fork`}
        target="_blank"
        rel="noreferrer"
        {...pressable}
        className="mt-10 inline-flex h-12 items-center gap-2.5 bg-primary px-6 font-medium text-primary-foreground"
      >
        <GitHubIcon className="size-4" />
        Open a pull request
      </MotionA>
    </div>
  );
}
