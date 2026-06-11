import type { Font } from "@zelto/registry";

function fileName(filePath: string): string {
  return filePath.split("/").pop()!;
}

/** Generates an @font-face stylesheet for non-Next.js React projects. */
export function cssFontFaceFile(font: Font): string {
  const blocks = font.files.map((file) => {
    const weight = typeof file.weight === "number" ? String(file.weight) : file.weight;
    return [
      "@font-face {",
      `  font-family: "${font.displayName}";`,
      `  src: url("/fonts/${font.name}/${fileName(file.path)}") format("woff2");`,
      `  font-weight: ${weight};`,
      `  font-style: ${file.style};`,
      "  font-display: swap;",
      "}",
    ].join("\n");
  });

  return `/* ${font.displayName} — added by zelto-fonts
   License: ${font.license.type} (${font.license.url}) */

${blocks.join("\n\n")}

:root {
  --font-${font.name}: "${font.displayName}", ${font.fallback};
}
`;
}

export function cssUsageNote(font: Font, cssPath: string): string {
  return `1. Import the stylesheet once (e.g. in src/main.tsx):

   import "${cssPath}";

2. Use it:

   font-family: var(--font-${font.name});
   /* or */ font-family: "${font.displayName}", ${font.fallback};`;
}
