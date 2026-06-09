/**
 * MOCK PRODUCT FIXTURES — Happy Paws
 * ----------------------------------------------------------------------------
 * Phase 1 (now): route loaders return these instead of querying the Storefront
 * API, so the full UI can be built before the real catalog exists.
 *
 * These objects intentionally mimic the SHAPE of the Shopify Storefront API
 * `Product` type (handle, title, priceRange, variants, options, featuredImage,
 * media). Keep the shape faithful so components read the same fields they will
 * in production.
 *
 * Phase 2 (cutover): replace `return mockProducts` in each loader with a real
 * `storefront.query(...)`. Because the shape matches, components should need
 * little to no change. Then delete this file.
 *
 * NOTE ON TYPES: for stricter typing, import the generated Storefront types
 * (`@shopify/hydrogen/storefront-api-types`) and annotate these as
 * `Partial<Product>` or a hand-written subset. Left loose here so it compiles
 * before codegen is wired up.
 *
 * NOTE ON IMAGES: `featuredImage.url` points at placeholder paths. Swap for
 * real Shopify CDN URLs once photography exists. The prototypes render candles
 * as CSS; production should use <Image> from '@shopify/hydrogen'.
 */

const money = (amount: string) => ({amount, currencyCode: 'USD'});

/** Build the two standard size variants (8 oz / 11 oz) every candle shares. */
function sizeVariants(handle: string, base8: number) {
  const price11 = base8 === 54 ? 76 : 80; // 11oz upcharge
  return [
    {
      id: `gid://shopify/ProductVariant/${handle}-8oz`,
      title: '8 oz',
      availableForSale: true,
      selectedOptions: [{name: 'Size', value: '8 oz'}],
      price: money(base8.toFixed(2)),
      sku: `${handle}-8`,
    },
    {
      id: `gid://shopify/ProductVariant/${handle}-11oz`,
      title: '11 oz',
      availableForSale: true,
      selectedOptions: [{name: 'Size', value: '11 oz'}],
      price: money(price11.toFixed(2)),
      sku: `${handle}-11`,
    },
  ];
}

export interface MockProduct {
  id: string;
  handle: string;
  title: string;
  /** No. in the collection, for the "No. 0X" eyebrow */
  collectionNo: number;
  /** Bestseller | New | Limited | null — drives the card badge */
  badge: 'Bestseller' | 'New' | 'Limited' | null;
  /** mono notes line, e.g. "Warm Vanilla · Amber · Zero Vet Bills" */
  notes: string;
  /** two "✓" micro-claims on the product card */
  bullets: [string, string];
  /** long deadpan description for the PDP */
  description: string;
  /** scent-profile meter values 0–1: warm, sweet, woody, fresh */
  profile: {warm: number; sweet: number; woody: number; fresh: number};
  /** vessel placeholder colors used by the CSS candle until real photos exist */
  swatch: {glass: string; wax: string};
  priceRange: {minVariantPrice: ReturnType<typeof money>};
  featuredImage: {url: string; altText: string};
  options: {name: string; values: string[]}[];
  variants: ReturnType<typeof sizeVariants>;
}

