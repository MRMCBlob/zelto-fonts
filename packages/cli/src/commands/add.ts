import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cancel, confirm, intro, isCancel, log, note, outro, select, spinner } from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { Font } from "@zelto/registry";
import { resolveRegistryUrl } from "../constants";
import { detectProject } from "../detect";
import { cssFontFaceFile, cssUsageNote } from "../generators/css-font-face";
import { nextFontModule, nextUsageNote } from "../generators/next-font";
import { closestMatch, downloadFile, fetchFont, fetchRegistry, RegistryError } from "../registry-client";

export const add = defineCommand({
  meta: {
    name: "add",
    description: "Add a font to your project",
  },
  args: {
    name: {
      type: "positional",
      description: "Font name, e.g. inter",
      required: true,
    },
    force: {
      type: "boolean",
      description: "Overwrite existing files without asking",
      default: false,
    },
    registry: {
      type: "string",
      description: "Registry base URL (or ZELTO_REGISTRY_URL)",
    },
    dir: {
      type: "string",
      description: "Directory for font files (default: <app>/fonts or public/fonts)",
    },
  },
  async run({ args }) {
    const baseUrl = resolveRegistryUrl(args.registry);
    const cwd = process.cwd();

    intro(pc.inverse(" zelto-fonts "));

    const s = spinner();
    s.start(`Fetching ${pc.bold(args.name)} from registry`);

    let font: Font | null;
    try {
      font = await fetchFont(baseUrl, args.name);
      if (!font) {
        const registry = await fetchRegistry(baseUrl);
        const names = registry.items.map((item) => item.name);
        const suggestion = closestMatch(args.name, names);
        s.stop(pc.red(`Font "${args.name}" not found.`));
        if (suggestion) log.info(`Did you mean ${pc.bold(suggestion)}?`);
        log.message(`Available fonts: ${names.join(", ")}`);
        outro(`Browse all fonts at ${pc.underline(`${baseUrl}/fonts`)}`);
        process.exit(1);
      }
      s.stop(`Found ${pc.bold(font.displayName)} ${pc.dim(`v${font.version} · ${font.license.type}`)}`);
    } catch (error) {
      s.stop(pc.red(error instanceof RegistryError ? error.message : `Unexpected error: ${error}`));
      process.exit(1);
    }

    let project = await detectProject(cwd);
    if (project.type === "unknown") {
      const choice = await select({
        message: "Could not detect the project type. Where should the font be installed?",
        options: [
          { value: "next", label: "Next.js (App Router)" },
          { value: "react", label: "React / Vite (plain CSS)" },
        ],
      });
      if (isCancel(choice)) {
        cancel("Cancelled.");
        process.exit(0);
      }
      project =
        choice === "next"
          ? { type: "next", appDir: existsSync(path.join(cwd, "src/app")) ? "src/app" : "app" }
          : { type: "react" };
    } else {
      log.info(
        project.type === "next"
          ? `Detected ${pc.bold("Next.js")} (${project.appDir})`
          : `Detected ${pc.bold("React")} project`,
      );
    }

    const fontsBase =
      args.dir ?? (project.type === "next" ? path.join(project.appDir, "fonts") : path.join("public", "fonts"));
    const filesDir = path.join(cwd, fontsBase, font.name);

    let codePath: string;
    let codeContent: string;
    let usage: string;
    if (project.type === "next") {
      codePath = path.join(cwd, fontsBase, `${font.name}.ts`);
      codeContent = nextFontModule(font);
      usage = nextUsageNote(font, project.appDir);
    } else {
      const hasSrc = existsSync(path.join(cwd, "src"));
      const cssRel = hasSrc
        ? path.join("src", "styles", "fonts", `${font.name}.css`)
        : path.join(fontsBase, font.name, `${font.name}.css`);
      codePath = path.join(cwd, cssRel);
      codeContent = cssFontFaceFile(font);
      const cssPosix = cssRel.split(path.sep).join("/");
      // import path as seen from the project entry (src/main.tsx) or project root
      const importPath = hasSrc ? "./" + cssPosix.slice("src/".length) : "./" + cssPosix;
      usage = cssUsageNote(font, importPath);
    }

    if (!args.force && (existsSync(filesDir) || existsSync(codePath))) {
      const overwrite = await confirm({
        message: `${pc.bold(font.displayName)} already exists in this project. Overwrite?`,
      });
      if (isCancel(overwrite) || !overwrite) {
        cancel("Nothing was changed.");
        process.exit(0);
      }
    }

    const dl = spinner();
    try {
      await mkdir(filesDir, { recursive: true });
      for (const file of font.files) {
        const name = file.path.split("/").pop()!;
        dl.start(`Downloading ${name}`);
        const data = await downloadFile(baseUrl, file.path);
        await writeFile(path.join(filesDir, name), data);
        dl.stop(`${pc.green("✔")} ${name} ${pc.dim(`(${(data.length / 1024).toFixed(0)} kB)`)}`);
      }
      // OFL requires the license to travel with the files — best effort
      try {
        const license = await downloadFile(baseUrl, `/r/fonts/${font.name}/OFL.txt`);
        await writeFile(path.join(filesDir, "OFL.txt"), license);
      } catch {
        /* license file optional */
      }
      await mkdir(path.dirname(codePath), { recursive: true });
      await writeFile(codePath, codeContent);
    } catch (error) {
      dl.stop(pc.red(error instanceof RegistryError ? error.message : `Failed: ${error}`));
      process.exit(1);
    }

    log.success(`Created ${pc.bold(path.relative(cwd, codePath))}`);
    note(usage, "Usage");
    outro(`Done. Font details: ${pc.underline(`${baseUrl}/fonts/${font.name}`)}`);
  },
});
