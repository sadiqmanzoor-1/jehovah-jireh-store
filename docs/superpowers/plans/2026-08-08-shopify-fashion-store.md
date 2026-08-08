# Shopify Fashion Store (Dawn Reskin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin Shopify's Dawn theme into a fully custom fashion/apparel storefront on the dev store `jehovah-jireh-ezbcyrcn.myshopify.com`, driven by a mockup-approved design.

**Architecture:** Dawn stays the base; customizations are layered cleanest-first — (1) theme settings in `config/settings_data.json`, (2) one override stylesheet `assets/custom.css`, (3) new/modified Liquid sections + JSON templates only where the first two can't reach. Dawn's own CSS files are never edited.

**Tech Stack:** Shopify CLI 3.x, Dawn (Online Store 2.0), Liquid, vanilla CSS, git. No build tooling, no frameworks.

## Global Constraints

- Store: `jehovah-jireh-ezbcyrcn.myshopify.com` (free Partners dev store; already created by the user).
- Project directory: `d:\Claude\shopify-store` (own git repo — NOT `d:\Claude\website`).
- Base theme: Dawn, pulled from the dev store. Never edit Dawn's own `.css` files; all CSS overrides go in `assets/custom.css` only.
- Working brand name: **"Jehovah Jireh"** (taken from the user's chosen store name; user may rename at the mockup gate).
- Push only **unpublished** themes to the store; the user decides when to publish.
- Checkout is stock — no checkout customization (locked on non-Plus stores).
- Commit at the end of every task. Run `shopify theme check` before each commit; it must report no NEW offenses vs. the baseline recorded in Task 1.
- Two USER GATES: mockup selection (after Task 2) and publish approval (after Task 9). Stop and wait at each.

## File Structure

```
d:\Claude\shopify-store\
├── docs/superpowers/…              # spec + this plan (exists)
├── mockups/                        # Task 2: three standalone HTML mockups
│   ├── fashion-v1-atelier.html
│   ├── fashion-v2-terra.html
│   └── fashion-v3-static.html
├── design/tokens.md                # Task 3: chosen design tokens (single source of truth)
├── shopify.theme.toml              # Task 1: store config so --store flag isn't repeated
├── .gitignore                      # Task 1: ignores .shopify/
└── (Dawn theme, pulled in Task 1)
    ├── assets/custom.css           # Task 3: ALL CSS overrides live here
    ├── layout/theme.liquid         # Task 3: one-line include of custom.css
    ├── config/settings_data.json   # Task 3: colors + fonts via settings
    ├── sections/custom-hero.liquid # Task 5: new section
    ├── sections/lookbook.liquid    # Task 5: new section
    └── templates/index.json        # Task 5: homepage section order
```

---

### Task 1: Toolchain, auth, and Dawn pull

**Files:**
- Create: `shopify.theme.toml`, `.gitignore`
- Create (pulled): entire Dawn theme tree (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a working local Dawn copy; `shopify theme dev -e dev` serves it at `http://127.0.0.1:9292`; theme-check baseline count recorded in the commit message.

- [ ] **Step 1: Verify Node.js ≥ 20**

Run: `node --version`
Expected: `v20.x` or higher. If missing: `winget install OpenJS.NodeJS.LTS`, then open a fresh shell so PATH updates.

- [ ] **Step 2: Install Shopify CLI**

Run: `npm install -g @shopify/cli@latest` then `shopify version`
Expected: version `3.x` prints.

- [ ] **Step 3: Create store config and .gitignore**

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
```

- [ ] **Step 4: Authenticate (USER ACTION — one time)**

Run from `d:\Claude\shopify-store`: `shopify theme list -e dev`
A browser window opens; the **user must log in and approve**. Expected after login: a table of themes including the published one (Dawn or the test-data theme), with IDs and roles.

- [ ] **Step 5: Pull the published theme**

Run: `shopify theme pull -e dev --live`
Expected: theme files download into the project root (`assets/`, `sections/`, etc. appear). If `--live` pulls something that isn't Dawn (test-data stores can ship a different published theme), run `shopify theme list -e dev`, find Dawn's ID, and use `shopify theme pull -e dev --theme <ID>` instead. If Dawn isn't installed at all, download it with `git clone --depth 1 https://github.com/Shopify/dawn .tmp-dawn` and copy its theme folders in.

- [ ] **Step 6: Record theme-check baseline**

Run: `shopify theme check`
Expected: completes; note the offense count (stock Dawn may have a few warnings — that count is the baseline all later tasks compare against).

- [ ] **Step 7: Smoke-test the dev server**

Run in background: `shopify theme dev -e dev`
Then: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292`
Expected: `200`. Stop the server afterwards.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: pull stock Dawn from dev store (theme-check baseline: N offenses)"
```

---

### Task 2: Three homepage mockups (then USER GATE: pick one)

**Files:**
- Create: `mockups/fashion-v1-atelier.html`, `mockups/fashion-v2-terra.html`, `mockups/fashion-v3-static.html`

**Interfaces:**
- Consumes: nothing (pure HTML/CSS, no Shopify).
- Produces: the chosen direction's token table (below) becomes `design/tokens.md` in Task 3. Token names used by ALL later tasks: `--jj-bg`, `--jj-surface`, `--jj-text`, `--jj-muted`, `--jj-accent`, `--jj-font-heading`, `--jj-font-body`, `--jj-radius`.

All three mockups share the same page skeleton (semantic, standalone, Google Fonts CDN allowed in mockups only — the real theme uses Shopify's font library or self-hosted woff2):

```
announcement bar → header (logo "JEHOVAH JIREH", nav: Shop / Lookbook / About, cart icon)
→ full-bleed hero (image placeholder via CSS gradient, heading, CTA button)
→ "New arrivals" 4-up product grid (name + price, hover zoom)
→ lookbook split section (2 large editorial images + caption)
→ newsletter signup band → footer (3 columns: menu, contact, social)
```

Product placeholders for every mockup: "Oversized Wool Coat $189", "Relaxed Linen Shirt $79", "Wide-Leg Trouser $95", "Knit Longline Cardigan $120". Use solid-color `<div>` blocks or CSS gradients for imagery — no external images.

Per-direction tokens (each mockup implements its column exactly):

| Token | v1 Atelier (minimal editorial) | v2 Terra (warm earthy) | v3 Static (bold streetwear) |
|---|---|---|---|
| `--jj-bg` | `#FAFAF8` | `#F5F0E8` | `#0E0E0E` |
| `--jj-surface` | `#FFFFFF` | `#EDE5D8` | `#1A1A1A` |
| `--jj-text` | `#111111` | `#2E2A24` | `#F2F2F2` |
| `--jj-muted` | `#6B6B6B` | `#8A8071` | `#9A9A9A` |
| `--jj-accent` | `#111111` | `#B4552D` | `#D8FF3E` |
| `--jj-font-heading` | Playfair Display | Fraunces | Archivo Black |
| `--jj-font-body` | Inter | DM Sans | Space Grotesk |
| `--jj-radius` | `0` | `12px` | `0` |
| Hero tagline | "Quiet pieces, made to last." | "Earth-toned essentials, every day." | "LOUD BY DESIGN." |
| Signature moves | thin rules, generous whitespace, uppercase letter-spaced nav | soft rounded cards, cream/clay warmth, arched hero image mask | full-width marquee strip, oversized type, acid-yellow hover states |

- [ ] **Step 1: Build `fashion-v1-atelier.html`** — skeleton above + v1 column. Single self-contained file, all CSS in a `<style>` block using the `--jj-*` variables.
- [ ] **Step 2: Build `fashion-v2-terra.html`** — same skeleton, v2 column.
- [ ] **Step 3: Build `fashion-v3-static.html`** — same skeleton, v3 column.
- [ ] **Step 4: Verify each renders** — open each file in the browser; check: no horizontal scroll at 375px width, hero fills viewport, grid collapses to 2-up on mobile.
- [ ] **Step 5: Commit**

```bash
git add mockups/
git commit -m "feat: three fashion homepage mockup directions"
```

- [ ] **Step 6: USER GATE** — show the user all three mockups; ask which direction to build (iterations allowed, brand rename allowed here). Record the choice before Task 3. **Do not proceed without an explicit pick.**

---

### Task 3: Design tokens → theme settings + custom.css scaffold

**Files:**
- Create: `design/tokens.md`, `assets/custom.css`
- Modify: `layout/theme.liquid` (one include line), `config/settings_data.json` (colors + fonts)

**Interfaces:**
- Consumes: chosen direction's token column from Task 2.
- Produces: CSS variables `--jj-bg`, `--jj-surface`, `--jj-text`, `--jj-muted`, `--jj-accent`, `--jj-font-heading`, `--jj-font-body`, `--jj-radius` defined on `:root` in `custom.css` — every later task styles ONLY through these variables and `custom.css`.

- [ ] **Step 1: Write `design/tokens.md`** — copy the chosen column of the Task 2 token table into a small markdown table, plus the brand name and tagline. This file is the single source of truth for all later styling decisions.

- [ ] **Step 2: Create `assets/custom.css` scaffold** (values shown here are v2 Terra; substitute the chosen column verbatim):

```css
/* ============================================================
   Jehovah Jireh — all custom overrides. Dawn files stay stock.
   Sections: 1 tokens · 2 global · 3 header/footer · 4 homepage
             5 collection · 6 product · 7 cart drawer
   ============================================================ */

/* 1. Tokens */
:root {
  --jj-bg: #F5F0E8;
  --jj-surface: #EDE5D8;
  --jj-text: #2E2A24;
  --jj-muted: #8A8071;
  --jj-accent: #B4552D;
  --jj-radius: 12px;
}

/* 2. Global */
body {
  background: var(--jj-bg);
  color: var(--jj-text);
}
.button,
.shopify-challenge__button,
button.shopify-payment-button__button--unbranded {
  background: var(--jj-accent);
  border-radius: var(--jj-radius);
}
```

- [ ] **Step 3: Include it from `layout/theme.liquid`** — directly after the line that loads `base.css` (search for `'base.css' | asset_url`), add:

```liquid
{{ 'custom.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 4: Set fonts + colors in `config/settings_data.json`** — inside the `"current"` object (structure varies slightly by Dawn version — match the keys that already exist in the pulled file, do not invent new ones):
  - `"type_header_font"` / `"type_body_font"`: Shopify font handles are lowercase with underscores and a weight suffix, e.g. `"playfair_display_n4"`, `"fraunces_n5"`, `"dm_sans_n4"`, `"inter_n4"`, `"space_grotesk_n4"`, `"archivo_black_n4"`.
  - The first color scheme (`color_schemes` → `scheme-1` or similarly named): background = `--jj-bg` value, text = `--jj-text` value, button/accent = `--jj-accent` value.
  - If a chosen font handle isn't in Shopify's library (dev server logs an error or font silently falls back), instead download the woff2 to `assets/` and add an `@font-face` block at the top of `custom.css`, then set `--jj-font-heading`/`--jj-font-body` and a `body { font-family: var(--jj-font-body); }` + heading override there.

- [ ] **Step 5: Verify in dev server** — run `shopify theme dev -e dev`, open `http://127.0.0.1:9292`. Expected: homepage shows new background color, text color, and fonts (inspect an `<h2>` in devtools to confirm the heading font family).

- [ ] **Step 6: Theme check + commit**

Run: `shopify theme check` — no new offenses vs. baseline.

```bash
git add assets/custom.css layout/theme.liquid config/settings_data.json design/
git commit -m "feat: apply chosen design tokens via settings + custom.css"
```

---

### Task 4: Global chrome — announcement bar, header, footer

**Files:**
- Modify: `assets/custom.css` (sections 2–3 of the file only)

**Interfaces:**
- Consumes: `--jj-*` variables from Task 3.
- Produces: styled global chrome present on every page; later tasks assume header/footer are done and only style page bodies.

- [ ] **Step 1: Style announcement bar + header** — append to `custom.css` section 3. Dawn's hooks: `.announcement-bar`, `.header-wrapper`, `.header`, `.header__heading-link`, `.header__menu-item`, `.header__icon`. Match the chosen mockup: e.g. for v1 uppercase letter-spaced nav (`text-transform: uppercase; letter-spacing: 0.08em;`), for v2 warm surface background (`background: var(--jj-surface);`), for v3 black bar with accent hover (`.header__menu-item:hover { color: var(--jj-accent); }`).

- [ ] **Step 2: Style footer** — Dawn's hooks: `.footer`, `.footer__content-top`, `.footer-block__heading`, `.footer__copyright`. Apply `--jj-surface` background and mockup typography.

- [ ] **Step 3: Set announcement text** — in the theme editor's section JSON (`sections/header-group.json` if present, otherwise the announcement settings in `settings_data.json`), set the announcement to the chosen tagline from `design/tokens.md`.

- [ ] **Step 4: Verify** — dev server: announcement, header, and footer visually match the mockup at 1440px AND 375px (burger menu opens, no overflow).

- [ ] **Step 5: Theme check + commit**

```bash
git add assets/custom.css sections/ config/
git commit -m "feat: restyle announcement bar, header, footer"
```

---

### Task 5: Homepage — custom hero, featured collection, lookbook, newsletter

**Files:**
- Create: `sections/custom-hero.liquid`, `sections/lookbook.liquid`
- Modify: `templates/index.json`, `assets/custom.css` (section 4)

**Interfaces:**
- Consumes: `--jj-*` variables; global chrome from Task 4.
- Produces: section types `custom-hero` and `lookbook` available in the theme editor; homepage order fixed in `templates/index.json`.

- [ ] **Step 1: Create `sections/custom-hero.liquid`**

```liquid
<div class="custom-hero{% if section.settings.full_height %} custom-hero--full{% endif %}">
  {%- if section.settings.image != blank -%}
    {{ section.settings.image | image_url: width: 3000 | image_tag:
       class: 'custom-hero__image', loading: 'eager', sizes: '100vw' }}
  {%- endif -%}
  <div class="custom-hero__content">
    <h1 class="custom-hero__heading">{{ section.settings.heading | escape }}</h1>
    {%- if section.settings.subheading != blank -%}
      <p class="custom-hero__subheading">{{ section.settings.subheading | escape }}</p>
    {%- endif -%}
    {%- if section.settings.button_label != blank -%}
      <a href="{{ section.settings.button_link | default: routes.all_products_collection_url }}"
         class="button custom-hero__button">{{ section.settings.button_label | escape }}</a>
    {%- endif -%}
  </div>
</div>

{% schema %}
{
  "name": "Custom hero",
  "tag": "section",
  "class": "section-custom-hero",
  "settings": [
    { "type": "image_picker", "id": "image", "label": "Background image" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Jehovah Jireh" },
    { "type": "text", "id": "subheading", "label": "Subheading", "default": "New season essentials" },
    { "type": "text", "id": "button_label", "label": "Button label", "default": "Shop new arrivals" },
    { "type": "url", "id": "button_link", "label": "Button link" },
    { "type": "checkbox", "id": "full_height", "label": "Full viewport height", "default": true }
  ],
  "presets": [{ "name": "Custom hero" }]
}
{% endschema %}
```

- [ ] **Step 2: Create `sections/lookbook.liquid`**

```liquid
<div class="lookbook page-width">
  {%- if section.settings.heading != blank -%}
    <h2 class="lookbook__heading">{{ section.settings.heading | escape }}</h2>
  {%- endif -%}
  <div class="lookbook__grid">
    {%- for block in section.blocks -%}
      <figure class="lookbook__item" {{ block.shopify_attributes }}>
        {%- if block.settings.image != blank -%}
          {{ block.settings.image | image_url: width: 1200 | image_tag:
             class: 'lookbook__image', loading: 'lazy' }}
        {%- else -%}
          {{ 'lifestyle-1' | placeholder_svg_tag: 'lookbook__image lookbook__image--placeholder' }}
        {%- endif -%}
        {%- if block.settings.caption != blank -%}
          <figcaption class="lookbook__caption">{{ block.settings.caption | escape }}</figcaption>
        {%- endif -%}
      </figure>
    {%- endfor -%}
  </div>
</div>

{% schema %}
{
  "name": "Lookbook",
  "tag": "section",
  "class": "section-lookbook",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "The lookbook" }
  ],
  "blocks": [
    { "type": "look", "name": "Look", "settings": [
      { "type": "image_picker", "id": "image", "label": "Image" },
      { "type": "text", "id": "caption", "label": "Caption" }
    ] }
  ],
  "max_blocks": 6,
  "presets": [{ "name": "Lookbook", "blocks": [ { "type": "look" }, { "type": "look" } ] }]
}
{% endschema %}
```

- [ ] **Step 3: Rewrite `templates/index.json`** — replace its `sections`/`order` with (keep any `"wrapper"`/top-level keys the file already has):

```json
{
  "sections": {
    "hero": { "type": "custom-hero", "settings": {} },
    "new_arrivals": { "type": "featured-collection", "settings": { "title": "New arrivals", "products_to_show": 4, "columns_desktop": 4 } },
    "lookbook": { "type": "lookbook", "settings": {} },
    "newsletter": { "type": "newsletter", "settings": {} }
  },
  "order": ["hero", "new_arrivals", "lookbook", "newsletter"]
}
```

If `featured-collection` requires a `collection` setting to show products, set it in the theme editor to any test-data collection (or leave blank — Dawn renders placeholder products).

- [ ] **Step 4: Style the homepage sections** — append to `custom.css` section 4: `.custom-hero` (full-bleed, `min-height: 100svh` for `--full`, absolutely-positioned image with `object-fit: cover`, content overlay per mockup), `.lookbook__grid` (2-col desktop / 1-col mobile via `@media screen and (max-width: 749px)`), newsletter band background `var(--jj-surface)`.

- [ ] **Step 5: Verify** — dev server homepage matches mockup layout top-to-bottom at 1440px and 375px; hero heading is an `<h1>`; both new sections appear in the theme editor's "Add section" list.

- [ ] **Step 6: Theme check + commit**

```bash
git add sections/custom-hero.liquid sections/lookbook.liquid templates/index.json assets/custom.css
git commit -m "feat: homepage — custom hero, featured collection, lookbook, newsletter"
```

---

### Task 6: Collection page — product grid and filters

**Files:**
- Modify: `assets/custom.css` (section 5), `templates/collection.json` (settings only)

**Interfaces:**
- Consumes: `--jj-*` variables.
- Produces: product-card styles (`.card`, `.card__heading`, `.price`) that Task 7's related-products and Task 5's featured collection also inherit.

- [ ] **Step 1: Grid settings** — in `templates/collection.json`, set the main section's settings: `"products_per_page": 12`, `"columns_desktop": 4`, `"filter_type": "vertical"` (keys must already exist in Dawn's `main-collection-product-grid` schema — match them, don't invent).

- [ ] **Step 2: Style product cards** — append to `custom.css` section 5. Dawn hooks: `.card`, `.card__inner`, `.card__heading`, `.card__media`, `.price`. Apply: `border-radius: var(--jj-radius)` on media, muted price color `var(--jj-muted)`, hover treatment per mockup (v1: subtle image scale; v2: surface-color card background; v3: accent-color heading on hover).

- [ ] **Step 3: Style filters** — Dawn hooks: `.facets`, `.facets__summary`, `.facet-checkbox`. Match typography and accent color to tokens.

- [ ] **Step 4: Verify** — open `/collections/all` on the dev server: 4-column grid at 1440px, 2-column at 375px, filters styled and functional (apply one filter, products narrow).

- [ ] **Step 5: Theme check + commit**

```bash
git add assets/custom.css templates/collection.json
git commit -m "feat: restyle collection grid and filters"
```

---

### Task 7: Product page — gallery, variant picker, buy area

**Files:**
- Modify: `assets/custom.css` (section 6), `templates/product.json` (settings only)

**Interfaces:**
- Consumes: `--jj-*` variables; card styles from Task 6 (related products strip).
- Produces: fully styled product template used by the Task 9 test order.

- [ ] **Step 1: Layout settings** — in `templates/product.json`, on the `main-product` section settings set `"gallery_layout"` to `"stacked"` (v1/v2) or `"columns"` (v3), and `"media_size"` per mockup proportions (use only keys present in Dawn's `main-product` schema).

- [ ] **Step 2: Style gallery + buy area** — append to `custom.css` section 6. Dawn hooks: `.product__media-wrapper`, `.product__title`, `.price--large`, `.product-form__input input[type="radio"] + label` (variant pills), `.product-form__submit`. Apply: heading font on title, pill-style variant buttons (accent border when `:checked`), full-width accent add-to-cart button, `border-radius: var(--jj-radius)` on media.

- [ ] **Step 3: Verify** — open any test-data product on the dev server: gallery renders, variant pills toggle visually, add-to-cart button styled; at 375px media stacks above the buy column.

- [ ] **Step 4: Theme check + commit**

```bash
git add assets/custom.css templates/product.json
git commit -m "feat: restyle product page gallery, variants, buy area"
```

---

### Task 8: Cart drawer

**Files:**
- Modify: `assets/custom.css` (section 7), `config/settings_data.json` (cart type)

**Interfaces:**
- Consumes: `--jj-*` variables.
- Produces: styled drawer used by the Task 9 keyboard-nav check and test order.

- [ ] **Step 1: Ensure drawer mode** — in `settings_data.json`'s `"current"` object, confirm/set `"cart_type": "drawer"`.

- [ ] **Step 2: Style the drawer** — append to `custom.css` section 7. Dawn hooks: `cart-drawer`, `.drawer__inner`, `.cart-item__name`, `.cart-item__quantity`, `.cart__ctas .button`. Apply: `background: var(--jj-bg)`, heading font on drawer title, accent checkout button, quantity stepper matching `--jj-radius`.

- [ ] **Step 3: Verify** — dev server: add a product to cart → drawer slides in styled; change quantity → line updates; remove item → drawer empties gracefully (empty state readable).

- [ ] **Step 4: Theme check + commit**

```bash
git add assets/custom.css config/settings_data.json
git commit -m "feat: restyle cart drawer"
```

---

### Task 9: QA pass, push unpublished, test order (then USER GATE: publish)

**Files:**
- Modify: `assets/custom.css` (fixes only), any file with a QA defect

**Interfaces:**
- Consumes: everything above.
- Produces: an unpublished theme named "Jehovah Jireh Custom" on the store, a passing test order, Lighthouse scores reported to the user.

- [ ] **Step 1: Responsive sweep** — with the dev server running, check every in-scope page (home, `/collections/all`, one product, cart drawer, 404) at 375px and 1440px. Log each defect, fix in `custom.css`, re-check. Done when: no horizontal scroll, no overlapping text, all images cover their frames.

- [ ] **Step 2: Keyboard navigation** — Tab through: header nav (focus visible), open cart drawer via cart icon + Enter, Tab within drawer (focus trapped inside while open), Esc closes it, variant pills reachable and toggleable with arrow keys/space. Fix any focus-visibility regressions caused by `custom.css` (never remove Dawn's `:focus-visible` outlines — restyle them with `outline-color: var(--jj-accent)` if needed).

- [ ] **Step 3: Theme check final** — `shopify theme check` reports no new offenses vs. the Task 1 baseline.

- [ ] **Step 4: Push unpublished**

Run: `shopify theme push -e dev --unpublished --theme "Jehovah Jireh Custom"`
Expected: CLI prints the new theme's editor + preview URLs. Save both.

- [ ] **Step 5: Lighthouse on the preview URL**

Run: `npx lighthouse "<preview URL from step 4>" --preset=desktop --quiet --output=json --output-path=lighthouse-home.json`
Then read `categories.performance.score` and `categories.accessibility.score` from the JSON. Target: ≥ 0.80 performance, ≥ 0.90 accessibility. If below, fix the top 2–3 flagged items (usually unsized images or render-blocking additions in `custom.css`) and re-run once.

- [ ] **Step 6: Test order (USER-VISIBLE PROOF)** — on the preview URL: add a product → cart drawer → checkout. Dev stores run in test mode: choose the Bogus Gateway, card number `1`, any name/expiry/CVV → order should complete. Verify the order appears in the store admin under Orders.

- [ ] **Step 7: Commit + report**

```bash
git add -A
git commit -m "chore: QA fixes, pushed unpublished theme, test order verified"
```

Report to the user: preview URL, editor URL, Lighthouse scores, test-order number.

- [ ] **Step 8: USER GATE — publish decision.** The user either publishes from admin (Online Store → Themes → "Jehovah Jireh Custom" → Publish) or asks Claude to run `shopify theme publish`. **Do not publish without explicit approval.**

---

## Plan Self-Review Notes

- Spec coverage: prerequisites → Task 1; mockups/brand → Task 2; tokens/settings/custom.css layering → Task 3; global chrome → Task 4; homepage → Task 5; collection → Task 6; product → Task 7; cart drawer → Task 8; testing (responsive, keyboard, Lighthouse, test order) + unpublished push + publish gate → Task 9. Out-of-scope items (checkout, apps, domain, blog) appear in no task. ✓
- Token names (`--jj-*`) defined in Task 2/3 are the same names consumed in Tasks 4–8. ✓
- Dawn class hooks are named per current Dawn conventions; where Dawn versions drift, tasks say to match existing keys/classes in the pulled files rather than invent. ✓
