import { prefersReducedMotion } from './utils.js';
import { runLoader } from './loader.js';
import { initCursor } from './cursor.js';
import {
  initLenis,
  initScrollProgressArc,
  initNavScrollState,
  initSectionReveals,
  initDrawReveals,
  initAboutParallax,
} from './scroll.js';
import {
  initHeroConstellation,
  initMagneticButtons,
  initCardTilt,
  initStatsCountUp,
} from './animations.js';
import { initRotatingHeadline } from './components/rotating-headline.js';
import { initFaqAccordion } from './components/faq-accordion.js';
import { initSponsorMarquee } from './components/sponsor-marquee.js';
import { initGalleryGenerative } from './components/gallery-generative.js';

function registerGsapPlugins() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}

function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const wrap = document.querySelector('.c-nav__links-wrap');
  if (!toggle || !wrap) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    wrap.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  });

  wrap.querySelectorAll('.c-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

function initSkipLink() {
  const link = document.querySelector('.l-skip-link');
  const main = document.getElementById('main-content');
  if (!link || !main) return;
  link.addEventListener('click', () => main.focus());
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => btn.classList.toggle('is-visible', self.scroll() > 800),
  });

  btn.addEventListener('click', () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const status = document.getElementById('newsletterStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Thanks — you’re on the list.';
    form.reset();
  });
}

async function heroEntrance() {
  const headline = document.querySelector('[data-split-headline]');
  const badge = document.querySelector('.s-hero__content .c-badge');
  const sub = document.querySelector('.s-hero__sub');
  const actions = document.querySelector('.s-hero__actions');
  const constellation = document.querySelector('.s-hero__constellation');
  const nav = document.getElementById('nav');

  if (prefersReducedMotion()) return;

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  } catch { /* proceed regardless */ }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (nav) tl.from(nav, { y: -24, opacity: 0, duration: 0.5 }, 0);

  if (headline && typeof SplitType !== 'undefined') {
    const split = new SplitType(headline, { types: 'words' });
    tl.from(split.words, { opacity: 0, y: 28, stagger: 0.04, duration: 0.7 }, 0.1);
  } else if (headline) {
    tl.from(headline, { opacity: 0, y: 28, duration: 0.7 }, 0.1);
  }

  if (badge) tl.from(badge, { opacity: 0, y: 12, duration: 0.5 }, 0.05);
  if (sub) tl.from(sub, { opacity: 0, y: 16, duration: 0.6 }, 0.3);
  if (actions) tl.from(actions.children, { opacity: 0, y: 16, stagger: 0.08, duration: 0.5 }, 0.4);
  if (constellation) tl.from(constellation, { opacity: 0, scale: 0.94, duration: 0.9 }, 0.2);
}

function bootAfterLoader() {
  registerGsapPlugins();
  initLenis();
  initCursor();
  initScrollProgressArc();
  initNavScrollState();
  initSectionReveals();
  initDrawReveals();
  initAboutParallax();
  initHeroConstellation();
  initMagneticButtons();
  initCardTilt();
  initStatsCountUp();
  initRotatingHeadline();
  initFaqAccordion();
  initSponsorMarquee();
  initGalleryGenerative();
  initBackToTop();
  heroEntrance();
}

function init() {
  initNavToggle();
  initSkipLink();
  initNewsletterForm();

  document.addEventListener('acm:loaderComplete', bootAfterLoader, { once: true });
  runLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
