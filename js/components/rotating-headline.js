import { prefersReducedMotion } from '../utils.js';

export function initRotatingHeadline() {
  const el = document.querySelector('.s-hero__rotate[data-words]');
  if (!el) return;

  let words = [];
  try { words = JSON.parse(el.dataset.words); } catch { return; }
  if (!words.length) return;

  el.textContent = words[0];
  if (prefersReducedMotion() || words.length < 2) return;

  let i = 0;
  function next() {
    i = (i + 1) % words.length;
    gsap.to(el, {
      opacity: 0,
      y: -12,
      filter: 'blur(6px)',
      duration: 0.35,
      ease: 'power1.in',
      onComplete: () => {
        el.textContent = words[i];
        gsap.fromTo(el,
          { opacity: 0, y: 12, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }
        );
      },
    });
  }

  let interval = setInterval(next, 2600);
  document.addEventListener('visibilitychange', () => {
    clearInterval(interval);
    if (!document.hidden) interval = setInterval(next, 2600);
  });
}
