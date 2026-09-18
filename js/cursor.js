import { isCoarsePointer } from './utils.js';

export function initCursor() {
  if (isCoarsePointer()) return;

  const root = document.querySelector('.c-cursor');
  const dot = document.querySelector('.c-cursor__dot');
  const ring = document.querySelector('.c-cursor__ring');
  if (!root || !dot || !ring) return;

  const setDot = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'power1.out' });
  const setDotY = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'power1.out' });
  const setRing = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
  const setRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });

  window.addEventListener('pointermove', (e) => {
    setDot(e.clientX);
    setDotY(e.clientY);
    setRing(e.clientX);
    setRingY(e.clientY);
  });

  document.addEventListener('pointerenter', () => root.style.opacity = '1');
  document.addEventListener('pointerleave', () => root.style.opacity = '0');

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('[data-cursor-hover], a, button, input, .c-card')) {
      root.classList.add('is-hovering');
    }
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-cursor-hover], a, button, input, .c-card')) {
      root.classList.remove('is-hovering');
    }
  });
}
