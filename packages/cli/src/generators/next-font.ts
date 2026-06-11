import type { Font } from "@zelto/registry";

export function camelCase(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function fileName(filePath: string): string {
  return filePath.split("/").pop()!;
}

/** Generates <appDir>/fonts/<slug>.ts using next/font/local. */
export function nextFontModule(font: Font): string {
  const exportName = camelCase(font.name);
  const src = font.files
    .map((file) => {
      const weight = typeof file.weight === "number" ? String(file.weight) : file.weight;
      return [
        "    {",
        `      path: "./${font.name}/${fileName(file.path)}",`,
        `      weight: "${weight}",`,
        `      style: "${file.style}",`,
        "    },",
      ].join("\n");
    })
    .join("\n");

  return `// ${font.displayName} — added by zelto-fonts
// License: ${font.license.type} (${font.license.url})
import localFont from "next/font/local";

export const ${exportName} = localFont({
  src: [
${src}
  ],
  variable: "--font-${font.name}",
  display: "swap",
});
`;
}

export function nextUsageNote(font: Font, appDir: string): string {
  const exportName = camelCase(font.name);
  return `1. Add the variable class in ${appDir}/layout.tsx:

   import { ${exportName} } from "./fonts/${font.name}";

   <html className={${exportName}.variable}>

2. Use it (Tailwind v4, globals.css):

   @theme inline {
     --font-${font.name}: var(--font-${font.name});
   }

   then: class="font-${font.name}"

   Or plain CSS: font-family: var(--font-${font.name}), ${font.fallback};`;
}
