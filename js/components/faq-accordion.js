import { prefersReducedMotion } from '../utils.js';

export function initFaqAccordion() {
  const triggers = document.querySelectorAll('.c-accordion__trigger');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      const nextOpen = !isOpen;

      trigger.setAttribute('aria-expanded', String(nextOpen));

      if (!panel) return;

      if (prefersReducedMotion()) {
        panel.style.height = nextOpen ? 'auto' : '0';
        return;
      }

      if (nextOpen) {
        const height = panel.scrollHeight;
        gsap.fromTo(panel, { height: 0 }, {
          height,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => { panel.style.height = 'auto'; },
        });
      } else {
        gsap.fromTo(panel, { height: panel.scrollHeight }, {
          height: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    });
  });
}
