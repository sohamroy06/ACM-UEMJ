import { prefersReducedMotion } from '../utils.js';

export function initSponsorMarquee() {
  const root = document.getElementById('sponsorMarquee');
  const track = root?.querySelector('.c-marquee__track');
  if (!root || !track) return;

  if (prefersReducedMotion()) {
    root.classList.add('is-static');
    return;
  }

  // Clone once so the loop reads seamlessly, regardless of sponsor count
  const originalWidth = track.scrollWidth;
  track.innerHTML += track.innerHTML;

  const pxPerSecond = 60;
  const duration = originalWidth / pxPerSecond;
  root.style.setProperty('--marquee-duration', `${duration}s`);

  root.addEventListener('mouseenter', () => root.classList.add('is-paused'));
  root.addEventListener('mouseleave', () => root.classList.remove('is-paused'));
  root.addEventListener('focusin', () => root.classList.add('is-paused'));
  root.addEventListener('focusout', () => root.classList.remove('is-paused'));
}
