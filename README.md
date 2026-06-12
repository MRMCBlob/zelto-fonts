# zelto.

Fonts that are actually good — a curated open-source font registry with a website and a CLI that installs fonts into React projects like components.

## Techstack:
![NPM Badge](https://svgl-badge.vercel.app/api/Software/NPM?theme=dark)**,** ![PNPM Badge](https://svgl-badge.vercel.app/api/Software/Pnpm?theme=dark)**,** ![NEXT.JS Badge](https://svgl-badge.vercel.app/api/Framework/Next.js?theme=dark)**,** ![React Badge](https://svgl-badge.vercel.app/api/Library/React?theme=dark)**,** ![TS Badge](https://svgl-badge.vercel.app/api/Language/TypeScript?theme=dark)**,** ![GitHub Badge](https://svgl-badge.vercel.app/api/Software/GitHub?theme=dark)

```sh
npx zelto-fonts add inter
```

## Structure

| Path | What |
|---|---|
| `registry/fonts/<slug>/` | Source of truth: `font.json` + `files/*.woff2` + `files/OFL.txt` |
| `packages/registry` | `@zelto/registry` — zod schema + shared types (private) |
| `packages/cli` | `zelto-fonts` — the published CLI (`add`, `list`) |
| `scripts/build-registry.ts` | Validates the registry, emits `apps/web/public/r/**` + preview CSS |
| `apps/web` | Next.js site: catalog, type tester, font pages, docs, submit |

## Development

```sh
pnpm install
pnpm dev          # registry build + next dev
pnpm build        # registry build + web build + CLI bundle
```

Test the CLI against a local registry:

```sh
pnpm --filter web start --port 3100
node packages/cli/dist/index.mjs add inter --registry http://localhost:3100
```

## Adding a font

See `/submit` on the site. Short version: add `registry/fonts/<slug>/` with a schema-valid `font.json` (`registry/schema.json` gives editor autocomplete), woff2 files, and the license text. `pnpm registry:build` must pass. OFL-class licenses only.

## Registry API

```
GET /r/registry.json     full catalog
GET /r/<name>.json       single font
GET /r/fonts/<name>/*    woff2 + license
```

File URLs are relative — mirror `/r` anywhere and point the CLI at it with `ZELTO_REGISTRY_URL`.
