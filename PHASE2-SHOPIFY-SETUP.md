# Phase 2 — Wire Happy Paws to the real Shopify backend

This is the cutover checklist from the **Phase 1 fixtures** (`app/lib/mock-products.ts`)
to a **real Shopify catalog**. The storefront UI, cart, drawer, discount codes, and
checkout already run on Hydrogen's real primitives — so most of this work is
**backend setup + swapping two loaders**, not rebuilding components.

> **Key idea:** the components read a fixed shape (see _Field contract_ below).
> Don't change components. Instead, have each loader map the Storefront API
> response into that same shape via a small adapter. That keeps the diff tiny
> and reversible.

---

## 0. Prerequisites

- [ ] A Shopify store (Partner dev store is fine) with the **Headless** or
      **Hydrogen** sales channel installed.
- [ ] Admin access to create products, collections, metafields, and discount codes.
- [ ] Decide currency/markets (the prototype copy assumes USD).

---

## 1. Build the catalog in Shopify Admin

### Products (all six candles)
Create one product per candle. Handles **must match** the current fixtures so
existing links/routes keep working:

- [ ] `fresh-linen-protocol` — Fresh Linen Protocol
- [ ] `midday-nap-matrix` — Midday Nap Matrix _(homepage hero + sample PDP)_
- [ ] `litter-box-accord` — Litter Box Accord
- [ ] `wet-dog-directive` — Wet Dog Directive
- [ ] `open-window-initiative` — Open Window Initiative
- [ ] `the-zero-incident-edition` — The Zero Incident Edition

For each product:
- [ ] Set the **description** (native field — the PDP reads it as `description`).
- [ ] Add a single option named **`Size`** with values **`8 oz`** and **`11 oz`**.
- [ ] Set per-variant prices (fixtures use **$54 / $76** for most, **$58 / $80**
      for Wet Dog Directive & Zero Incident). Confirm the real pricing.
- [ ] Mark variants **available for sale** and tracked as you prefer.

### Collection
- [ ] Create a collection that holds all six candles. Note its **handle**
      (e.g. `all` or `the-collection`) — the homepage loader will query it.
- [ ] The homepage hero currently picks the product with `collectionNo === 2`
      (Midday Nap Matrix). Decide how the hero is chosen post-cutover: by
      collection sort position, a "hero" tag/metafield, or just hardcode the
      handle in the loader.

---

## 2. Editorial metafields (the deadpan brand copy)

These fields are **not** standard Storefront API fields — they carry the brand
voice and the scent meter. Create them as **product metafields** (suggest the
`custom` namespace) and fill them per product (copy lives in
`app/lib/mock-products.ts` today):

- [ ] `custom.badge` — single line text — `New` | `Bestseller` | `Limited`
      _(or leave blank; drives the card badge + PDP eyebrow tag)._
- [ ] `custom.notes` — single line text — e.g. `Warm Vanilla · Amber · Zero Vet Bills`
- [ ] `custom.bullets` — list.single_line_text_field — the two `✓` card claims.
- [ ] `custom.collection_no` — number_integer — the `No. 0X` index (or derive from
      collection order).
- [ ] Scent profile (0–1 each) — either four number_decimal fields
      (`custom.profile_warm`, `_sweet`, `_woody`, `_fresh`) **or** one
      `custom.scent_profile` JSON metafield `{ "warm": 0.92, ... }`.
- [ ] _(Optional, only if you keep the placeholder vessel as a fallback)_
      `custom.swatch_glass` / `custom.swatch_wax` — color values.

> Make the metafields **Storefront-API readable** (toggle "Storefront access"
> on each definition) or they won't come back in queries.

---

## 3. Product imagery (replaces the CSS placeholder vessels)

- [ ] Upload real product photography per product (Shopify CDN).
- [ ] Set a **featured image** (drives cards, related, and the placeholder branch
      in `app/components/CandleVessel.tsx`).
- [ ] For the PDP gallery's 4 views (lit / unlit / label / in-situ), upload
      multiple **media** images per product. `CandleVessel` already switches to
      `<Image>` when a real CDN URL is present; the PDP gallery in
      `app/routes/products.$handle.tsx` can then map `product.media.nodes`
      instead of the CSS views.

---

## 4. Connect the storefront to the store

- [ ] Run `npx shopify hydrogen link` (or `h2 link`) and pick the store.
- [ ] Run `h2 env pull` to populate `.env` with:
  - `PUBLIC_STORE_DOMAIN`
  - `PUBLIC_STOREFRONT_API_TOKEN`
  - `PUBLIC_STOREFRONT_ID`
  - `PUBLIC_CHECKOUT_DOMAIN`
- [ ] Restart `npm run dev`. The app currently falls back to `mock.shop`; once
      these are set it talks to your store.

---

## 5. Swap the loaders (the actual cutover)

