# Design tokens — Jehovah Jireh

**Chosen direction:** v3 "Static" — bold streetwear (`mockups/fashion-v3-static.html`)

**Brand:** JEHOVAH JIREH
**Tagline:** "LOUD BY DESIGN."

## Tokens

| Token | Value |
|---|---|
| `--jj-bg` | `#0E0E0E` |
| `--jj-surface` | `#1A1A1A` |
| `--jj-text` | `#F2F2F2` |
| `--jj-muted` | `#9A9A9A` |
| `--jj-accent` | `#D8FF3E` |
| `--jj-radius` | `0` |
| Heading font | Archivo Black |
| Body font | Space Grotesk |

This file is the single source of truth for all later styling decisions. Every later task styles only through the `--jj-*` CSS variables defined in `assets/custom.css` (`:root`).
