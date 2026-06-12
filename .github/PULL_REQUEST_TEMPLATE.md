<!--
Submitting a font? Keep this template and fill it in.
Fixing a bug or working on the site/CLI? Delete everything below and describe your change.
-->

## 🅰️ Font submission

**Font name:** <!-- e.g. Inter -->
**Slug (`registry/fonts/<slug>/`):** <!-- lowercase, hyphenated, e.g. inter -->
**Source:** <!-- link to the official repo/page -->
**License:** <!-- OFL-1.1, Apache-2.0, etc. -->

### What I added

```
registry/fonts/<slug>/
├── font.json
└── files/
    ├── <Font>.woff2        # variable preferred; static weights welcome
    └── OFL.txt             # the license text (required)
```

### Checklist

- [ ] Added `registry/fonts/<slug>/font.json` validating against `registry/schema.json`.
- [ ] `.woff2` files live under `registry/fonts/<slug>/files/`.
- [ ] License is **open and redistributable** (OFL-1.1 or equivalent — not freeware / personal-use-only).
- [ ] The license text ships alongside the files as `files/OFL.txt` (the OFL requires it).
- [ ] `submittedBy.github` is set to my handle so I get credited on the font page.
- [ ] `pnpm registry:build` passes locally.
- [ ] Every `files[].path` points at `/r/fonts/<slug>/<file>.woff2` and the file exists.

### font.json

<details>
<summary>Reference shape</summary>

```jsonc
{
  "$schema": "../../schema.json",
  "name": "your-font",
  "displayName": "Your Font",
  "version": "1.0",
  "category": "sans",            // sans · serif · mono · display, or your own slug
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
}
```
</details>

### Anything else

<!-- Notes for reviewers, screenshots, why this font is actually good, etc. -->
