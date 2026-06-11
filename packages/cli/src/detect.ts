import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type ProjectInfo =
  | { type: "next"; appDir: string }
  | { type: "react" }
  | { type: "unknown" };

export async function detectProject(cwd: string): Promise<ProjectInfo> {
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) return { type: "unknown" };

  let deps: Record<string, string> = {};
  try {
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    deps = { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    return { type: "unknown" };
  }

  if (deps.next) {
    for (const candidate of ["src/app", "app"]) {
      if (existsSync(path.join(cwd, candidate))) {
        return { type: "next", appDir: candidate };
      }
    }
    // Next.js without an app dir (pages router) — treat like a generic React project
    return { type: "react" };
  }
  if (deps.react) return { type: "react" };
  return { type: "unknown" };
}
