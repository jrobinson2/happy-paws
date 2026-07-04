const MARQUEE_ITEMS = [
  'Dogs, cats & lizards welcome',
  '0% paraffin',
  '0% drama',
  'Lead-free wicks',
  'Tested on humans',
  "Won't assault the family therapist",
  '100% soy wax',
  'Genuinely non-toxic',
  'Approved by Chihuahuas',
  '50-hour burn',
];

/** Infinite-scroll deadpan claims bar. Pauses on hover (see CSS). */
export function Marquee() {
  // Render the list twice (two passes) so the -50% keyframe loops seamlessly.
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {['a', 'b'].map((pass) =>
          MARQUEE_ITEMS.map((item) => (
            <span className="item" key={`${pass}-${item}`}>
              <span className="star">✦</span>
              {item}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
