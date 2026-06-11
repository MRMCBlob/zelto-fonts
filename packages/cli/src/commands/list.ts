import { defineCommand } from "citty";
import pc from "picocolors";
import { FONT_CATEGORIES } from "@zelto/registry/constants";
import { resolveRegistryUrl } from "../constants";
import { fetchRegistry, RegistryError } from "../registry-client";

const CATEGORY_LABELS: Record<string, string> = {
  sans: "Sans Serif",
  serif: "Serif",
  mono: "Monospace",
  display: "Display",
};

export const list = defineCommand({
  meta: {
    name: "list",
    description: "List all fonts in the registry",
  },
  args: {
    registry: {
      type: "string",
      description: "Registry base URL (or ZELTO_REGISTRY_URL)",
    },
  },
  async run({ args }) {
    const baseUrl = resolveRegistryUrl(args.registry);

    let registry;
    try {
      registry = await fetchRegistry(baseUrl);
    } catch (error) {
      console.error(pc.red(error instanceof RegistryError ? error.message : `Unexpected error: ${error}`));
      process.exit(1);
    }

    console.log(`\n${pc.inverse(" zelto ")} ${registry.items.length} fonts · ${pc.dim(baseUrl)}\n`);

    for (const category of FONT_CATEGORIES) {
      const fonts = registry.items.filter((item) => item.category === category);
      if (fonts.length === 0) continue;
      console.log(pc.bold(pc.underline(CATEGORY_LABELS[category] ?? category)));
      for (const font of fonts) {
        const weights = font.variable
          ? pc.yellow("variable")
          : font.weights.join(", ");
        console.log(
          `  ${pc.bold(font.displayName.padEnd(18))} ${pc.dim(font.name.padEnd(18))} ${weights}  ${pc.dim(font.designer)}`,
        );
      }
      console.log();
    }

    console.log(pc.dim(`Install: npx zelto-fonts add <name>\n`));
  },
});
