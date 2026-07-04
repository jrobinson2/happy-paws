import {
  CartForm,
  Image,
  Money,
  useOptimisticCart,
  type OptimisticCartLine,
} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;
import {useAside} from '~/components/Aside';
import {useVariantUrl} from '~/lib/variants';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The cart drawer (Aside). Built on Hydrogen's real cart primitives
 * (`useOptimisticCart`, `CartForm`, `checkoutUrl`) — the full checkout
 * experience lives on the `/cart` route. The page layout uses the bespoke
 * checkout in `routes/cart.tsx`, so this component renders the slide-in drawer.
 */
export function CartMain({cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = (cart?.totalQuantity ?? 0) > 0;

  if (!hasItems) {
    return (
      <div className="drawer-empty">
        <div className="big">It&rsquo;s empty in here.</div>
        <p>Like the house, before a candle. Tragic, honestly.</p>
        <CartCloseLink to="/#shop" className="btn">
          Shop the collection
        </CartCloseLink>
      </div>
    );
  }

  return (
    <>
      <div className="drawer-body">
        {lines.map((line) => (
          <CartDrawerLine key={line.id} line={line} />
        ))}
      </div>
      <div className="drawer-foot">
        <div className="row">
          <span className="t">Subtotal</span>
          <span className="t">
            {cart?.cost?.subtotalAmount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : (
              '—'
            )}
          </span>
        </div>
        <div className="row">
          <span className="sub">Shipping &amp; guilt calculated at checkout</span>
        </div>
        <CartCloseLink to="/cart" className="checkout">
          Checkout <span className="arr">→</span>
        </CartCloseLink>
      </div>
    </>
  );
}

function CartDrawerLine({line}: {line: CartLine}) {
  const {close} = useAside();
  const {id, quantity, merchandise, cost} = line;
  const {product, image, selectedOptions} = merchandise;
  const url = useVariantUrl(product.handle, selectedOptions);
  const meta = selectedOptions
    .filter((o) => o.value && o.value !== 'Default Title')
    .map((o) => o.value)
    .join(' · ');

  return (
    <div className="line">
      {image ? (
        <Image className="mini" data={image} width={56} height={72} alt="" />
      ) : (
        <div className="mini" />
      )}
      <div className="li-info">
        <Link className="n" to={url} onClick={close} prefetch="intent">
          {product.title}
        </Link>
        {meta ? <div className="m">{meta}</div> : null}
        <div className="qty">
          <CartLineUpdate
            lineId={id}
            quantity={quantity - 1}
            disabled={quantity <= 1}
          >
            −
          </CartLineUpdate>
          <span>{quantity}</span>
          <CartLineUpdate lineId={id} quantity={quantity + 1}>
            +
          </CartLineUpdate>
        </div>
      </div>
      <div className="li-price">
        {cost?.totalAmount ? <Money data={cost.totalAmount} /> : null}
      </div>
    </div>
  );
}

function CartLineUpdate({
  lineId,
  quantity,
  disabled,
  children,
}: {
  lineId: CartLineFragment['id'];
  quantity: number;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines: [{id: lineId, quantity}]}}
    >
      <button type="submit" disabled={disabled} aria-label="Change quantity">
        {children}
      </button>
    </CartForm>
  );
}

function CartCloseLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: React.ReactNode;
}) {
  const {close} = useAside();
  return (
    <Link to={to} className={className} onClick={close} prefetch="intent">
      {children}
    </Link>
  );
}
