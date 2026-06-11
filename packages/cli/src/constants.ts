export const DEFAULT_REGISTRY_URL = "https://fonts.zelto.app";

export function resolveRegistryUrl(flag?: string): string {
  const url = flag ?? process.env.ZELTO_REGISTRY_URL ?? DEFAULT_REGISTRY_URL;
  return url.replace(/\/+$/, "");
}
