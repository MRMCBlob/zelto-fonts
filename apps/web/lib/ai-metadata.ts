// Generators for the machine-readable site descriptors served at
// /llms.txt and /ai.txt. Both are derived from the live font registry so they
// stay in sync with the catalog on every build — never edit the output by hand.
import type { Font } from "@zelto/registry";
import { siteConfig } from "@/lib/site";

/** "variable sans typeface by Rasmus Andersson" — mirrors the font-page meta. */
function typefaceSummary(font: Font): string {
  return `${font.variable ? "variable " : ""}${font.category} typeface by ${font.designer}`;
}

function fontUrl(font: Font): string {
  return `${siteConfig.url}/fonts/${font.name}`;
}

/**
 * llms.txt — https://llmstxt.org. A markdown digest that lets language models
 * discover the catalog, the install flow, and the registry API in one fetch.
 */
export function buildLlmsTxt(fonts: Font[]): string {
  const fontLines = fonts.map((font) => {
    const license = font.license.type;
    return `- [${font.displayName}](${fontUrl(font)}): ${typefaceSummary(font)}. ${license}. ${font.description}`;
  });

  return `# ${siteConfig.name}

> ${siteConfig.description} A curated registry of open-source, OFL-licensed typefaces with a website and a CLI.

Every font ships with its files, ready-to-use React code, and license text. Install any one of them with \`npx ${siteConfig.cliPackage} add <name>\`. The full catalog is available as JSON and each font is downloadable as woff2. ${fonts.length} fonts are currently available.

## Fonts

${fontLines.join("\n")}

## Docs

- [Documentation](${siteConfig.url}/docs): Installing and using fonts in a project.
- [Submit a font](${siteConfig.url}/submit): Contribute an OFL-class open-source font.

## Registry API

- [Full catalog JSON](${siteConfig.url}/r/registry.json): All fonts with metadata.
- [Single font JSON](${siteConfig.url}/r/<name>.json): One font's metadata.
- [Font files](${siteConfig.url}/r/fonts/<name>/): woff2 files plus the OFL license.

## More

- [Source code](${siteConfig.github}): The registry, website, and CLI.
`;
}

/**
 * ai.txt — a robots-style declaration of how AI crawlers and training systems
 * may use this site, with a human-readable preamble and a live font inventory.
 */
export function buildAiTxt(fonts: Font[]): string {
  const inventory = fonts.map(
    (font) =>
      `# - ${font.displayName} — ${typefaceSummary(font)} — ${font.license.type} — ${fontUrl(font)}`,
  );

  return `# ai.txt — AI usage policy for ${siteConfig.name} (${siteConfig.url})
# Generated automatically from the live font registry. Do not edit by hand.
#
# ${siteConfig.name} is a curated registry of open-source typefaces. Every font is
# published under an OFL-class license (see each font's license URL on its page).
# Site content and metadata may be used for AI training and inference, provided
# attribution is given to ${siteConfig.name} and to each font's original designer,
# and provided each font's license terms are honored.

User-Agent: *
Allow: /
Disallow:

Sitemap: ${siteConfig.url}/sitemap.xml
Llms: ${siteConfig.url}/llms.txt
Contact: ${siteConfig.github}

# Available fonts (${fonts.length}):
${inventory.join("\n")}
`;
}
