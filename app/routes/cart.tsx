import {useState} from 'react';
import {Link, useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import {
  CartForm,
  Image,
  Money,
  useOptimisticCart,
  type CartQueryDataReturn,
  type OptimisticCart,
  type OptimisticCartLine,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export const meta: Route.MetaFunction = () => {
  return [{title: `Checkout — Happy Paws`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

const SHIP_OPTIONS = [
  {id: 'standard', name: 'Standard', detail: '3–5 business days', price: 'Free'},
  {id: 'express', name: 'Express', detail: '1–2 business days', price: '$12'},
  {
    id: 'pigeon',
    name: 'Carrier pigeon',
    detail: 'We genuinely advise against this',
    price: '$40',
  },
];

export default function Cart() {
  const originalCart = useLoaderData<typeof loader>();
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = (cart?.totalQuantity ?? 0) > 0;

  return (
    <main className="co">
      <div className="wrap">
        <div className="co-head">
          <h1>
            Almost <span className="li">yours.</span>
          </h1>
          <p>
            A few details and it&rsquo;s on its way. Your pet will pretend not to
            notice, then sleep directly in front of it.
          </p>
        </div>

        {!hasItems ? (
          <div className="empty">
            <div className="big">Your cart is empty.</div>
            <p>
              Which means your home still smells like a mystery. Let&rsquo;s fix
              that.
            </p>
            <Link to="/#shop" className="btn" prefetch="intent">
              Shop the collection <span className="arr">→</span>
            </Link>
          </div>
        ) : (
          <div className="co-grid">
            <CheckoutForm />
            <OrderSummary cart={cart} lines={lines} />
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Contact / shipping / delivery / payment capture.
 *
 * PRODUCTION NOTE: real Shopify checkout is a hosted redirect (see the "Pay
 * now" button → `cart.checkoutUrl`). These fields are presentational capture
 * only — do NOT build a custom card field in production. Delivery-speed and
 * tax are finalized on Shopify's hosted checkout.
 */
function CheckoutForm() {
  const [ship, setShip] = useState('standard');
  return (
    <form className="co-form" onSubmit={(e) => e.preventDefault()}>
      <div className="co-step">
        <h3>
          <span className="sidx">1</span> Contact
        </h3>
        <p className="sub">
          We&rsquo;ll email you about this order. And candles. Mostly candles.
        </p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@haveapet.com" />
        </div>
      </div>

      <div className="co-step">
        <h3>
          <span className="sidx">2</span> Ship it to
        </h3>
        <p className="sub">Where the magic — and the pet hair — happens.</p>
        <div className="row2">
          <div className="field">
            <label htmlFor="fn">First name</label>
            <input id="fn" type="text" placeholder="Jordan" />
          </div>
          <div className="field">
            <label htmlFor="ln">Last name</label>
            <input id="ln" type="text" placeholder="Reyes" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="addr">Address</label>
          <input id="addr" type="text" placeholder="404 Tennis Ball Lane" />
        </div>
        <div className="field">
          <label htmlFor="apt">Apartment, suite, etc. (optional)</label>
          <input id="apt" type="text" placeholder="The one with the loud dog" />
        </div>
        <div className="row3">
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" type="text" placeholder="Portland" />
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <input id="state" type="text" placeholder="OR" />
          </div>
          <div className="field">
            <label htmlFor="zip">ZIP</label>
            <input id="zip" type="text" placeholder="97201" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <select id="country" defaultValue="United States">
            <option>United States</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>Australia</option>
          </select>
        </div>
      </div>

      <div className="co-step">
        <h3>
          <span className="sidx">3</span> Delivery speed
        </h3>
        <p className="sub">
          How quickly do you need your home to stop smelling like that?
        </p>
        <div>
          {SHIP_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.id}
              className={`ship-opt${ship === opt.id ? ' active' : ''}`}
              aria-pressed={ship === opt.id}
              onClick={() => setShip(opt.id)}
            >
              <div className="so-l">
                <span className="radio" />
                <div>
                  <div className="st">{opt.name}</div>
                  <div className="sd">{opt.detail}</div>
                </div>
              </div>
              <div className="so-r">{opt.price}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="co-step">
        <h3>
          <span className="sidx">4</span> Payment
        </h3>
        <p className="sub">
          All transactions are secure and, frankly, aggressively encrypted.
        </p>
        <div className="field">
          <label htmlFor="card">Card number</label>
          <input
            id="card"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        <div className="row2">
          <div className="field">
            <label htmlFor="exp">Expiry</label>
            <input id="exp" type="text" placeholder="MM / YY" />
          </div>
          <div className="field">
            <label htmlFor="cvc">CVC</label>
            <input id="cvc" type="text" inputMode="numeric" placeholder="123" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="name-card">Name on card</label>
          <input id="name-card" type="text" placeholder="Jordan Reyes" />
        </div>
        <div className="pay-badge">
          256-bit encryption · we can&rsquo;t see your card, only your devotion
        </div>
      </div>
    </form>
  );
}

function OrderSummary({
  cart,
  lines,
}: {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  lines: CartLine[];
}) {
  const count = cart?.totalQuantity ?? 0;
  const appliedCodes =
    cart?.discountCodes?.filter((d) => d.applicable).map((d) => d.code) ?? [];

  return (
    <div className="summary">
      <h2>Order summary</h2>
      <div className="stitle-sub">
        {count} {count === 1 ? 'item' : 'items'}
      </div>

      <div className="sum-items">
        {lines.map((line) => (
          <SummaryLine key={line.id} line={line} />
        ))}
      </div>

      <Discounts appliedCodes={appliedCodes} />

      <div className="totals">
        <div className="tr">
          <span>Subtotal</span>
          <span className="v">
            {cart?.cost?.subtotalAmount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : (
              '—'
            )}
          </span>
        </div>
        {appliedCodes.length > 0 ? (
          <div className="tr">
            <span>Discount</span>
            <span className="v" style={{color: 'var(--lime-deep)'}}>
              {appliedCodes.join(', ')}
            </span>
          </div>
        ) : null}
        <div className="tr">
          <span>Shipping</span>
          <span className="v">Free</span>
        </div>
        <div className="tr">
          <span>Tax (estimated)</span>
          <span className="v">
            {cart?.cost?.totalTaxAmount ? (
              <Money data={cart.cost.totalTaxAmount} />
            ) : (
              'At checkout'
            )}
          </span>
        </div>
        <div className="grand">
          <span className="gl">Total</span>
          <span className="gv">
            {cart?.cost?.totalAmount ? (
              <Money data={cart.cost.totalAmount} />
            ) : (
              '—'
            )}
            <small>USD</small>
          </span>
        </div>
      </div>

      {cart?.checkoutUrl ? (
        <a href={cart.checkoutUrl} className="pay">
          Pay now <span className="arr">→</span>
        </a>
      ) : (
        <button type="button" className="pay" disabled>
          Pay now <span className="arr">→</span>
        </button>
      )}
      <div className="sum-fine">
        Free returns within 30 days · Pet-safe guarantee · Brian-approved
      </div>
    </div>
  );
}

function SummaryLine({line}: {line: CartLine}) {
  const {id, quantity, merchandise, cost} = line;
  const {product, image, selectedOptions} = merchandise;
  const url = useVariantUrl(product.handle, selectedOptions);
  const meta = selectedOptions
    .filter((o) => o.value && o.value !== 'Default Title')
    .map((o) => o.value)
    .join(' · ');

  return (
    <div className="sum-line">
      <div className="mini">
        <span className="qbadge">{quantity}</span>
        {image ? (
          <Image data={image} width={54} height={70} alt="" />
        ) : null}
      </div>
      <div className="sl-info">
        <Link className="sl-n" to={url} prefetch="intent">
          {product.title}
        </Link>
        {meta ? <div className="sl-m">{meta}</div> : null}
        <div className="sl-ctrl">
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
          <CartLineRemove lineId={id} />
        </div>
      </div>
      <div className="sl-price">
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
  lineId: string;
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

function CartLineRemove({lineId}: {lineId: string}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds: [lineId]}}
    >
      <button type="submit" className="rm">
        Remove
      </button>
    </CartForm>
  );
}

/**
 * Real Shopify discount codes via CartForm (`DiscountCodesUpdate`) — works
 * against the mock.shop demo API. Demo codes to try: BRIAN10 / PETSAFE / WETDOG.
 */
function Discounts({appliedCodes}: {appliedCodes: string[]}) {
  return (
    <section aria-label="Discount code">
      {appliedCodes.length > 0 ? (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.DiscountCodesUpdate}
          inputs={{discountCodes: []}}
        >
          <div className="disc-applied">
            <span>Applied: {appliedCodes.join(', ')}</span>
            <button type="submit">Remove</button>
          </div>
        </CartForm>
      ) : (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.DiscountCodesUpdate}
          inputs={{discountCodes: appliedCodes}}
        >
          <div className="discount-row">
            <input
              type="text"
              name="discountCode"
              placeholder="Discount code"
              aria-label="Discount code"
            />
            <button type="submit">Apply</button>
          </div>
          <div className="disc-msg">
            Psst — try <b>BRIAN10</b>.
          </div>
        </CartForm>
      )}
    </section>
  );
}