Keep components untouched by mapping the GraphQL response into the shape they
already read. Do this **per route**:

### `app/routes/_index.tsx` (Home / collection grid)
- [ ] Write a `COLLECTION_QUERY` that fetches the collection + its products with:
      `handle, title, description, featuredImage{url altText width height}`,
      `variants(first:10){nodes{ id title availableForSale price{amount currencyCode} selectedOptions{name value} }}`,
      and the metafields from step 2.
- [ ] Replace `return {collection: getMockCollection()}` with the query, then
      adapt each node to the field contract below.

### `app/routes/products.$handle.tsx` (PDP + related)
- [ ] Write a `PRODUCT_QUERY` (by `$handle`) with the same fields + `media`.
- [ ] Add a recommendations/related query (or reuse the collection minus the
      current handle) for "Complete the set."
- [ ] Replace `getMockProductByHandle(handle)` / `mockProducts` with the queries,
      adapting to the contract. Keep the `404` when the product is missing.

### Adapter shape — _Field contract_ the components depend on
```ts
type ProductForUI = {
  handle: string;
  title: string;
  description: string;
  badge: 'New' | 'Bestseller' | 'Limited' | null; // from custom.badge
  collectionNo: number;                            // from custom.collection_no
  notes: string;                                   // from custom.notes
  bullets: [string, string];                       // from custom.bullets
  profile: { warm: number; sweet: number; woody: number; fresh: number };
  swatch: { glass: string; wax: string };          // optional once photos exist
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  featuredImage: { url: string; altText: string; width?: number; height?: number };
  variants: Array<{                                // NOTE: a flat array, not {nodes}
    id: string;                                    // real merchandiseId — makes "Add to basket" persist
    title: string;                                 // "8 oz" / "11 oz"
    availableForSale: boolean;
    price: { amount: string; currencyCode: string };
    selectedOptions: { name: string; value: string }[];
  }>;
};
```
- [ ] In each loader, map `variants(first).nodes` → a flat `variants` array.
- [ ] Map metafields → `badge / notes / bullets / collectionNo / profile`.
- [ ] The PDP size selector indexes `product.variants[i]`; ensure 8 oz is index 0
      (sort by option value or price).

> Why an adapter and not "use the raw query"? The components read
> `product.variants` as a **flat array** and read editorial fields by name. The
> adapter is ~15 lines and means **zero component edits**.

---

## 6. Cart, discounts, checkout — verify (no code changes expected)

These already use real primitives; just confirm against the live store:

- [ ] **Add to basket** on a card and on the PDP now persists a real line
      (because `variant.id` is now a real `merchandiseId`). Check the count
      badge, the drawer, and `/cart`.
- [ ] Quantity ±, Remove, and the cart drawer behave correctly.
- [ ] Create the demo **discount codes** in Admin so the copy works:
      `BRIAN10`, `PETSAFE`, `WETDOG` (or update the hint in
      `app/routes/cart.tsx` → `Discounts`).
- [ ] Apply/remove a code on `/cart` and confirm totals update.
- [ ] **Pay now** redirects to the Shopify-hosted checkout (`cart.checkoutUrl`).
      Confirmation is Shopify-hosted; the prototype's confirmation overlay was
      intentionally left out (kept only as design reference).

---

## 7. Regenerate types & validate

- [ ] `npm run codegen` (regenerates `storefrontapi.generated.d.ts` from your new
      queries).
- [ ] `npm run typecheck` — fix any shape mismatches surfaced by the adapter.
- [ ] `npm run lint`.
- [ ] Click through Home, a PDP, and Cart; check the browser console.

---

## 8. Cleanup (after the cutover is verified)

- [ ] Delete `app/lib/mock-products.ts` and its imports.
- [ ] In `app/components/CandleVessel.tsx`, decide whether to keep the CSS
      placeholder fallback (nice for products still missing photos) or simplify
      to `<Image>`-only.
- [ ] If you mapped PDP gallery to real `media`, remove the CSS `view`/`scene-ph`
      placeholders in `app/routes/products.$handle.tsx`.
- [ ] Remove the temporary tsconfig note if no longer relevant (the
      `storefrontapi.generated` path mapping in `tsconfig.json` should stay).

---

## Quick reference — files that change

| Concern | File | Change |
|---|---|---|
| Home data | `app/routes/_index.tsx` | mock → `COLLECTION_QUERY` + adapter |
| PDP data | `app/routes/products.$handle.tsx` | mock → `PRODUCT_QUERY` + related + adapter |
| Imagery | `app/components/CandleVessel.tsx` | auto-uses `<Image>` once URLs are real |
| Discounts hint | `app/routes/cart.tsx` | match real Admin codes |
| Cart / drawer / checkout | `app/components/CartMain.tsx`, `app/routes/cart.tsx` | **none** (already real) |
| Fixtures | `app/lib/mock-products.ts` | delete |
