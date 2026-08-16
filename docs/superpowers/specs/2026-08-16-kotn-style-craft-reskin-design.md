# Jehovah Jireh Store — Kotn-Style Craft Reskin (Design Spec)

Date: 2026-08-16
Status: Approved direction (V2 Warm Editorial, chosen at visual gate); spec pending user review.
Reference: https://kotn.com — warm minimal, photography-led, premium basics.

## 1. Goal

Build a second custom theme, **"Jehovah Jireh Store"**, for the existing dev store
`jehovah-jireh-ezbcyrcn.myshopify.com`, styled after Kotn's warm-editorial aesthetic.
The theme is saved to the store's theme library as a **separate unpublished theme**
with a preview link. Publishing is a manual user decision, out of scope.

Not touched by this project:

- The live theme (Horizon).
- The previous custom theme "Jehovah Jireh Custom" (id 160689029305) and its
  `dawn-reskin` git branch — frozen as-is, unmerged.

## 2. Base theme and repo strategy

- Base: **Craft** (free, by Shopify; v16.0.0 current and verified available in
  the Theme Store 2026-08-16 — whatever version the store installs becomes the
  baseline). Craft is not open-source, so it cannot be vendored from GitHub.
- **User-performed step (the only one):** add Craft to the theme library via
  Shopify admin → Online Store → Themes → Add theme → Craft.
- We then pull its code with `shopify theme pull --theme <id>`, commit it as the
  stock baseline on branch **`craft-reskin`** (branched from `main`), and record a
  `theme check` offense baseline before any modification.
- Customization approach mirrors the Dawn project: settings/token changes via
  `config/settings_data.json`, overrides in a dedicated custom CSS asset, new
  sections as new files. Modify stock Craft files only with explicit
  authorization recorded in the ledger. Craft's CSS load order must be
  discovered early (Dawn injected per-section CSS after custom.css; Craft may
  differ) and the override pattern chosen to win by specificity, not
  `!important`, wherever practical.

## 3. Design direction — V2 "Warm Editorial" (user-selected)

Literary, crafted, quietly premium. Serif headlines with italic accents, warm
bone surfaces, clay and olive accents, photography-led.

Design tokens:

