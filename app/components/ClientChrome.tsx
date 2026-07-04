import {useEffect} from 'react';
import {useLocation} from 'react-router';

/**
 * Progressive-enhancement chrome behaviors ported from the prototypes:
 *  - <html class="js"> so scroll-reveal hidden states only apply with JS.
 *  - Header gains `.scrolled` (blurred translucent bg) past 40px.
 *  - `body.on-dark` flips header text to cream while a [data-dark] section is
 *    under the header.
 *  - `.r` elements reveal (fade/translate up) on intersection.
 *  - A `.reveal-ok` failsafe force-shows everything after 2.6s so content is
 *    never permanently hidden if JS/animation stalls.
 *
 * All of this is best-effort polish: with JS off, content renders visible.
 */
export function ClientChrome() {
  const {pathname} = useLocation();

  // One-time: mark JS present + scroll-driven header/dark-flip.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');

    const onScroll = () => {
      const header = document.querySelector('.hp-header');
      if (header) header.classList.toggle('scrolled', window.scrollY > 40);

      const onDark = Array.from(
        document.querySelectorAll<HTMLElement>('[data-dark]'),
      ).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= 70 && r.bottom >= 70;
      });
      document.body.classList.toggle('on-dark', onDark);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Per-navigation: (re)observe reveal elements + reset the failsafe + dark flip.
  useEffect(() => {
    document.documentElement.classList.remove('reveal-ok');

    const els = document.querySelectorAll<HTMLElement>('.r');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      {threshold: 0.14},
    );
    els.forEach((el) => observer.observe(el));

    const failsafe = window.setTimeout(() => {
      document.documentElement.classList.add('reveal-ok');
    }, 2600);

    // Recompute dark flip after the new route paints.
    const raf = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
      window.cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
