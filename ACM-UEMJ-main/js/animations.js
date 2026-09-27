import { prefersReducedMotion, isCoarsePointer, lerp, mulberry32 } from './utils.js';

/* ---------------------------------------------------------------
   Hero constellation — ambient canvas built from the Yantra
   arc + node vocabulary. Paused off-screen, single static frame
   under reduced-motion.
   --------------------------------------------------------------- */
export function initHeroConstellation() {
  const canvas = document.querySelector('.s-hero__constellation');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(42);

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nodes = [];
  const NODE_COUNT = 22;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildNodes() {
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: rand() * w,
        y: rand() * h,
        r: 1.2 + rand() * 2.2,
        speed: 0.15 + rand() * 0.25,
        angle: rand() * Math.PI * 2,
      });
    }
  }

  let pointer = { x: 0.5, y: 0.5 };
  let target = { x: 0.5, y: 0.5 };
  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX / window.innerWidth;
    target.y = e.clientY / window.innerHeight;
  });

  const cyan = 'rgba(69,224,206,';
  const indigo = 'rgba(90,95,224,';
  const sandstone = 'rgba(198,124,78,';

  function drawArcs(t) {
    const cx = w * 0.5, cy = h * 0.55;
    const radii = [0.28, 0.4, 0.52].map((f) => Math.min(w, h) * f);
    radii.forEach((r, i) => {
      ctx.beginPath();
      const start = (t * 0.00006 + i * 0.9) % (Math.PI * 2);
      ctx.arc(cx, cy, r, start, start + Math.PI * (0.55 + i * 0.1));
      ctx.strokeStyle = i === 1 ? `${cyan}.35)` : `${indigo}.22)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function draw(t = 0) {
    ctx.clearRect(0, 0, w, h);
    pointer.x = lerp(pointer.x, target.x, 0.04);
    pointer.y = lerp(pointer.y, target.y, 0.04);
    const offsetX = (pointer.x - 0.5) * 24;
    const offsetY = (pointer.y - 0.5) * 24;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    drawArcs(t);

    nodes.forEach((n) => {
      n.x += Math.cos(n.angle) * n.speed * 0.05;
      n.y += Math.sin(n.angle) * n.speed * 0.05;
      if (n.x < 0 || n.x > w) n.angle = Math.PI - n.angle;
      if (n.y < 0 || n.y > h) n.angle = -n.angle;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < Math.min(w, h) * 0.22) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `${indigo}${(0.18 * (1 - dist / (Math.min(w, h) * 0.22))).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n, i) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = i % 5 === 0 ? `${sandstone}.9)` : `${cyan}.85)`;
      ctx.fill();
    });
    ctx.restore();
  }

  resize();
  buildNodes();

  if (prefersReducedMotion()) {
    draw(0);
    window.addEventListener('resize', () => { resize(); buildNodes(); draw(0); });
    return;
  }

  let running = false;
  function loop(t) {
    if (!running) return;
    draw(t);
    requestAnimationFrame(loop);
  }

  const io = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running) requestAnimationFrame(loop);
  }, { threshold: 0.1 });
  io.observe(canvas);

  window.addEventListener('resize', () => { resize(); buildNodes(); });
}

/* ---------------------------------------------------------------
   Magnetic buttons — primary CTAs only, opt-in via [data-magnetic]
   --------------------------------------------------------------- */
export function initMagneticButtons() {
  if (isCoarsePointer() || prefersReducedMotion()) return;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const setX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const setY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
    const radius = 60;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      setX(Math.max(-radius, Math.min(radius, relX)) * 0.35);
      setY(Math.max(-radius, Math.min(radius, relY)) * 0.35);
    });
    el.addEventListener('mouseleave', () => { setX(0); setY(0); });
  });
}

/* ---------------------------------------------------------------
   Card tilt — Domains rail, opt-in via [data-tilt]
   --------------------------------------------------------------- */
export function initCardTilt() {
  if (isCoarsePointer() || prefersReducedMotion()) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const setRX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power2.out' });
    const setRY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power2.out' });
    el.style.transformPerspective = '600px';

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setRX(py * -8);
      setRY(px * 8);
    });
    el.addEventListener('mouseleave', () => { setRX(0); setRY(0); });
  });
}

/* ---------------------------------------------------------------
   Stats count-up
   --------------------------------------------------------------- */
export function initStatsCountUp() {
  const items = document.querySelectorAll('.c-mono-stat[data-count]');
  if (!items.length) return;

  items.forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion()) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }

    const counter = { value: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(counter.value).toLocaleString() + suffix;
          },
        });
      },
    });
  });
}