| Token | Value | Use |
|---|---|---|
| `--jj2-bg` | `#F6F1E7` (bone) | page background |
| `--jj2-surface` | `#EFE7D8` | tiles, cards, story band |
| `--jj2-ink` | `#24201A` | primary text |
| `--jj2-muted` | `#6B6353` | secondary text (AA-checked; darkened from mockup's `#8A8171`, which fails 4.5:1 on bone) |
| `--jj2-clay` | `#B4573E` | primary buttons, italic emphasis |
| `--jj2-olive` | `#63653F` | announcement bar, newsletter band, story accents |
| `--jj2-border` | `#E2D9C6` | rules and hairlines |

Contrast rule: all body/secondary text meets WCAG AA 4.5:1 on its actual
background; large display text meets 3:1. Verified per pairing during QA, and
button text colors chosen accordingly (e.g. bone-on-clay is display/CTA scale:
verify ≥3:1 or darken clay).

Typography:

- Headings: **Fraunces** (weights 400–600, plus italic for accents), sentence case.
- Body/UI: **Inter** (400/500).
- Both must resolve through Shopify's font library handles if available. If a
  face is missing from the library, fallback order: (1) self-host WOFF2 in theme
  assets with `font-display: swap`, (2) nearest library serif (e.g. Cormorant
  Garamond, Playfair Display) approved at the mockup-fidelity gate. No
  third-party font CDNs in the shipped theme.

Shape language: 2px radius on buttons/inputs, 1px hairline borders, generous
whitespace, thin rules between sections.

## 4. Brand and copy

- Store/brand name: **Jehovah Jireh Store**; header wordmark "Jehovah Jireh" set
  in Fraunces.
- Story anchor: *"Jehovah Jireh — the Lord will provide."* Register: warm,
  literary, faith-rooted, never preachy. The story band frames the products as
  provision: carefully made, fairly priced, meant to last.
- Announcement copy (from approved mockup): "Free shipping over $75 —
  thoughtfully made, kindly priced."
- Newsletter heading: "Letters from the workroom."

## 5. Homepage structure (from approved V2 mockup)

1. Announcement bar — olive background, bone italic text.
2. Header — serif wordmark left, nav (Jackets · Shirts · Pants · Our Story),
   search/cart icons.
3. Split hero — left: serif headline with italic clay emphasis ("Clothed in
   *quiet grace.*"), short sub, clay CTA; right: full-height lifestyle image.
4. Category tiles ×3 — Jackets / Shirts / Pants, photography on surface tiles.
5. Featured products — 4 cards (image, name, price).
6. Story band — "The Lord will provide" in italic olive serif on surface, short
   provision narrative, link to Our Story page.
7. Values strip — three italic items (Natural cloth · Considered cuts · Kindly
   priced).
8. Newsletter band — olive background, bone text, inline email form.
9. Footer — hairline-ruled, muted links, copyright.

## 6. Beyond the homepage

Styled to the same token system, following Craft's stock structure: collection
grid + filters, product page (gallery, variant picker, buy area), cart (Craft's
default cart pattern), search, 404, and an **Our Story** content page holding the
brand narrative. No scope beyond these.

## 7. Mockup-fidelity gate

Before theme styling begins, one high-fidelity static HTML mockup of the V2
homepage (real typography, final tokens, generated imagery) is produced for user
confirmation. This replaces the previous project's three-way gate since the
direction is already chosen; it exists to lock fidelity details (font fallbacks,
imagery style, exact tones) cheaply before implementation.

## 8. Demo catalog — the store must look complete

12 demo products: 4 jackets, 4 shirts, 4 pants.

- Collections: Jackets, Shirts, Pants (+ automatic All).
- Each product: editorial name (e.g. "The Field Jacket"), 2-sentence description
  in brand voice, price in the $58–$168 range, size variants S–XL, and **at least
  2 product images**.
- **Imagery is produced by us** (user directive): AI-generated product
  photography consistent with the V2 palette and natural-fabric mood — no gray
  placeholder boxes anywhere. Homepage hero, category tiles, and story band also
  get generated lifestyle imagery. All images optimized (WebP/JPEG, sized for
  their slots) before upload.
- Creation path: Shopify Admin GraphQL API using a custom-app access token the
  user creates (walkthrough provided; scopes: `write_products`, `read_products`).
  Fallback if the user prefers not to create a token: we produce a
  products CSV + image files and the user imports via admin (two clicks).
- Note: products are store-wide, so they will also appear on the live Horizon
  storefront. Accepted — the dev store is password-protected.

## 9. QA and acceptance criteria

The project is done when:

1. Unpublished theme "Jehovah Jireh Store" exists in the theme library; preview
   link renders the V2 design on homepage, collection, product, cart, search,
   404, and Our Story with the demo catalog — no placeholder imagery or lorem
   text anywhere.
2. `theme check` shows no new offenses vs the recorded stock-Craft baseline.
3. Lighthouse on the local dev server: performance ≥ 0.80, accessibility ≥ 0.95.
4. All token text pairings pass the contrast rule in §3.
5. A **test order** for a demo product completes via Shopify's Bogus Gateway
   (carries over the unmet goal from the previous project).
6. Keyboard navigation works on header menus, drawers/modals, and forms; focus
   states visible throughout.

## 10. Constraints and carried-over lessons

- Storefront password (`aucles`) passed via `--store-password`, never committed.
- `.superpowers/` stays git-excluded (`.git/info/exclude`).
- On this Windows machine, stopping a background `shopify theme dev` shell does
  not kill the node process — find the PID and force-stop it.
- Commit cadence, task briefs/reports, and review flow follow the same SDD
  process as the Dawn project, with a ledger under
  `.superpowers/sdd/2026-08-16-kotn-craft-reskin/`.

## 11. Out of scope

Publishing the theme; edits to Horizon or "Jehovah Jireh Custom"; real product
data or real payment setup; custom domains; apps/integrations; multi-language.
