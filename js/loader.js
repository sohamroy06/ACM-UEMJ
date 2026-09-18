import { prefersReducedMotion } from './utils.js';

const SELECTORS = {
  root: '#loader',
  block: '.c-loader__block',
  engrave: '.c-loader__engrave',
  circuit: '.c-loader__circuit',
  wordmark: '.c-loader__wordmark',
};

function dispatchComplete() {
  document.dispatchEvent(new CustomEvent('acm:loaderComplete'));
}

function hideLoader(root) {
  root.classList.add('is-hidden');
  root.setAttribute('aria-hidden', 'true');
}

function reducedMotionFallback(root) {
  gsap.to(root, {
    opacity: 0,
    duration: 0.4,
    ease: 'power1.out',
    onComplete: () => {
      hideLoader(root);
      dispatchComplete();
    },
  });
}

export function runLoader() {
  const root = document.querySelector(SELECTORS.root);
  if (!root) { dispatchComplete(); return; }

  if (prefersReducedMotion()) {
    reducedMotionFallback(root);
    return;
  }

  const block = root.querySelector(SELECTORS.block);
  const engrave = root.querySelector(SELECTORS.engrave);
  const circuit = root.querySelector(SELECTORS.circuit);
  const wordmark = root.querySelector(SELECTORS.wordmark);

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      hideLoader(root);
      dispatchComplete();
    },
  });

  // 1. Sandstone block scales/fades in
  tl.to(block, { opacity: 1, scale: 1, duration: 0.5 });

  // 2. Yantra motif engraves onto the block
  tl.to(engrave, { opacity: 1, strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, '-=0.1');

  // 3. Crossfade sandstone-stroke arcs -> cyan/indigo circuit version of the same paths
  tl.set(circuit, { strokeDashoffset: 0 });
  tl.to(circuit, { opacity: 1, duration: 0.5 }, '+=0.1');
  tl.to(engrave, { opacity: 0, duration: 0.5 }, '<');
  tl.to(block, { opacity: 0, duration: 0.5 }, '<');

  // 4. Circuit fades out while the wordmark independently stroke-draws in underneath
  tl.to(wordmark, { opacity: 1, strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' }, '+=0.05');
  tl.to(circuit, { opacity: 0, duration: 0.5 }, '<');

  // 5. Cyan glow pulse on the wordmark
  tl.to(wordmark, {
    filter: 'drop-shadow(0 0 18px rgba(69,224,206,.85))',
    duration: 0.3,
    yoyo: true,
    repeat: 1,
  }, '+=0.05');

  // 6. Scale up + blur + fade, revealing the hero
  tl.to(root, {
    scale: 1.04,
    filter: 'blur(14px)',
    opacity: 0,
    duration: 0.6,
    ease: 'power2.in',
  }, '+=0.1');
}