export const mockProducts: MockProduct[] = [
  {
    id: 'gid://shopify/Product/fresh-linen',
    handle: 'fresh-linen-protocol',
    title: 'Fresh Linen Protocol',
    collectionNo: 1,
    badge: 'New',
    notes: 'Clean Cotton · Soft Musk · Daylight',
    bullets: [
      'Smells like you actually cleaned the house today.',
      '0% paraffin. 0% drama.',
    ],
    description:
      'A crisp, reassuring composition for people whose homes do not, strictly speaking, smell as clean as they look. Clean cotton and soft musk do the convincing; daylight does the rest. Safe for dogs, cats, and that weird lizard.',
    profile: {warm: 0.4, sweet: 0.45, woody: 0.3, fresh: 0.92},
    swatch: {glass: '#cdd6dd', wax: '#e9eef1'},
    priceRange: {minVariantPrice: money('54.00')},
    featuredImage: {url: '/images/products/fresh-linen.jpg', altText: 'Fresh Linen Protocol candle'},
    options: [{name: 'Size', values: ['8 oz', '11 oz']}],
    variants: sizeVariants('fresh-linen', 54),
  },
  {
    id: 'gid://shopify/Product/midday-nap',
    handle: 'midday-nap-matrix',
    title: 'Midday Nap Matrix',
    collectionNo: 2,
    badge: 'Bestseller',
    notes: 'Warm Vanilla · Amber · Zero Vet Bills',
    bullets: [
      'Neutralizes “wet dog” without a canine existential crisis.',
      'Burns clean for 50 hours, or until the cat intervenes.',
    ],
    description:
      'A warm, sedative composition engineered for the specific hour when the afternoon light hits the rug and your animal achieves total unconsciousness. Vanilla and amber do the heavy lifting; we simply removed everything that would make a sensitive nose object. Smells like contentment. Legally distinct from a vet bill.',
    profile: {warm: 0.92, sweet: 0.74, woody: 0.5, fresh: 0.3},
    swatch: {glass: '#dcb87f', wax: '#efe6cf'},
    priceRange: {minVariantPrice: money('54.00')},
    featuredImage: {url: '/images/products/midday-nap.jpg', altText: 'Midday Nap Matrix candle'},
    options: [{name: 'Size', values: ['8 oz', '11 oz']}],
    variants: sizeVariants('midday-nap', 54),
  },
  {
    id: 'gid://shopify/Product/litter-accord',
    handle: 'litter-box-accord',
    title: 'Litter Box Accord',
    collectionNo: 3,
    badge: null,
    notes: 'Bergamot · Green Fig · Diplomacy',
    bullets: [
      'For homes with a cat and standards.',
      'Negotiates a lasting peace with the corner.',
    ],
    description:
      'A bright, diplomatic accord for the room that everyone politely pretends is fine. Bergamot and green fig open negotiations; a clean musk base brokers the ceasefire. For homes with a cat and standards.',
    profile: {warm: 0.35, sweet: 0.5, woody: 0.4, fresh: 0.8},
    swatch: {glass: '#c8d96b', wax: '#e9efc9'},
    priceRange: {minVariantPrice: money('54.00')},
    featuredImage: {url: '/images/products/litter-accord.jpg', altText: 'Litter Box Accord candle'},
    options: [{name: 'Size', values: ['8 oz', '11 oz']}],
    variants: sizeVariants('litter-accord', 54),
  },
  {
    id: 'gid://shopify/Product/wet-dog-directive',
    handle: 'wet-dog-directive',
    title: 'Wet Dog Directive',
    collectionNo: 4,
    badge: null,
    notes: 'Petrichor · Cedar · Damp Fur',
    bullets: [
      'The smell, reformed. Finally on your side.',
      'Tested on humans. Aggressively approved by Chihuahuas.',
    ],
    description:
      'The smell, reformed and finally on your side. Petrichor and cedar reframe a familiar note as something you would actually choose, with a damp-fur base that knows exactly what it is referencing. Tested on humans. Aggressively approved by Chihuahuas.',
    profile: {warm: 0.6, sweet: 0.3, woody: 0.85, fresh: 0.55},
    swatch: {glass: '#c89a6c', wax: '#ece0c8'},
    priceRange: {minVariantPrice: money('58.00')},
    featuredImage: {url: '/images/products/wet-dog-directive.jpg', altText: 'Wet Dog Directive candle'},
    options: [{name: 'Size', values: ['8 oz', '11 oz']}],
    variants: sizeVariants('wet-dog-directive', 58),
  },
  {
    id: 'gid://shopify/Product/open-window',
    handle: 'open-window-initiative',
    title: 'Open Window Initiative',
    collectionNo: 5,
    badge: null,
    notes: 'Cold Air · Cut Grass · Relief',
    bullets: [
      'Like a breeze, minus the actual draft.',
      'Safe for dogs, cats, and that weird lizard.',
    ],
    description:
      'The feeling of opening a window, minus the actual draft and the actual bugs. Cold air and cut grass arrive first; a quiet sense of relief lingers. Safe for dogs, cats, and that weird lizard.',
    profile: {warm: 0.25, sweet: 0.35, woody: 0.4, fresh: 0.95},
    swatch: {glass: '#a9c3a0', wax: '#dde7d2'},
    priceRange: {minVariantPrice: money('54.00')},
    featuredImage: {url: '/images/products/open-window.jpg', altText: 'Open Window Initiative candle'},
    options: [{name: 'Size', values: ['8 oz', '11 oz']}],
    variants: sizeVariants('open-window', 54),
  },
  {
    id: 'gid://shopify/Product/zero-incident',
    handle: 'the-zero-incident-edition',
    title: 'The Zero Incident Edition',
    collectionNo: 6,
    badge: 'Limited',
    notes: 'White Tea · Mineral · Restraint',
    bullets: [
      'No soot. No incidents. No regrets.',
      'Engineered to survive the cat. (Results may vary.)',
    ],
    description:
      'A composed, mineral-clean limited edition for people who have decided that this year will be different. White tea and a cool mineral note keep things disciplined; restraint is the whole point. No soot. No incidents. No regrets.',
    profile: {warm: 0.3, sweet: 0.25, woody: 0.45, fresh: 0.85},
    swatch: {glass: '#bcd3d6', wax: '#dde9ea'},
    priceRange: {minVariantPrice: money('58.00')},
    featuredImage: {url: '/images/products/zero-incident.jpg', altText: 'The Zero Incident Edition candle'},
    options: [{name: 'Size', values: ['8 oz', '11 oz']}],
    variants: sizeVariants('zero-incident', 58),
  },
];

/** Lookup helper mirroring a products.$handle loader. */
export function getMockProductByHandle(handle: string): MockProduct | undefined {
  return mockProducts.find((p) => p.handle === handle);
}

/** The whole catalog, mirroring a collection loader. */
export function getMockCollection() {
  return {
    handle: 'all',
    title: 'The Collection',
    products: {nodes: mockProducts},
  };
}
