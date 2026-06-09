import {Image} from '@shopify/hydrogen';
import type {MockProduct} from '~/lib/mock-products';

/**
 * Product imagery for a candle.
 *
 * Per the design handoff, the candle "vessel" graphic is a *placeholder* until
 * real photography exists — not the intended final art. So:
 *   - When a real Shopify CDN photo is present, render it via Hydrogen's
 *     <Image> (Phase 2: fixtures point at real URLs).
 *   - Otherwise fall back to a tasteful CSS vessel placeholder driven by the
 *     fixture's `swatch` colors.
 *
 * Sizing (`--jw`) and the soft drop-shadow come from the surrounding context
 * (`.card .jar`, `.view .jar`, `.rel .jar`, the hero, etc.).
 */
export function CandleVessel({
  product,
  lit = true,
  volLabel = 'SOY · 8 OZ',
}: {
  product: Pick<MockProduct, 'title' | 'featuredImage' | 'swatch'>;
  lit?: boolean;
  volLabel?: string;
}) {
  const url = product.featuredImage?.url ?? '';
  const hasRealPhoto =
    /^https?:\/\//.test(url) && !url.includes('/images/products/');

  if (hasRealPhoto) {
    return (
      <Image
        className="jar-photo"
        data={product.featuredImage}
        alt={product.featuredImage.altText || product.title}
        sizes="(min-width: 920px) 280px, 60vw"
      />
    );
  }

  return (
    <div
      className={`jar${lit ? ' lit' : ''}`}
      style={
        {
          '--glass': product.swatch.glass,
          '--wax': product.swatch.wax,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div className="jar-glass" />
      <div className="jar-rim">
        <span className="wick" />
        <span className="flame" />
      </div>
      <div className="jar-label">
        <div className="jb">HAPPY PAWS</div>
        <div className="js">{product.title}</div>
        <div className="rule" />
        <div className="jv">{volLabel}</div>
      </div>
    </div>
  );
}
