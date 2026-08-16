# Jehovah Jireh Store (Kotn-Style Craft Reskin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a second custom theme, "Jehovah Jireh Store", on Shopify's free Craft theme, styled after kotn.com (V2 Warm Editorial direction), with a complete 12-product demo catalog and generated imagery, pushed unpublished to the dev store.

**Architecture:** Craft stays the base; customizations are layered cleanest-first — (1) theme settings in `config/settings_data.json`, (2) one override stylesheet `assets/custom.css`, (3) new Liquid sections + JSON templates only where the first two can't reach. Craft is a Dawn-family theme, so the Dawn project's hooks and patterns mostly carry over — but every hook must be verified against the pulled Craft files before use. Store content (products, collections, Our Story page) is created via the Admin GraphQL API by a committed script.

**Tech Stack:** Shopify CLI 3.x (already installed + authenticated), Craft (Online Store 2.0), Liquid, vanilla CSS, Node 20 (global `fetch`/`FormData`), Admin GraphQL API `2026-01`, git.

## Global Constraints

- Store: `jehovah-jireh-ezbcyrcn.myshopify.com`; project dir `d:\Claude\shopify-store`; branch `craft-reskin`.
- **Do not touch** the live theme (Horizon), the previous theme "Jehovah Jireh Custom" (id 160689029305), or the `dawn-reskin` branch.
- Never edit Craft's stock `.css` files. All CSS overrides go in `assets/custom.css`. The only stock-file edit allowed without ledger authorization is the one-line `custom.css` include in `layout/theme.liquid`.
- Design tokens (exact values, defined once in `custom.css`, consumed everywhere):
  `--jj2-bg: #F6F1E7` · `--jj2-surface: #EFE7D8` · `--jj2-ink: #24201A` · `--jj2-muted: #6B6353` · `--jj2-clay: #B4573E` · `--jj2-olive: #63653F` · `--jj2-border: #E2D9C6`.
- Button/CTA text on clay is `#FFFFFF` (4.8:1 — bone on clay is only 4.3:1). Bone text on olive passes (5.4:1). Contrast rule: 4.5:1 body text, 3:1 large display text, verified per pairing.
- Fonts: Fraunces (headings, sentence case, italic accents) + Inter (body) via Shopify font-library handles; if a face is missing, self-host WOFF2 in `assets/` — no third-party font CDNs in the shipped theme (Google Fonts allowed in `mockups/` only).
- Brand copy (verbatim): wordmark "Jehovah Jireh"; announcement "Free shipping over $75 — thoughtfully made, kindly priced."; hero heading "Clothed in *quiet grace.*" (italic clay on "quiet grace."); story heading "The Lord will provide"; values "Natural cloth", "Considered cuts", "Kindly priced"; newsletter heading "Letters from the workroom". Register: warm, literary, never preachy.
- The finished theme shows **no placeholder imagery and no lorem text anywhere** (user directive).
- Push only **unpublished** themes; theme name "Jehovah Jireh Store". Publishing is the user's manual decision — never run `shopify theme publish`.
- `shopify theme check` before each commit: no NEW offenses vs. the Task 1 baseline. Commit at the end of every task.
- Storefront password is `aucles` — pass via `--store-password` only; never commit it. The Admin API token lives in the `SHOPIFY_ADMIN_TOKEN` env var only; never commit it.
- Windows quirk: stopping a background `shopify theme dev` shell does NOT kill the node process — find the PID (`netstat -ano | findstr 9292`) and force-stop it.
- SDD ledger: `.superpowers/sdd/2026-08-16-kotn-craft-reskin/` (git-excluded via `.git/info/exclude`).
- Two USER GATES: mockup fidelity (after Task 3) and the final report (after Task 11, publish reminder only). One USER ACTION each in Task 1 (install Craft) and Task 4 (create API token).

## File Structure

```
d:\Claude\shopify-store\            (branch craft-reskin)
├── docs/superpowers/…              # spec + this plan (exists)
├── shopify.theme.toml              # Task 1 (recreate; main lacks it)
├── .gitignore                      # Task 1 (recreate; main lacks it)
├── content/
│   ├── catalog.json                # Task 2: 12 products, single source of truth
│   └── images/
│       ├── site/                   # hero.jpg, cat-jackets.jpg, cat-shirts.jpg, cat-pants.jpg, story.jpg
│       └── products/               # <handle>-1.jpg, <handle>-2.jpg (24 files)
├── mockups/v2-warm-editorial.html  # Task 3: high-fidelity static mockup
├── scripts/create-catalog.mjs      # Task 4: Admin API loader
├── design/tokens.md                # Task 5: token source of truth
└── (Craft theme, pulled in Task 1)
    ├── assets/custom.css           # Task 5: ALL CSS overrides live here
    ├── layout/theme.liquid         # Task 5: one-line include of custom.css
    ├── config/settings_data.json   # Task 5: colors + fonts + cart type
    ├── sections/editorial-hero.liquid  # Task 7: the only new section
    └── templates/index.json, collection.json, product.json, page.our-story.json
```

---

### Task 1: Craft install (USER ACTION), pull, baseline

