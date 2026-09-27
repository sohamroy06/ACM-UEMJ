import { prefersReducedMotion } from './utils.js';

let lenis = null;

export function initLenis() {
  if (prefersReducedMotion() || typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });
  window.lenis = lenis;

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

export function initScrollProgressArc() {
  const arc = document.getElementById('navProgressArc');
  if (!arc) return;
  const circumference = 2 * Math.PI * 11;

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      arc.style.strokeDashoffset = String(circumference * (1 - self.progress));
    },
  });
}

export function initNavScrollState() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastY = window.scrollY;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = window.scrollY;
      nav.classList.toggle('has-scrolled', y > 8);
      if (y > lastY && y > 160) {
        nav.classList.add('is-hidden');
      } else {
        nav.classList.remove('is-hidden');
      }
      lastY = y;
    },
  });
}

export function initSectionReveals() {
  const targets = gsap.utils.toArray('[data-reveal]:not([data-reveal="draw"])');
  if (!targets.length) return;

  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(targets, { opacity: 0, y: 28 });

  ScrollTrigger.batch(targets, {
    start: 'top 88%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      overwrite: true,
    }),
  });
}

export function initDrawReveals() {
  const targets = gsap.utils.toArray('[data-reveal="draw"]');
  if (!targets.length) return;

  targets.forEach((el) => {
    if (prefersReducedMotion()) {
      el.style.strokeDashoffset = '0';
      return;
    }
    el.style.strokeDasharray = '1';
    el.style.strokeDashoffset = '1';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => gsap.to(el, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }),
      once: true,
    });
  });
}

export function initAboutParallax() {
  if (prefersReducedMotion()) return;
  const panels = gsap.utils.toArray('.s-about__panel[data-depth]');
  if (!panels.length) return;

  panels.forEach((panel) => {
    const depth = parseFloat(panel.dataset.depth) || 0.3;
    gsap.to(panel, {
      y: () => -60 * depth,
      ease: 'none',
      scrollTrigger: {
        trigger: panel,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}
