import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {CandleCard} from '~/components/CandleCard';
import {CandleVessel} from '~/components/CandleVessel';
import {Marquee} from '~/components/Marquee';
import {getMockCollection, type MockProduct} from '~/lib/mock-products';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Happy Paws — Pet-Safe Fragrance'},
    {
      name: 'description',
      content:
        'Premium, genuinely non-toxic candles. Better air quality for you and the pets, collectively known as Brian.',
    },
  ];
};

export async function loader(_args: Route.LoaderArgs) {
  // PHASE 1: serve the collection from local fixtures in the Storefront API
  // shape. PHASE 2 cutover: replace this with
  //   const {collection} = await context.storefront.query(COLLECTION_QUERY, …)
  // The components below read the same field names either way.
  return {collection: getMockCollection()};
}

export default function Homepage() {
  const {collection} = useLoaderData<typeof loader>();
  const products = collection.products.nodes;
  const hero = products.find((p) => p.collectionNo === 2) ?? products[0];

  return (
    <>
      <Hero hero={hero} />
      <Marquee />
      <CollectionGrid products={products} />
      <RoastBanner />
      <Credentials />
      <Story />
      <Signup />
    </>
  );
}

function Hero({hero}: {hero: MockProduct}) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-main">
          <div className="hero-eyebrow mono">
            <span className="dotline" />
            Pet-safe fragrance · Dogs, cats &amp; that weird lizard
          </div>
          <h1>
            Better air quality. Your cat will have to find{' '}
            <span className="it">something else</span> to{' '}
            <span className="li">judge you for.</span>
          </h1>
          <p className="hero-sub">
            100% soy wax. Zero synthetic toxins. High-end design and genuine
            respiratory peace of mind — because your pug didn&rsquo;t ask to live
            in a chemical plant.
          </p>
          <div className="hero-cta">
            <Link to="/#shop" className="btn" prefetch="intent">
              Upgrade the room <span className="arr">→</span>
            </Link>
            <Link to="/#roast" className="btn ghost" prefetch="intent">
              Read the lab report
            </Link>
          </div>
        </div>
        <div className="hero-aside">
          <div className="hero-float">
            <CandleVessel product={hero} volLabel="SOY & COCONUT · 8 OZ" />
          </div>
          <div className="hero-meta mono">
            <div>
              <b>50 hrs</b> burn time
            </div>
            <div>
              <b>0</b> toxins
            </div>
            <div>
              <b>∞</b> approving pets
            </div>
          </div>
        </div>
      </div>
      <div className="scrollcue mono">
        <span>Scroll</span>
        <span className="bar" />
      </div>
    </section>
  );
}

function CollectionGrid({products}: {products: MockProduct[]}) {
  return (
    <section className="section" id="shop">
      <div className="wrap">
        <div className="sec-head r">
          <div>
            <span className="eyebrow mono">The Collection</span>
            <h2>
              Six smells, <span className="it">seriously</span> considered.
            </h2>
          </div>
          <p>
            Each one developed by a perfumer who was told, repeatedly, what it
            was for. They stayed anyway. Safe for dogs, cats, and that weird
            lizard.
          </p>
        </div>
        <div className="prod-grid r">
          {products.map((product) => (
            <CandleCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoastBanner() {
  return (
    <section className="section roast" id="roast" data-dark>
      <div className="wrap">
        <span className="eyebrow mono r">A Public Service Announcement</span>
        <h2 className="roast-head r">
          The old candle is still in the closet. Nobody touches it. It{' '}
          <span className="li">knows what it did.</span>
        </h2>
        <div className="roast-grid">
          <p className="roast-sub r">
            Stop buying air fresheners shaped like little green trees from gas
            stations. Your house smells like artificial pine forest and denial.
            Let&rsquo;s fix that — with 100% soy wax, lead-free wicks, and zero
            compromises your pet&rsquo;s lungs can detect.
          </p>
          <div className="roast-aside r">
            <p className="roast-fine">
              We looked at the ingredients in standard grocery-store candles. We
              wouldn&rsquo;t even let our worst enemy&rsquo;s hamster breathe that
              stuff.
            </p>
            <Link to="/#shop" className="btn" prefetch="intent">
              Replace the sketchy candle <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Credentials() {
  return (
    <section className="section" id="creds">
      <div className="wrap">
        <div className="sec-head r" style={{marginBottom: 40}}>
          <div>
            <span className="eyebrow mono">The Fine Print, Enlarged</span>
            <h2>
              Premium is a <span className="it">feeling.</span> Non-toxic is a
              fact.
            </h2>
          </div>
        </div>
        <div className="creds r">
          <div className="cred">
            <div className="ci">01</div>
            <h3>Veterinarian-adjacent</h3>
            <p>
              A licensed vet looked at the ingredient list, paused, and said
              &ldquo;yeah, that&rsquo;s fine.&rdquo; We framed the email.
            </p>
          </div>
          <div className="cred">
            <div className="ci">02</div>
            <h3>0% paraffin, 0% drama</h3>
            <p>
              No paraffin, no lead wicks, no sketchy soot. Safe for dogs, cats,
              and that weird lizard your roommate bought. We read the studies so
              your pet didn&rsquo;t have to.
            </p>
          </div>
          <div className="cred">
            <div className="ci">03</div>
            <h3>Smells expensive</h3>
            <p>
              Guests will assume you have your life together. They will not know
              it doubles as respiratory peace of mind for a Chihuahua. Unless you
              tell them. You will tell them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="section" id="story" style={{paddingTop: 0}}>
      <div className="wrap story">
        <div className="story-img r">
          <span className="ph">Every pet, collectively known as Brian</span>
        </div>
        <div className="r">
          <span className="eyebrow mono">Our Origin, Such As It Is</span>
          <blockquote>
            &ldquo;We started Happy Paws because every pet out there — let&rsquo;s
            call them Brian — deserves a home that smells{' '}
            <span style={{fontWeight: 700}}>slightly less</span> like
            Brian.&rdquo;
          </blockquote>
          <p className="by">— The Founder, advocating for Brians everywhere</p>
          <p className="body">
            It began, as most luxury houses do, with a problem. The candle
            industry was completely ignoring the most sensitive noses in the
            house. The modern pet parent was being forced to choose between a
            beautifully scented living room and their animal&rsquo;s respiratory
            health. That felt like a massive design flaw. So we engineered a
            solution. Happy Paws is a line of fragrance-grade, pet-safe candles
            that treat indoor air quality with absolute seriousness, and pet odor
            with a heavy dose of honesty. We think the Brians of the world would
            be proud. If they weren&rsquo;t busy napping.
          </p>
          <Link
            to="/#shop"
            className="btn ghost"
            style={{marginTop: 28}}
            prefetch="intent"
          >
            Meet the collection <span className="arr">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Signup() {
  return (
    <section className="signup">
      <div className="wrap">
        <span
          className="eyebrow mono"
          style={{justifyContent: 'center', display: 'inline-flex'}}
        >
          Join the list
        </span>
        <h2>
          Get emails. Mostly about <span className="it">candles.</span>
          <br />
          Occasionally about Brian.
        </h2>
        <p>
          10% off your first order, early access to new scents, and updates on a
          dog you&rsquo;ve never met.
        </p>
        <form
          className="signup-form"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Newsletter signup"
        >
          <input
            type="email"
            placeholder="you@haveadog.com"
            aria-label="Email"
          />
          <button type="submit">Subscribe</button>
        </form>
        <div className="fine">No spam. Brian wouldn&rsquo;t allow it.</div>
      </div>
    </section>
  );
}