**Files:**
- Create: `shopify.theme.toml`, `.gitignore`
- Create (pulled): entire Craft theme tree (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: local Craft copy served by `shopify theme dev -e dev --store-password aucles` at `http://127.0.0.1:9292`; theme-check baseline offense count recorded in the commit message; Craft version + confirmed section inventory recorded in the ledger.

- [ ] **Step 1: Recreate store config and .gitignore**

`shopify.theme.toml`:
```toml
[environments.dev]
store = "jehovah-jireh-ezbcyrcn"
```

`.gitignore`:
```
.shopify/
node_modules/
lighthouse-*.json
chat-history/
```

- [ ] **Step 2: Verify CLI + auth**

Run: `shopify theme list -e dev`
Expected: a table of themes (Horizon live, "Jehovah Jireh Custom" unpublished). If a browser login opens, the **user must approve it** (one time).

- [ ] **Step 3: USER ACTION — install Craft**

Ask the user to: Shopify admin → **Online Store → Themes → Add theme → Explore free themes → Craft → Add**. Wait for confirmation. Then re-run `shopify theme list -e dev` — Craft appears with an ID. Record the ID and version.

- [ ] **Step 4: Pull Craft (not the live theme)**

Run: `shopify theme pull -e dev --theme <CRAFT_ID>`
Expected: theme folders appear at repo root. Verify identity: `config/settings_schema.json` contains `"theme_name": "Craft"`. **Never** use `--live` (that's Horizon).

- [ ] **Step 5: Confirm the section inventory this plan relies on**

Run: `ls sections/`
Expected present: `image-banner`, `featured-collection`, `collection-list`, `rich-text`, `multicolumn`, `newsletter`, `main-collection-product-grid` (or equivalent), `main-product`, `cart-drawer` (asset/snippet), `announcement-bar` or header-group equivalent. If a name differs, record the actual name in the ledger — later tasks say "the Craft equivalent" and mean this record.

- [ ] **Step 6: Record theme-check baseline**

Run: `shopify theme check`
Expected: completes; record the offense count — this is the baseline every later task compares against.

- [ ] **Step 7: Smoke-test the dev server**

Run in background: `shopify theme dev -e dev --store-password aucles`
Then: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292`
Expected: `200`. Stop the server (kill the PID; see Global Constraints).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: pull stock Craft from dev store (theme-check baseline: N offenses)"
```

---

### Task 2: Catalog data + full imagery set

**Files:**
- Create: `content/catalog.json`, `content/images/products/<handle>-{1,2}.jpg` (24 files), `content/images/site/{hero,cat-jackets,cat-shirts,cat-pants,story}.jpg` (5 files)

**Interfaces:**
- Consumes: nothing (independent of the theme).
- Produces: `content/catalog.json` (read verbatim by Task 4's script) and all 29 images (used by Task 3's mockup, Task 4's uploads, Task 7's theme assets).

- [ ] **Step 1: Write `content/catalog.json`** — exactly this content:

```json
{
  "vendor": "Jehovah Jireh",
  "sizes": ["S", "M", "L", "XL"],
  "products": [
    { "handle": "the-field-jacket", "title": "The Field Jacket", "type": "Jackets", "price": "148.00",
      "img": "washed tan cotton-canvas field jacket with corduroy collar and patch pockets",
      "description": "Cut from washed cotton canvas with a corduroy collar and deep patch pockets. Made to soften, weather, and stay with you for years." },
    { "handle": "the-chore-coat", "title": "The Chore Coat", "type": "Jackets", "price": "162.00",
      "img": "heavyweight brushed-twill chore coat in warm umber, three front pockets",
      "description": "A workwear classic in heavyweight brushed twill, squared at the shoulder and roomy through the body. Three pockets, no fuss, endless use." },
    { "handle": "the-harvest-overshirt", "title": "The Harvest Overshirt", "type": "Jackets", "price": "128.00",
      "img": "olive herringbone-weave overshirt with buttoned chest pockets",
      "description": "Halfway between shirt and jacket, in a dense olive herringbone weave. Layer it over a tee in spring or under the Chore Coat come winter." },
    { "handle": "the-evening-coat", "title": "The Evening Coat", "type": "Jackets", "price": "168.00",
      "img": "longline wool-blend coat in deep umber brown, softly structured",
      "description": "A longline wool-blend coat in deep umber, quiet enough for church and warm enough for the walk home. Fully lined, softly structured." },
    { "handle": "the-oxford-shirt", "title": "The Oxford Shirt", "type": "Shirts", "price": "68.00",
      "img": "stone-washed cotton oxford shirt in soft ecru with button-down collar",
      "description": "Our everyday oxford in stone-washed cotton, cut relaxed with a soft button-down collar. It only gets better with wear." },
    { "handle": "the-linen-shirt", "title": "The Linen Shirt", "type": "Shirts", "price": "74.00",
      "img": "warm bone flax-linen shirt, garment-washed, relaxed drape",
      "description": "European flax linen in warm bone, garment-washed for softness from the first wear. Breathes easy through long summer days." },
    { "handle": "the-flannel-shirt", "title": "The Flannel Shirt", "type": "Shirts", "price": "78.00",
      "img": "double-brushed flannel shirt in muted clay-and-cream check",
      "description": "Double-brushed flannel in a muted clay check, heavy enough to wear as a light layer. A quiet plaid for loud winters." },
    { "handle": "the-band-collar-shirt", "title": "The Band Collar Shirt", "type": "Shirts", "price": "72.00",
      "img": "collarless band-collar cotton poplin shirt in soft sage green",
      "description": "A collarless cotton poplin shirt in soft sage, clean lines from every angle. Tucks in for Sunday, hangs loose for Saturday." },
    { "handle": "the-everyday-pant", "title": "The Everyday Pant", "type": "Pants", "price": "88.00",
      "img": "straight-leg cotton-twill trousers in warm taupe, flat front",
      "description": "A straight-leg cotton twill pant in warm taupe, cut to sit easy at the waist. The pair you reach for without thinking." },
    { "handle": "the-wide-leg-trouser", "title": "The Wide Leg Trouser", "type": "Pants", "price": "98.00",
      "img": "high-rise wide-leg trousers in oat melange with pressed crease",
      "description": "High-rise and generous through the leg, in a drapey wool-touch weave. Pressed crease, unpressured attitude." },
    { "handle": "the-drawstring-pant", "title": "The Drawstring Pant", "type": "Pants", "price": "82.00",
      "img": "garment-dyed cotton drawstring pants in faded clay, tapered leg",
      "description": "Garment-dyed cotton with an elastic drawstring waist and tapered leg. Made for slow mornings and long evenings." },
    { "handle": "the-canvas-work-pant", "title": "The Canvas Work Pant", "type": "Pants", "price": "94.00",
      "img": "rugged duck-canvas work pants in sand, reinforced knees",
      "description": "Rugged duck canvas, reinforced at the knee, softened with every wash. Built for work, kept for the weekend." }
  ]
}
```

- [ ] **Step 2: Smoke-test image generation (decides the imagery path)**

Generate ONE image — `content/images/products/the-oxford-shirt-1.jpg` — using the available AI image pipeline (the `design` / `banner-design` skills' generator). Prompt template A with the oxford's `img` descriptor (templates in Step 3).
Expected: a photorealistic garment shot lands in the folder.
**Fallback (only if generation is unavailable — no API key / skill errors):** download curated stock photography from Unsplash (free license) matching each `img` descriptor and the palette; record `imagery: unsplash-fallback` in the ledger — the Task 3 gate then explicitly asks the user to accept the sourced-photo look.

- [ ] **Step 3: Generate all 24 product images**

For each product in `catalog.json`, two images from these templates (substitute `{img}` from the catalog):

- Template A (`<handle>-1.jpg`, main): "High-end fashion editorial product photograph, magazine quality: {img}, displayed on a wooden hanger against a plain warm bone (#F6F1E7) studio wall, soft diffused natural window light from the left, gentle shadow, visible fabric texture, muted earthy palette of bone, clay, olive and taupe, styled like a premium lookbook, no model, no text, 4:5 portrait"

User directive (2026-08-16): imagery must read as fashionable and striking — premium-lookbook quality, never flat catalog filler. If a generated image looks dull, regenerate it rather than shipping it.
- Template B (`<handle>-2.jpg`, detail): "Overhead flat-lay detail photograph of {img}, folded neatly on warm bone linen cloth, soft natural light, visible weave and stitching texture, muted earthy palette, no text, 4:5 portrait"

- [ ] **Step 4: Generate the 5 site images**

- `site/hero.jpg` (4:5): "Editorial lifestyle photograph: person in earth-tone relaxed clothing, olive overshirt and taupe trousers, standing beside a sunlit window in a warm minimal interior with linen curtains, face turned away from camera, soft golden natural light, muted bone and clay palette, calm quiet mood, no text"
- `site/cat-jackets.jpg` (4:5): "Editorial photograph of three earth-tone jackets on wooden hangers against a warm bone plaster wall, soft window light, muted palette, no text"
- `site/cat-shirts.jpg` (4:5): "Editorial photograph of folded natural-fabric shirts in bone, sage and clay stacked on a linen-covered table, soft window light, no text"
- `site/cat-pants.jpg` (4:5): "Editorial photograph of neatly draped taupe and sand trousers over a wooden rail, warm bone background, soft window light, no text"
- `site/story.jpg` (3:2): "Close overhead photograph of a tailor's workroom table: natural linen fabric, wooden thread spools, brass scissors, warm bone tones, soft window light, quiet craftsmanship mood, no text"

- [ ] **Step 5: Optimize** — every image ≤ 2048px long edge and ≤ 500KB. If any exceed: `magick mogrify -resize 2048x2048^> -quality 82 <files>` (install ImageMagick via `winget install ImageMagick.ImageMagick` if needed).

- [ ] **Step 6: Verify completeness** — 24 files in `content/images/products/` (12 handles × `-1`/`-2`), 5 in `content/images/site/`, none under 20KB (a sub-20KB "image" is usually an error page).

- [ ] **Step 7: Commit**

```bash
git add content/
git commit -m "feat: demo catalog data + generated imagery set (29 images)"
```

---

### Task 3: High-fidelity homepage mockup (then USER GATE: fidelity)

**Files:**
- Create: `mockups/v2-warm-editorial.html`

**Interfaces:**
- Consumes: `content/images/` from Task 2; token values + copy strings from Global Constraints.
- Produces: the user-approved visual reference for Tasks 5–10. Any tone/font/imagery adjustments decided at the gate are recorded in the ledger and override this plan's token table.

- [ ] **Step 1: Build `mockups/v2-warm-editorial.html`** — one standalone file, all CSS in a `<style>` block using `--jj2-*` variables, Google Fonts CDN allowed here only (`Fraunces:ital,wght@0,400..600;1,400..600` + `Inter:400,500`). Full-scale page (not the compressed brainstorm card), images referenced relatively (`../content/images/…`), structure exactly:

```
announcement bar (olive bg, bone italic text, the verbatim announcement copy)
→ header (Fraunces wordmark "Jehovah Jireh" left; nav: Jackets · Shirts · Pants · Our Story; search/bag right; bone bg, hairline bottom border)
→ split hero (left 55%: Fraunces 64px "Clothed in *quiet grace.*" with italic clay em, 16px Inter sub, clay button "Discover the collection" with #FFF text, 2px radius; right 45%: site/hero.jpg full-bleed)
→ category tiles (3-up: cat-jackets/shirts/pants images on surface tiles, Fraunces label under each)
→ featured products (Fraunces "The essentials" heading; 4 cards: products/the-field-jacket-1.jpg $148, the-oxford-shirt-1.jpg $68, the-everyday-pant-1.jpg $88, the-linen-shirt-1.jpg $74; Inter names, muted prices)
→ story band (surface bg; italic olive Fraunces "The Lord will provide"; 2-sentence provision narrative from the spec's register; "Read our story" text link in clay)
→ values strip (3 italic items, hairline top border)
→ newsletter band (olive bg, bone text, Fraunces "Letters from the workroom", inline email input + clay button)
→ footer (bone bg, hairline top border, muted links: Shipping · Returns · Contact, copyright "© Jehovah Jireh Store")
```

- [ ] **Step 2: Verify rendering** — open in browser: no horizontal scroll at 375px (hero stacks image-below-text on mobile via `@media (max-width: 749px)`), all 12 referenced images load (no broken-image icons), heading font renders as Fraunces (devtools computed style).

- [ ] **Step 3: Present via the visual companion if alive, else directly** — check `.superpowers/brainstorm/2014-1786899389/state/` (server-info exists, no server-stopped): if alive, copy the mockup into the companion content dir as a new filename with image paths made absolute (`file:///D:/Claude/shopify-store/content/images/...` won't serve — instead copy the referenced images next to the mockup copy, or restart the companion with the same `--project-dir` and use its `/files/` serving). Simplest reliable path: tell the user to open `mockups/v2-warm-editorial.html` directly in their browser.

- [ ] **Step 4: Commit**

```bash
git add mockups/
git commit -m "feat: high-fidelity V2 warm-editorial homepage mockup"
```

- [ ] **Step 5: USER GATE — fidelity approval.** Ask the user to confirm: imagery style (especially if the Unsplash fallback was used), Fraunces/Inter pairing, exact tones, copy. Record the verdict + any adjustments in the ledger. **Do not proceed without an explicit approval.**

---

### Task 4: Demo catalog on the store via Admin API (USER ACTION: token)

**Files:**
- Create: `scripts/create-catalog.mjs`

**Interfaces:**
- Consumes: `content/catalog.json` + `content/images/` from Task 2.
- Produces: on the store — 12 ACTIVE products (each: 4 size variants, 2 images, published to Online Store), 3 smart collections (`jackets`, `shirts`, `pants`, each with an image), 1 manual collection `essentials` (4 hand-picked products), 1 published page `our-story`. Tasks 7–11 rely on these handles exactly.

- [ ] **Step 1: USER ACTION — create the Admin API token**

Walk the user through: admin → **Settings → Apps and sales channels → Develop apps** (enable custom app development if prompted) → **Create an app** named `catalog-loader` → **Configure Admin API scopes**: `read_products, write_products, read_files, write_files, read_publications, write_publications, read_online_store_pages, write_online_store_pages` → **Install app** → reveal the Admin API access token (`shpat_…`) and paste it into the chat. Note to user: it's a secret with write access to store data; the app can be uninstalled after this task.

- [ ] **Step 2: Write `scripts/create-catalog.mjs`** — Node 20+, no dependencies:

```js
// Usage: SHOPIFY_ADMIN_TOKEN=shpat_xxx node scripts/create-catalog.mjs
import { readFileSync } from "node:fs";

const STORE = "jehovah-jireh-ezbcyrcn.myshopify.com";
const API = `https://${STORE}/admin/api/2026-01/graphql.json`;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
if (!TOKEN) throw new Error("Set SHOPIFY_ADMIN_TOKEN");
const catalog = JSON.parse(readFileSync("content/catalog.json", "utf8"));

async function gql(query, variables) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  const op = Object.values(j.data)[0];
  if (op?.userErrors?.length) throw new Error(JSON.stringify(op.userErrors));
  return j.data;
}

async function stageAndUpload(path, filename) {
  const d = await gql(
    `mutation($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){
       stagedTargets{url resourceUrl parameters{name value}} userErrors{field message}}}`,
    { input: [{ resource: "IMAGE", filename, mimeType: "image/jpeg", httpMethod: "POST" }] });
  const t = d.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of t.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([readFileSync(path)]), filename);
  const up = await fetch(t.url, { method: "POST", body: form });
  if (!up.ok) throw new Error(`upload ${filename}: ${up.status}`);
  return t.resourceUrl;
}

async function onlineStorePublicationId() {
  const d = await gql(`{ publications(first: 10) { nodes { id name } } }`);
  const pub = d.publications.nodes.find(p => p.name === "Online Store");
  if (!pub) throw new Error("Online Store publication not found");
  return pub.id;
}

const PRODUCT_SET = `mutation($input: ProductSetInput!) {
  productSet(synchronous: true, input: $input) {
    product { id handle } userErrors { field message } } }`;
const PUBLISH = `mutation($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable { publicationCount } userErrors { field message } } }`;

const pubId = await onlineStorePublicationId();
const created = {};
for (const p of catalog.products) {
  const files = [];
  for (const n of [1, 2])
    files.push({ originalSource: await stageAndUpload(
      `content/images/products/${p.handle}-${n}.jpg`, `${p.handle}-${n}.jpg`), contentType: "IMAGE" });
  const d = await gql(PRODUCT_SET, { input: {
    title: p.title, handle: p.handle, descriptionHtml: `<p>${p.description}</p>`,
    vendor: catalog.vendor, productType: p.type, status: "ACTIVE",
    productOptions: [{ name: "Size", position: 1, values: catalog.sizes.map(s => ({ name: s })) }],
    variants: catalog.sizes.map(s => ({ optionValues: [{ optionName: "Size", name: s }], price: p.price })),
    files } });
  created[p.handle] = d.productSet.product.id;
  await gql(PUBLISH, { id: created[p.handle], input: [{ publicationId: pubId }] });
  console.log("product:", p.handle);
}

for (const c of [["Jackets", "jackets"], ["Shirts", "shirts"], ["Pants", "pants"]]) {
  const img = await stageAndUpload(`content/images/site/cat-${c[1]}.jpg`, `cat-${c[1]}.jpg`);
  const d = await gql(
    `mutation($input: CollectionInput!){collectionCreate(input:$input){
       collection{id handle} userErrors{field message}}}`,
    { input: { title: c[0], handle: c[1], image: { src: img },
        ruleSet: { appliedDisjunctively: false,
          rules: [{ column: "TYPE", relation: "EQUALS", condition: c[0] }] } } });
  await gql(PUBLISH, { id: d.collectionCreate.collection.id, input: [{ publicationId: pubId }] });
  console.log("collection:", c[1]);
}

const ess = await gql(
  `mutation($input: CollectionInput!){collectionCreate(input:$input){
     collection{id} userErrors{field message}}}`,
  { input: { title: "The Essentials", handle: "essentials" } });
await gql(
  `mutation($id: ID!, $productIds: [ID!]!){collectionAddProductsV2(id:$id, productIds:$productIds){
     job{id} userErrors{field message}}}`,
  { id: ess.collectionCreate.collection.id,
    productIds: ["the-field-jacket", "the-oxford-shirt", "the-everyday-pant", "the-linen-shirt"].map(h => created[h]) });
await gql(PUBLISH, { id: ess.collectionCreate.collection.id, input: [{ publicationId: pubId }] });
console.log("collection: essentials");

await gql(
  `mutation($page: PageCreateInput!){pageCreate(page:$page){page{id handle} userErrors{field message}}}`,
  { page: { title: "Our Story", handle: "our-story", isPublished: true, body:
`<p><em>Jehovah Jireh — the Lord will provide.</em></p>
<p>This store began with a promise, not a product. We make a small wardrobe of jackets, shirts and pants from natural cloth — cut with care, sewn to last, and priced the way a neighbour would price them.</p>
<p>We believe good clothing is a quiet form of provision: it serves you daily, asks for little, and stays with you for years. Every seam is our way of keeping that promise.</p>` } });
console.log("page: our-story");
```

- [ ] **Step 3: Run it**

Run (PowerShell): `$env:SHOPIFY_ADMIN_TOKEN = "<token from user>"; node scripts/create-catalog.mjs`
Expected: 12 `product:` lines, 4 `collection:` lines, `page: our-story`, no thrown errors. If a mutation fails on a field name (API version drift), check the current schema at shopify.dev/docs/api/admin-graphql and adjust — record the change in the ledger.

- [ ] **Step 4: Verify on the storefront** — start `shopify theme dev -e dev --store-password aucles`; check `http://127.0.0.1:9292/collections/jackets` shows 4 products with photos; `/products/the-oxford-shirt` shows price $68 and sizes S–XL; `/pages/our-story` renders. Stop the server.

- [ ] **Step 5: Commit + advise token cleanup**

```bash
git add scripts/
git commit -m "feat: Admin API catalog loader; 12 products, 4 collections, story page live"
```

Tell the user they may now uninstall the `catalog-loader` app (or keep it for future edits).

---

### Task 5: Design tokens → theme settings + custom.css scaffold

**Files:**
- Create: `design/tokens.md`, `assets/custom.css`
- Modify: `layout/theme.liquid` (one include line), `config/settings_data.json` (colors, fonts, cart type)

**Interfaces:**
- Consumes: gate-approved tokens from Task 3 (Global Constraints table unless the ledger overrides).
- Produces: `--jj2-*` variables on `:root` in `custom.css`; Fraunces/Inter loading through theme settings; `cart_type: "drawer"`. Every later task styles ONLY through these variables and `custom.css`.

- [ ] **Step 1: Write `design/tokens.md`** — the Global Constraints token table + font decisions + the verbatim copy strings, plus any gate adjustments. Single source of truth from here on.

- [ ] **Step 2: Create `assets/custom.css` scaffold:**

```css
/* ============================================================
   Jehovah Jireh Store — all custom overrides. Craft files stay stock.
   Sections: 1 tokens · 2 global · 3 chrome (announcement/header/footer)
             4 homepage · 5 collection · 6 product · 7 cart · 8 story page
   NOTE: Craft (Dawn-family) injects per-section CSS after custom.css —
   overrides of section components must win by specificity, not !important.
   ============================================================ */

/* 1. Tokens */
:root {
  --jj2-bg: #F6F1E7;
  --jj2-surface: #EFE7D8;
  --jj2-ink: #24201A;
  --jj2-muted: #6B6353;
  --jj2-clay: #B4573E;
  --jj2-olive: #63653F;
  --jj2-border: #E2D9C6;
  --jj2-radius: 2px;
}

/* 2. Global */
body {
  background: var(--jj2-bg);
  color: var(--jj2-ink);
}
.button:not(.button--secondary),
.shopify-challenge__button,
button.shopify-payment-button__button--unbranded {
  background: var(--jj2-clay);
  color: #ffffff;
  border-radius: var(--jj2-radius);
}
```

- [ ] **Step 3: Include from `layout/theme.liquid`** — directly after the line loading `base.css` (search `'base.css' | asset_url`), add:

```liquid
{{ 'custom.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 4: Fonts + colors in `config/settings_data.json`** — find the active settings object (Craft, like Dawn, may keep `"current"` as a bare preset-name string with real values under `presets.<name>` — edit where the values actually live; match existing keys, never invent):
  - `"type_header_font": "fraunces_n5"`, `"type_body_font": "inter_n4"`.
  - First color scheme: background `#F6F1E7`, text `#24201A`, button `#B4573E`, button label `#FFFFFF`, secondary button label `#24201A`.
  - Second color scheme (used by story band Task 7): background `#EFE7D8`, text `#24201A`.
  - Third color scheme (olive bands): background `#63653F`, text `#F6F1E7`, button `#B4573E`, button label `#FFFFFF`.
  - `"cart_type": "drawer"`.

- [ ] **Step 5: Verify fonts actually load** — dev server, inspect an `<h2>`: computed font-family must show Fraunces (not a serif fallback). If a handle is rejected (CLI error or silent fallback): download the WOFF2s (fonts.google.com → Fraunces 400/500/600 + italic 400, Inter 400/500), place in `assets/`, add `@font-face` blocks at the top of `custom.css` section 1 with `font-display: swap`, and set `body`/heading `font-family` rules there. Record which path was used in the ledger.

- [ ] **Step 6: Verify tokens applied** — homepage shows bone background and ink text; a primary button (e.g. product page add-to-cart) is clay with white label.

- [ ] **Step 7: Theme check + commit**

```bash
git add assets/custom.css layout/theme.liquid config/settings_data.json design/
git commit -m "feat: V2 tokens via settings + custom.css scaffold"
```

---

### Task 6: Global chrome — announcement bar, header, footer

**Files:**
- Modify: `assets/custom.css` (section 3), `sections/header-group.json` (or Craft's announcement equivalent — announcement text setting only)

**Interfaces:**
- Consumes: `--jj2-*` variables from Task 5.
- Produces: styled chrome on every page; later tasks style page bodies only.

- [ ] **Step 1: Verify hooks, then style announcement + header** — grep the pulled files for `.announcement-bar`, `.header-wrapper`, `.header__heading-link`, `.header__menu-item`, `.header__icon` (Dawn-family names; if absent, find the analogous class in the same file and record in ledger). Append to section 3: announcement bar olive bg + bone italic text; header bone bg with `border-bottom: 1px solid var(--jj2-border)`; wordmark in heading font; nav links ink with clay hover + visible `:focus-visible` (restyle outline color, never remove).

- [ ] **Step 2: Set announcement + nav content** — announcement text to the verbatim copy string. Nav: main menu must read Jackets · Shirts · Pants · Our Story — Craft renders the store's main menu; if the store's `main-menu` doesn't match, ask the user to adjust it in admin (Content → Menus) OR record that nav labels come from the existing menu (menus have no Admin-API write scope in our token set — this is a known manual step; queue it for the user with exact instructions: main-menu items → Jackets → `/collections/jackets`, Shirts → `/collections/shirts`, Pants → `/collections/pants`, Our Story → `/pages/our-story`).

- [ ] **Step 3: Style footer** — hooks `.footer`, `.footer__content-top`, `.footer__copyright` (verify first): bone bg, hairline top border, muted links, Inter small caps off (plain sentence case).

- [ ] **Step 4: Verify** — dev server at 1440px and 375px: chrome matches mockup; burger menu opens; no overflow.

- [ ] **Step 5: Theme check + commit**

```bash
git add assets/custom.css sections/ config/
git commit -m "feat: restyle announcement bar, header, footer"
```

---

### Task 7: Homepage — editorial hero + stock sections

**Files:**
- Create: `sections/editorial-hero.liquid`
- Modify: `templates/index.json`, `assets/custom.css` (section 4)

**Interfaces:**
- Consumes: `--jj2-*`; chrome from Task 6; collections `jackets/shirts/pants/essentials` + images from Tasks 2/4.
- Produces: section type `editorial-hero`; homepage order in `templates/index.json`; card styles shared with Task 8.

- [ ] **Step 1: Create `sections/editorial-hero.liquid`:**

```liquid
<div class="editorial-hero">
  <div class="editorial-hero__content">
    <h1 class="editorial-hero__heading">{{ section.settings.heading }}</h1>
    {%- if section.settings.subheading != blank -%}
      <p class="editorial-hero__subheading">{{ section.settings.subheading | escape }}</p>
    {%- endif -%}
    {%- if section.settings.button_label != blank -%}
      <a href="{{ section.settings.button_link | default: routes.all_products_collection_url }}"
         class="button editorial-hero__button">{{ section.settings.button_label | escape }}</a>
    {%- endif -%}
  </div>
  <div class="editorial-hero__media">
    {%- if section.settings.image != blank -%}
      {{ section.settings.image | image_url: width: 1800 | image_tag:
         class: 'editorial-hero__image', loading: 'eager',
         sizes: '(max-width: 749px) 100vw, 45vw' }}
    {%- endif -%}
  </div>
</div>

{% schema %}
{
  "name": "Editorial hero",
  "tag": "section",
  "class": "section-editorial-hero",
  "settings": [
    { "type": "inline_richtext", "id": "heading", "label": "Heading",
      "default": "Clothed in <em>quiet grace.</em>" },
    { "type": "text", "id": "subheading", "label": "Subheading",
      "default": "A small wardrobe of jackets, shirts and pants — cut with care, made from cloth that ages beautifully." },
    { "type": "text", "id": "button_label", "label": "Button label", "default": "Discover the collection" },
    { "type": "url", "id": "button_link", "label": "Button link" },
    { "type": "image_picker", "id": "image", "label": "Image" }
  ],
  "presets": [{ "name": "Editorial hero" }]
}
{% endschema %}
```

- [ ] **Step 2: Upload the hero image as a theme asset reference** — `site/hero.jpg` must reach the section's image picker. Two options; use (a): (a) copy `content/images/site/hero.jpg` to `assets/hero-editorial.jpg` and in the section render fall back to it when no image is picked (`{%- else -%}<img src="{{ 'hero-editorial.jpg' | asset_url }}" class="editorial-hero__image" alt="" loading="eager">` before the closing `endif`), or (b) have the user pick it in the theme editor later. Option (a) keeps "no placeholders" true from first render.

- [ ] **Step 3: Rewrite `templates/index.json`** (keep any top-level keys the file already has; collection-list block keys must match Craft's schema — verify in `sections/collection-list.liquid` first):

```json
{
  "sections": {
    "hero": { "type": "editorial-hero", "settings": {} },
    "categories": { "type": "collection-list",
      "blocks": {
        "cat_jackets": { "type": "featured_collection", "settings": { "collection": "jackets" } },
        "cat_shirts":  { "type": "featured_collection", "settings": { "collection": "shirts" } },
        "cat_pants":   { "type": "featured_collection", "settings": { "collection": "pants" } }
      },
      "block_order": ["cat_jackets", "cat_shirts", "cat_pants"],
      "settings": { "title": "Shop by category", "columns_desktop": 3 } },
    "featured": { "type": "featured-collection",
      "settings": { "title": "The essentials", "collection": "essentials",
                    "products_to_show": 4, "columns_desktop": 4 } },
    "story": { "type": "rich-text", "settings": {} },
    "values": { "type": "multicolumn", "settings": {} },
    "newsletter": { "type": "newsletter", "settings": {} }
  },
  "order": ["hero", "categories", "featured", "story", "values", "newsletter"]
}
```

Then fill `story`/`values`/`newsletter` settings + blocks to match Craft's actual schemas (grep each section's `{% schema %}`): story = heading block "The Lord will provide" + text block with the provision narrative (reuse the two sentences from the page body's second paragraph) + button block "Read our story" → `/pages/our-story`, color scheme 2; values = three text columns with the verbatim value strings, no images; newsletter heading "Letters from the workroom", color scheme 3. Assign color schemes via each section's `color_scheme` setting key (verify exact key name and scheme ids in `config/settings_data.json`).

- [ ] **Step 4: Style homepage sections** — append to `custom.css` section 4: `.editorial-hero` (CSS grid `55% 45%`, min-height `80svh`, stacks image-below-text under 750px; heading `clamp(2.5rem, 5vw, 4rem)` Fraunces; `em` inside heading = `font-style: italic; color: var(--jj2-clay);`), category tiles (surface bg, Fraunces labels), story band (`em`/italic olive heading), values strip (italic, hairline top border), newsletter (bone-on-olive, verify inherited scheme colors).

- [ ] **Step 5: Verify** — dev server homepage top-to-bottom matches the approved mockup at 1440px and 375px; hero `<h1>` renders the italic clay em; category tiles show the three collection images; featured shows 4 real products; no placeholder graphics anywhere.

- [ ] **Step 6: Theme check + commit**

```bash
git add sections/editorial-hero.liquid templates/index.json assets/
git commit -m "feat: homepage — editorial hero, categories, essentials, story, values, newsletter"
```

---

### Task 8: Collection page — grid and filters

**Files:**
- Modify: `assets/custom.css` (section 5), `templates/collection.json` (settings only)

**Interfaces:**
- Consumes: `--jj2-*`; live products from Task 4.
- Produces: card styles (`.card`, `.card__heading`, `.price`) inherited by Task 7's featured collection and Task 9's related products.

- [ ] **Step 1: Grid settings** — in `templates/collection.json`, main section settings: `"products_per_page": 12`, `"columns_desktop": 4`, `"filter_type": "vertical"` (match keys present in Craft's `main-collection-product-grid` schema).

- [ ] **Step 2: Style cards** — verify hooks `.card`, `.card__inner`, `.card__heading`, `.card__media`, `.price`; append to section 5: `border-radius: var(--jj2-radius)` on media, Inter card headings, `var(--jj2-muted)` prices, subtle image scale on hover, surface-color card background. Mind the Dawn-family cascade: card overrides may need a 0,4,0-specificity selector (pattern from the previous project) — verify computed styles, no `!important`.

- [ ] **Step 3: Style filters** — hooks `.facets`, `.facets__summary`, `.facet-checkbox` (verify): Inter typography, clay accents, mobile facets drawer readable (previous project needed a 0,2,0 specificity win on `.mobile-facets__wrapper .mobile-facets__inner` — check the analogous spot).

- [ ] **Step 4: Verify with real data** — `/collections/all`: 12 products, 4-col at 1440px / 2-col at 375px; apply a size filter → products narrow (real facet narrowing was unverifiable last project; it is verifiable now — verify it).

- [ ] **Step 5: Theme check + commit**

```bash
git add assets/custom.css templates/collection.json
git commit -m "feat: restyle collection grid and filters"
```

---

### Task 9: Product page — gallery, variants, buy area

**Files:**
- Modify: `assets/custom.css` (section 6), `templates/product.json` (settings only)

**Interfaces:**
- Consumes: `--jj2-*`; card styles from Task 8; live products from Task 4.
- Produces: styled product template used by Task 11's test order.

- [ ] **Step 1: Layout settings** — `templates/product.json` main-product settings: `"gallery_layout": "stacked"`, media size per mockup proportions (only keys present in Craft's `main-product` schema).

- [ ] **Step 2: Style gallery + buy area** — verify hooks `.product__media-wrapper`, `.product__title`, `.price--large`, `.product-form__input input[type="radio"] + label`, `.product-form__submit`; append to section 6: Fraunces title, size pills (hairline border, clay border + surface fill when `:checked`), full-width clay add-to-cart with white label, `var(--jj2-radius)` on media and pills.

- [ ] **Step 3: Verify** — `/products/the-field-jacket`: two real photos in gallery, S–XL pills toggle visually, price $148, add-to-cart styled; at 375px media stacks above buy column.

- [ ] **Step 4: Theme check + commit**

```bash
git add assets/custom.css templates/product.json
git commit -m "feat: restyle product page gallery, variants, buy area"
```

---

### Task 10: Cart drawer + Our Story page template

**Files:**
- Create: `templates/page.our-story.json`
- Modify: `assets/custom.css` (sections 7–8)

**Interfaces:**
- Consumes: `--jj2-*`; `cart_type: "drawer"` from Task 5; page `our-story` from Task 4.
- Produces: styled drawer + story page used by Task 11's QA and test order.

- [ ] **Step 1: Style the drawer** — verify hooks `cart-drawer`, `.drawer__inner`, `.cart-item__name`, `.cart__ctas .button` in Craft's files; append to section 7: bone bg, Fraunces drawer title, clay checkout button with white label, quantity stepper with `var(--jj2-radius)`. **Check the empty-cart focus-trap bug** the previous project patched in Dawn (`assets/cart-drawer.js` `open()` picks `.drawer__inner` while the empty-cart trap container is `.drawer__inner-empty`): if Craft's `cart-drawer.js` has the same code, apply the same fix — a new 12-line `assets/custom.js` + one include line in `theme.liquid` (this stock-file edit is pre-authorized here, mirroring the prior project's reviewed fix).

- [ ] **Step 2: Create `templates/page.our-story.json`:**

```json
{
  "sections": {
    "main": { "type": "main-page", "settings": {} }
  },
  "order": ["main"]
}
```

Append to `custom.css` section 8: page title in Fraunces, page content `max-width: 60ch`, `em` in olive italic, generous line-height (1.7). (Assign the template to the page: it was created with no `templateSuffix`, so either set suffix via one `pageUpdate` call reusing Task 4's script pattern, or — simpler — keep the default `page.json` rendering and make section-8 styles target the default page template classes `.main-page-title`, `.rte`. Choose the simpler path; create `page.our-story.json` ONLY if the default template can't be styled without affecting other pages — currently `our-story` is the only page, so styling `.rte` globally is safe. Record the choice in the ledger.)

- [ ] **Step 3: Verify** — add The Field Jacket to cart → drawer slides in styled; change quantity; remove item → empty state readable, focus trap works (Tab cycles inside open drawer, Esc closes); `/pages/our-story` renders styled narrative.

- [ ] **Step 4: Theme check + commit**

```bash
git add assets/ templates/ layout/
git commit -m "feat: restyle cart drawer; story page styling"
```

---

### Task 11: QA, Lighthouse, test order, push unpublished (then final report)

**Files:**
- Modify: any file with a QA defect (`custom.css` preferred)

**Interfaces:**
- Consumes: everything above.
- Produces: unpublished theme "Jehovah Jireh Store" on the store; preview + editor URLs; Lighthouse scores; a completed test order number.

- [ ] **Step 1: Responsive + completeness sweep** — dev server: home, `/collections/all`, `/collections/jackets`, `/products/the-field-jacket`, cart drawer, `/search?q=shirt`, `/pages/our-story`, a 404 URL — each at 375px and 1440px. Done when: no horizontal scroll, no overlap, every image slot shows a real photo, no lorem/placeholder text.
- [ ] **Step 2: Contrast audit** — devtools-check each token pairing actually rendered (body on bone, muted on bone, bone on olive, white on clay, ink on surface) against the 4.5:1 / 3:1 rule. Fix any failure by darkening the offending token in `custom.css` (and `settings_data.json` if scheme-driven), then re-sweep.
- [ ] **Step 3: Keyboard navigation** — Tab through header nav (focus visible), open cart drawer via icon + Enter, trap inside, Esc closes; size pills reachable/toggleable; newsletter form submits with keyboard.
- [ ] **Step 4: Theme check final** — no new offenses vs. Task 1 baseline.
- [ ] **Step 5: Push unpublished**

Run: `shopify theme push -e dev --unpublished --theme "Jehovah Jireh Store"`
Expected: CLI prints editor + preview URLs. Save both. (This creates a NEW library entry; verify with `shopify theme list -e dev` that "Jehovah Jireh Custom" and Horizon are untouched.)

- [ ] **Step 6: Lighthouse (local dev server; remote preview is password-gated)**

Run: `npx lighthouse http://127.0.0.1:9292 --preset=desktop --quiet --output=json --output-path=lighthouse-home.json` (dev server running).
Read `categories.performance.score` ≥ 0.80 and `categories.accessibility.score` ≥ 0.95. If below, fix the top flagged items (usually unsized images — add width/height/aspect-ratio in `custom.css` — or oversized hero asset) and re-run once.

- [ ] **Step 7: TEST ORDER** — on the preview URL (enter password `aucles`): add The Oxford Shirt (size M) → checkout → Bogus Gateway: card number `1`, any name/expiry/CVV → order completes. Record the order number from the confirmation page. This closes the goal that stayed pending in the previous project.

- [ ] **Step 8: Commit + final report**

```bash
git add -A
git commit -m "chore: QA fixes; pushed unpublished theme Jehovah Jireh Store; test order completed"
```

Report to the user: preview URL, editor URL, Lighthouse scores, test-order number, nav-menu manual step status (Task 6), and the reminder that publishing is their manual click (Online Store → Themes → "Jehovah Jireh Store" → Publish) whenever they're ready. **Do not publish.**

---

## Plan Self-Review Notes

- Spec coverage: §1 goal + untouched themes → Tasks 1/11 constraints; §2 base/repo → Task 1; §3 tokens/fonts/contrast → Task 5 + Global Constraints + Task 11 Step 2; §4 brand/copy → Global Constraints, Tasks 6/7; §5 homepage → Task 7; §6 other pages → Tasks 8/9/10 + search/404 QA in Task 11; §7 mockup gate → Task 3; §8 demo catalog + imagery → Tasks 2/4; §9 acceptance → Task 11; §10 constraints → Global Constraints; §11 out of scope → appears in no task. ✓
- Names/types consistent: `--jj2-*` tokens defined Task 5, consumed 6–10; catalog handles defined Task 2, consumed 4/7/8/9/11; `editorial-hero` defined Task 7 Step 1, referenced in index.json Step 3; script's `created[handle]` map feeds `collectionAddProductsV2`. ✓
- Known-risk callouts inline: settings_data preset-string quirk (Task 5), Dawn-family cascade specificity (Tasks 5 note/8), empty-cart focus trap (Task 10), API schema drift (Task 4 Step 3), menu edit needs admin UI (Task 6 Step 2). ✓
