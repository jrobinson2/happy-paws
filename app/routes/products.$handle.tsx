import {useEffect, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {AddToCartButton} from '~/components/AddToCartButton';
import {CandleVessel} from '~/components/CandleVessel';
import {RelatedCandleCard} from '~/components/CandleCard';
import {useAside} from '~/components/Aside';
import {
  getMockProductByHandle,
  mockProducts,
  type MockProduct,
} from '~/lib/mock-products';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? 'Candle'} — Happy Paws`},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
  ];
};

export async function loader({params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle to be defined');

  // PHASE 1: look the product up in local fixtures. PHASE 2 cutover: replace
  // with `await context.storefront.query(PRODUCT_QUERY, {variables: {handle}})`.
  const product = getMockProductByHandle(handle);
  if (!product) {
    throw new Response(null, {status: 404});
  }

  const related = mockProducts
    .filter((p) => p.handle !== handle)
    .slice(0, 3);

  return {product, related};
}

/** Burn-time copy per size, keyed by the variant title. */
const SIZE_DETAIL: Record<string, {hint: string; per: string}> = {
  '8 oz': {hint: 'The standard · 50 hr', per: '8 oz · 50 hr burn'},
  '11 oz': {hint: 'The commitment · 75 hr', per: '11 oz · 75 hr burn'},
};

const dollars = (amount: string | number) =>
  `$${Math.round(Number(amount))}`;

export default function Product() {
  const {product, related} = useLoaderData<typeof loader>();
  const {open} = useAside();

  const [sizeIndex, setSizeIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const variant = product.variants[sizeIndex];
  const unitPrice = Number(variant.price.amount);
  const totalLabel = dollars(unitPrice * qty);
  const sizeDetail = SIZE_DETAIL[variant.title] ?? {
    hint: variant.title,
    per: variant.title,
  };

  const buyRef = useRef<HTMLDivElement>(null);
  const [stickyShown, setStickyShown] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStickyShown(!entry.isIntersecting),
      {threshold: 0},
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lines = [{merchandiseId: variant.id, quantity: qty}];

  return (
    <>
      <main className="pdp">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/#shop">The Collection</Link>
            <span className="sep">/</span>
            <span className="here">{product.title}</span>
          </nav>

          <section className="pdp-hero">
            <Gallery product={product} />

            <div className="buy">
              <div className="peyebrow">
                {product.badge ? (
                  <span className="tag">{product.badge}</span>
                ) : null}
                Pet-safe · No.{' '}
                {String(product.collectionNo).padStart(2, '0')} of the collection
              </div>
              <h1>{product.title}</h1>
              <div className="rating">
                <span className="stars" aria-hidden="true">
                  ★★★★★
                </span>
                <span>4.9 — 212 reviews (one from a cat, begrudgingly)</span>
              </div>
              <div className="price-row">
                <span className="amt">{dollars(unitPrice)}</span>
                <span className="per">/ {sizeDetail.per}</span>
              </div>
              <div className="pnotes-row">{product.notes}</div>
              <p className="pdesc">{product.description}</p>

              <ScentProfile profile={product.profile} />

              <div className="opt-block">
                <div className="ol">Size</div>
                <div className="sizes">
                  {product.variants.map((v, i) => {
                    const detail = SIZE_DETAIL[v.title] ?? {
                      hint: v.title,
                      per: v.title,
                    };
                    return (
                      <button
                        type="button"
                        key={v.id}
                        className={`size${i === sizeIndex ? ' active' : ''}`}
                        aria-pressed={i === sizeIndex}
                        onClick={() => setSizeIndex(i)}
                      >
                        <div className="sz">{v.title}</div>
                        <div className="sp">{detail.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="buy-actions" ref={buyRef}>
                <div className="qty-big">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <AddToCartButton
                  className="add-big"
                  lines={lines}
                  onClick={() => open('cart')}
                  disabled={!variant.availableForSale}
                >
                  Add to basket — {totalLabel}
                </AddToCartButton>
              </div>

              <AddToCartButton
                className="subscribe"
                lines={lines}
                onClick={() => open('cart')}
              >
                Subscribe &amp; save 15% — <b>one shows up every month</b>, like a
                responsible adult
              </AddToCartButton>

              <div className="trust">
                <div>100% soy &amp; coconut wax. Zero paraffin.</div>
                <div>Lead-free cotton wick. No black soot.</div>
                <div>Genuinely pet-safe. Vet looked, shrugged approvingly.</div>
                <div>Hand-poured in small, anxious batches.</div>
              </div>

              <Accordion />
            </div>
          </section>
        </div>
      </main>

      <FragrancePyramid />
      <SpecSheet />
      <Reviews />
      <CompleteTheSet related={related} />

      <div className={`sticky-buy${stickyShown ? ' show' : ''}`}>
        <div className="sb-info">
          <div className="sb-name">{product.title}</div>
          <div className="sb-price">
            {dollars(unitPrice)} · {variant.title}
          </div>
        </div>
        <AddToCartButton
          className="sb-add"
          lines={lines}
          onClick={() => open('cart')}
        >
          Add — {totalLabel}
        </AddToCartButton>
      </div>
    </>
  );
}

function Gallery({product}: {product: MockProduct}) {
  const [view, setView] = useState(0);
  const thumbs = ['LIT', 'UNLIT', 'LABEL', 'IN SITU'];

  return (
    <div className="gallery">
      <div className="stage">
        <div className={`view${view === 0 ? ' active' : ''}`}>
          <CandleVessel product={product} lit volLabel="SOY & COCONUT · 8 OZ" />
        </div>
        <div className={`view${view === 1 ? ' active' : ''}`}>
          <CandleVessel
            product={product}
            lit={false}
            volLabel="SOY & COCONUT · 8 OZ"
          />
        </div>
        <div className={`view${view === 2 ? ' active' : ''}`}>
          <div className="label-zoom">
            <div className="jb">
              HAPPY PAWS · NO. {String(product.collectionNo).padStart(2, '0')}
            </div>
            <div className="jt">{product.title}</div>
            <div className="rule" />
            <div className="jv">
              {product.notes.toUpperCase()}
              <br />
              SOY &amp; COCONUT WAX · 8 OZ · 50 HR
              <br />
              HAND-POURED · PET-SAFE · VEGAN
            </div>
          </div>
        </div>
        <div className={`view${view === 3 ? ' active' : ''}`}>
          <div className="scene-ph">
            <span>
              On the mantel
              <br />
              (product photography goes here)
            </span>
          </div>
        </div>
      </div>
      <div className="thumbs">
        {thumbs.map((label, i) => (
          <button
            type="button"
            key={label}
            className={`thumb${i === view ? ' active' : ''}`}
            aria-label={`View ${label.toLowerCase()}`}
            onClick={() => setView(i)}
          >
            {i === 0 ? (
              <div
                className="dotjar"
                style={
                  {
                    background: `linear-gradient(${product.swatch.wax}, ${product.swatch.glass})`,
                  } as React.CSSProperties
                }
              />
            ) : (
              <span className="mono">{label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScentProfile({profile}: {profile: MockProduct['profile']}) {
  const rows: Array<[string, number]> = [
    ['Warm', profile.warm],
    ['Sweet', profile.sweet],
    ['Woody', profile.woody],
    ['Fresh', profile.fresh],
  ];
  return (
    <div className="profile r">
      <div className="plabel">Scent profile</div>
      {rows.map(([label, value]) => (
        <div className="prow" key={label}>
          <span className="pk">{label}</span>
          <div className="ptrack">
            <div
              className="pfill"
              style={{['--v' as string]: value} as React.CSSProperties}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const ACCORDION = [
  {
    title: 'The full ingredient list',
    body: (
      <>
        <p>
          We have nothing to hide, which is the whole point. Everything, in
          descending order of how much there is:
        </p>
        <ul className="mono-list">
          <li>
            <span>Soy &amp; coconut wax blend</span>
            <span>91%</span>
          </li>
          <li>
            <span>Fragrance-grade oils (phthalate-free)</span>
            <span>8%</span>
          </li>
          <li>
            <span>Cotton wick (lead-free)</span>
            <span>1%</span>
          </li>
          <li>
            <span>Paraffin</span>
            <span>0%</span>
          </li>
          <li>
            <span>Things we can&rsquo;t pronounce</span>
            <span>0%</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'How to burn it properly',
    body: (
      <>
        First burn: let the wax melt all the way to the edge (about 2 hours) or
        it will tunnel and judge you forever. Trim the wick to ¼&quot; before
        every light. Keep away from drafts, curtains, and the tail of an
        enthusiastic dog. Never leave a flame unattended — your pet is not
        certified in fire safety, despite their confidence.
      </>
    ),
  },
  {
    title: 'Shipping & returns',
    body: (
      <>
        Free carbon-neutral shipping over $60. Arrives in 3–5 business days,
        swaddled in recycled, embarrassingly over-engineered packaging. Unlit and
        unloved? Return it within 30 days for a full refund. Lit and unloved?
        We&rsquo;ll talk.
      </>
    ),
  },
];

function Accordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="acc">
      {ACCORDION.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className={`acc-item${isOpen ? ' open' : ''}`} key={item.title}>
            <button
              type="button"
              className="acc-head"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              {item.title} <span className="pm">+</span>
            </button>
            <div className="acc-body">
              <div className="inner">{item.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FragrancePyramid() {
  const notes = [
    {
      num: '01 / TOP',
      lead: 'Bergamot &',
      tail: 'Warm Sugar',
      detail:
        'Intended: a soft, inviting open. Detected: the kitchen, twenty minutes after something good.',
    },
    {
      num: '02 / HEART',
      lead: 'Vanilla Orchid,',
      tail: 'Amber',
      detail:
        'Intended: warmth and depth. Detected: the exact temperature of a sunbeam at 2pm.',
    },
    {
      num: '03 / BASE',
      lead: 'Sandalwood &',
      tail: 'Clean Musk',
      detail:
        'Intended: a long, comforting finish. Detected: a nap that was not, technically, scheduled.',
    },
  ];
  return (
    <section className="section pyramid" data-dark>
      <div className="wrap">
        <div className="sec-head r">
          <div>
            <span className="eyebrow mono">Fragrance Pyramid</span>
            <h2>
              The notes, <span className="it">annotated</span> by the household.
            </h2>
          </div>
          <p>
            What our perfumer intended, versus what was independently confirmed by
            the animals. We report both, in the interest of science.
          </p>
        </div>
        <div className="note-list">
          {notes.map((note) => (
            <div className="note-row r" key={note.num}>
              <span className="num">{note.num}</span>
              <span className="nt">
                {note.lead} <span className="it">{note.tail}</span>
              </span>
              <span className="nd">{note.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecSheet() {
  const specs: Array<[string, string]> = [
    ['Wax', 'Soy & coconut blend'],
    ['Wick', 'Lead-free cotton'],
    ['Burn time', '50 hours (8 oz)'],
    ['Net weight', '8 oz / 227 g'],
    ['Vessel', 'Reusable frosted glass'],
    ['Fragrance', 'Phthalate-free, IFRA-compliant'],
    ['Made in', 'Small anxious batches'],
    ['Tested on', 'Humans. Approved by pets.'],
  ];
  const steps = [
    {
      n: '1',
      h: 'Commit to the first burn',
      p: 'Let the wax pool reach the very edge — about two hours. Skip this and it tunnels, holds a grudge, and burns half as long.',
    },
    {
      n: '2',
      h: 'Trim the wick to ¼"',
      p: 'Before every single light. A long wick means soot, and soot is the one thing we refuse to negotiate on.',
    },
    {
      n: '3',
      h: 'Mind the tail',
      p: 'Keep the flame away from drafts, curtains, and the enthusiastic tail of a dog who has not considered the consequences.',
    },
  ];
  return (
    <section className="section">
      <div className="wrap specs-grid">
        <div className="r">
          <span className="eyebrow mono">The Spec Sheet</span>
          <h2 className="spec-title">Everything, on the record.</h2>
          <ul className="spec-list">
            {specs.map(([k, v]) => (
              <li key={k}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="r">
          <span className="eyebrow mono">The Field Guide</span>
          <h2 className="spec-title">How to burn it properly.</h2>
          <div className="steps">
            {steps.map((step) => (
              <div className="step" key={step.n}>
                <span className="sn">{step.n}</span>
                <div>
                  <h4>{step.h}</h4>
                  <p>{step.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const reviews = [
    {
      text: '“My apartment finally smells like a person lives here, not three cats and a regret. The cats are furious. Five stars.”',
      who: 'Dana R. · verified · 2 cats (Steve, Other Steve)',
    },
    {
      text: '“Bought it because my dog has asthma and I have taste. Did not expect to also fix my entire personality, but here we are.”',
      who: 'Marcus T. · verified · 1 dog (Beans)',
    },
    {
      text: '“It says 50 hours. I have burned it for 49 and cannot confirm the last hour because I will not be putting it out. Ever.”',
      who: 'Priya N. · verified · 1 lizard (no name, mutual)',
    },
  ];
  return (
    <section className="section" style={{paddingTop: 0}}>
      <div className="wrap">
        <div className="sec-head r">
          <div>
            <span className="eyebrow mono">212 Reviews · 4.9 ★</span>
            <h2>
              What the humans <span className="it">say.</span>
            </h2>
          </div>
          <p>
            The pets declined to comment, citing a nap. The humans were more
            forthcoming.
          </p>
        </div>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div className="review r" key={review.who}>
              <span className="stars" aria-hidden="true">
                ★★★★★
              </span>
              <p>{review.text}</p>
              <span className="who">{review.who}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompleteTheSet({related}: {related: MockProduct[]}) {
  return (
    <section className="section" style={{paddingTop: 0}}>
      <div className="wrap">
        <div className="sec-head r">
          <div>
            <span className="eyebrow mono">Complete the Set</span>
            <h2>
              Goes well with <span className="it">a clean conscience.</span>
            </h2>
          </div>
          <Link to="/#shop" className="btn ghost" prefetch="intent">
            Shop all six <span className="arr">→</span>
          </Link>
        </div>
        <div className="rel-grid r">
          {related.map((product) => (
            <RelatedCandleCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
