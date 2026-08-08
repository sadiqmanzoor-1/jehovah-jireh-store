# Shopify Fashion Store — Custom Theme Design

**Date:** 2026-08-08
**Status:** Approved
**Project type:** Learning / experimentation (no real business behind it)

## Goal

Build a fully custom-designed fashion/apparel storefront on Shopify by reskinning the
Dawn theme, on a free Shopify Partners development store. The purpose is to learn
real-world Shopify theme development end to end: design → theme settings → CSS
overrides → custom Liquid sections → live preview → publish.

## Prerequisites & roles

**User (one-time, browser-based — cannot be done by Claude):**
1. Create a free Shopify Partners account at partners.shopify.com.
2. Create a development store (Partners dashboard → Stores → Add store →
   Create development store → "test and build"). Choose the **"start with test
   data"** option if offered, so apparel products with photos are pre-loaded.
3. Approve the one-time browser login when the Shopify CLI first connects.

**Claude (local machine):**
1. Verify/install Node.js LTS and the Shopify CLI (`npm install -g @shopify/cli`).
2. This project folder: `d:\Claude\shopify-store`, under git (separate from the
   counselling website repo at `d:\Claude\website`).
3. Pull Dawn from the dev store into the project folder; all subsequent work
   happens here.

## Design phase

There is no existing brand, so a small fashion brand is invented as part of the work:

- Claude produces **2–3 static HTML homepage mockups**, each a distinct aesthetic
  direction (e.g. minimal black-and-white editorial, warm earthy modern, bold
  streetwear), stored in `mockups/`.
- The user picks one direction (iterations allowed). The chosen mockup defines the
  design system: brand name, palette, typography, spacing, imagery style.
- That design system is then applied to Dawn.

## Scope

**In scope (pages/areas that get the custom design):**
- Global: header, navigation, footer, announcement bar
- Homepage: hero, featured collection, lookbook/editorial section, newsletter signup
- Collection page: product grid, filters
- Product page: image gallery, variant/size picker, add-to-cart
- Cart: slide-out cart drawer

**Out of scope:**
- Checkout customization (locked on non-Plus stores; stock checkout is used)
- Third-party apps, real payment processing, custom domain, email/marketing setup
- Blog and secondary content pages (can be a follow-up project)

## Architecture

Base theme: **Dawn** (Shopify's free Online Store 2.0 reference theme, pre-installed
on the dev store). Customizations are layered, cleanest tool first, to minimize
divergence from Dawn:

1. **Theme settings** (`config/settings_data.json`) — colors, fonts, corner radii,
   spacing, and anything else Dawn already exposes. No code.
2. **Single custom stylesheet** (`assets/custom.css`, loaded after Dawn's base CSS
   from `layout/theme.liquid`) — all CSS overrides live in this one file; Dawn's own
   CSS files are left untouched.
3. **Liquid sections and JSON templates** — only where settings and CSS can't
   reach: custom hero, lookbook section, and any structural layout changes get new
   or modified files in `sections/` and `templates/`.

Fonts come from Shopify's built-in font library where possible; otherwise
self-hosted woff2 files in `assets/`.

## Workflow

- All work is committed to git at each milestone.
- `shopify theme dev` provides a local preview URL with hot reload while building.
- Changes are pushed to the dev store as an **unpublished** theme; the store's
  stock Dawn copy remains the published fallback. The user publishes only when
  satisfied. Any regression is recoverable via `git revert`.

## Testing

- Every in-scope page checked at mobile and desktop widths.
- Keyboard navigation verified on the cart drawer and variant picker.
- Lighthouse performance pass on homepage and product page.
- One full test order through Shopify's test payment gateway to confirm the buying
  flow (product → cart → checkout → order) still works after the reskin.

## Success criteria

- The dev store's storefront matches the chosen mockup direction across all
  in-scope pages.
- A test order completes successfully.
- All customizations live in git with a clean layering (settings → custom.css →
  Liquid), so the diff against stock Dawn is readable and intentional.
