import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {CandleVessel} from '~/components/CandleVessel';
import {useAside} from '~/components/Aside';
import type {MockProduct} from '~/lib/mock-products';

const dollars = (amount: string) => `$${Math.round(Number(amount))}`;

/**
 * Collection-grid card (homepage "Six smells…" + PDP "Complete the set").
 * The image + name link to the PDP; the Add button lives OUTSIDE that link so
 * it adds to the (real Hydrogen) cart without navigating.
 */
export function CandleCard({product}: {product: MockProduct}) {
  const {open} = useAside();
  const price = product.priceRange.minVariantPrice;
  const defaultVariant = product.variants[0];

  return (
    <article className="card">
      {product.badge ? <span className="badge">{product.badge}</span> : null}
      <span className="price-tag">{dollars(price.amount)}</span>
      <Link
        className="card-go"
        to={`/products/${product.handle}`}
        prefetch="intent"
      >
        <div className="stage">
          <CandleVessel product={product} />
        </div>
        <div className="pname">{product.title}</div>
        <div className="pnotes">{product.notes}</div>
      </Link>
      <ul className="pbullets">
        {product.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <AddToCartButton
        className="add"
        onClick={() => open('cart')}
        lines={[{merchandiseId: defaultVariant.id, quantity: 1}]}
      >
        Add to basket — {dollars(price.amount)}
      </AddToCartButton>
    </article>
  );
}

/** Smaller "Complete the set" related card — links to the PDP. */
export function RelatedCandleCard({product}: {product: MockProduct}) {
  const price = product.priceRange.minVariantPrice;
  const shortNotes = product.notes
    .split(' · ')
    .filter((_, i) => i === 0 || i === 2)
    .join(' · ');

  return (
    <Link className="rel" to={`/products/${product.handle}`} prefetch="intent">
      <div className="relstage">
        <CandleVessel product={product} />
      </div>
      <div className="rn">{product.title}</div>
      <div className="rp">
        {shortNotes.toUpperCase()} · {dollars(price.amount)}
      </div>
    </Link>
  );
}
