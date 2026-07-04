import {Link} from 'react-router';

const FOOT_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      {title: 'All candles', to: '/#shop'},
      {title: 'Best sellers', to: '/#shop'},
      {title: 'The gift set', to: '/#shop'},
      {title: 'Refills', to: '/#shop'},
    ],
  },
  {
    heading: 'About',
    links: [
      {title: 'Our story', to: '/#story'},
      {title: 'Pet-safe pledge', to: '/#creds'},
      {title: 'The intervention', to: '/#roast'},
      {title: 'Brian', to: '/#story'},
    ],
  },
  {
    heading: 'Help',
    links: [
      {title: 'Shipping', to: '/policies/shipping-policy'},
      {title: 'Returns', to: '/policies/refund-policy'},
      {title: 'Contact', to: '/pages/contact'},
      {title: 'FAQ', to: '/pages/faq'},
    ],
  },
];

export function Footer() {
  return (
    <footer className="hp-footer" data-dark>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="logo">Happy Paws</div>
            <p>
              Pet-safe fragrance for people who treat their pet like a person.
              Composed seriously. Genuinely non-toxic.
            </p>
          </div>
          {FOOT_COLUMNS.map((col) => (
            <div className="foot-col" key={col.heading}>
              <h4>{col.heading}</h4>
              {col.links.map((link) => (
                <Link
                  key={`${link.title}-${link.to}`}
                  to={link.to}
                  prefetch="intent"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="giant">HAPPY PAWS</div>
        <div className="foot-bot">
          <span className="mono">
            © 2026 Happy Paws Fragrance Co. · Made for pets, sold to their
            people.
          </span>
          <span className="mono">Non-toxic · Cruelty-free · Brian-approved</span>
        </div>
      </div>
    </footer>
  );
}
