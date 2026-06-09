import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

/** Brand nav. "Shop" jumps to the homepage collection grid; the others to
 * their homepage sections. Account is a real route. */
export const HEADER_NAV = [
  {title: 'Shop', to: '/#shop'},
  {title: 'The Roast', to: '/#roast'},
  {title: 'Why', to: '/#creds'},
  {title: 'Brian', to: '/#story'},
];

export function Header({header, cart}: HeaderProps) {
  const {open} = useAside();
  return (
    <header className="hp-header">
      <div className="brand-lock">
        <span className="paw" />
        <Link to="/" className="logo" prefetch="intent">
          Happy Paws
        </Link>
      </div>
      <nav className="hp-nav" role="navigation">
        {HEADER_NAV.map((item) => (
          <Link key={item.title} to={item.to} prefetch="intent">
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        <NavLink to="/account" className="mono acct" prefetch="intent">
          Account
        </NavLink>
        <CartToggle cart={cart} />
        <button
          className="menu-toggle"
          aria-label="Open menu"
          onClick={() => open('mobile')}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function CartButton({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const countRef = useRef(count);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count > countRef.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 300);
      countRef.current = count;
      return () => window.clearTimeout(t);
    }
    countRef.current = count;
  }, [count]);

  return (
    <button
      className="cart-btn"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <span>Cart</span>
      <span
        className={`cart-count${bump ? ' bump' : ''}`}
        aria-label={`${count} items in cart`}
      >
        {count}
      </span>
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartButton count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartButton count={cart?.totalQuantity ?? 0} />;
}

/** Big numbered links shown inside the mobile menu Aside. */
export function HeaderMobileNav() {
  const {close} = useAside();
  return (
    <nav className="hp-mobile-nav" role="navigation">
      {HEADER_NAV.map((item, i) => (
        <Link key={item.title} to={item.to} onClick={close} prefetch="intent">
          <span className="idx">{String(i + 1).padStart(2, '0')}</span>
          {item.title}
        </Link>
      ))}
      <Link to="/account" onClick={close} prefetch="intent">
        <span className="idx">05</span>
        Account
      </Link>
    </nav>
  );
}
