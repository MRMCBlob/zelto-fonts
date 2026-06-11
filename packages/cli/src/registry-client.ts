import type { Font, Registry } from "@zelto/registry";

export class RegistryError extends Error {}

async function getJson(url: string): Promise<unknown | null> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (cause) {
    throw new RegistryError(`Could not reach registry at ${url}`, { cause });
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new RegistryError(`Registry responded with ${res.status} for ${url}`);
  return res.json();
}

export async function fetchFont(baseUrl: string, name: string): Promise<Font | null> {
  return (await getJson(`${baseUrl}/r/${name}.json`)) as Font | null;
}

export async function fetchRegistry(baseUrl: string): Promise<Registry> {
  const registry = (await getJson(`${baseUrl}/r/registry.json`)) as Registry | null;
  if (!registry) throw new RegistryError(`No registry found at ${baseUrl}/r/registry.json`);
  return registry;
}

export async function downloadFile(baseUrl: string, filePath: string): Promise<Buffer> {
  const url = `${baseUrl}${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new RegistryError(`Download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Smallest edit distance — used for "did you mean" suggestions. */
export function closestMatch(input: string, candidates: string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const candidate of candidates) {
    const dist = levenshtein(input, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return bestDist <= Math.max(2, Math.floor(input.length / 3)) ? best : null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i, ...new Array<number>(n).fill(0)];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[n]!;
}
