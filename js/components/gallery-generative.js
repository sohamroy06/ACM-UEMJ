import { hashSeed, mulberry32 } from '../utils.js';

const PALETTE = [
  'rgba(69,224,206,', // cyan
  'rgba(90,95,224,',  // indigo
  'rgba(198,124,78,', // sandstone
  'rgba(233,172,79,', // marigold
];

function drawYantraPlate(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  ctx.clearRect(0, 0, w, h);

  // base wash
  ctx.fillStyle = '#171B24';
  ctx.fillRect(0, 0, w, h);

  const cx = w * (0.3 + rand() * 0.4);
  const cy = h * (0.3 + rand() * 0.4);
  const arcCount = 3 + Math.floor(rand() * 3);

  for (let i = 0; i < arcCount; i++) {
    const r = Math.min(w, h) * (0.15 + i * 0.11 + rand() * 0.03);
    const start = rand() * Math.PI * 2;
    const sweep = Math.PI * (0.4 + rand() * 0.7);
    const color = PALETTE[Math.floor(rand() * PALETTE.length)];
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + sweep);
    ctx.strokeStyle = `${color}${(0.25 + rand() * 0.35).toFixed(2)})`;
    ctx.lineWidth = 1 + rand() * 1.5;
    ctx.stroke();
  }

  // node + circuit lines
  const nodeCount = 5 + Math.floor(rand() * 6);
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ x: rand() * w, y: rand() * h });
  }
  ctx.strokeStyle = 'rgba(244,237,226,.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length - 1; i++) {
    if (rand() > 0.45) continue;
    ctx.beginPath();
    ctx.moveTo(nodes[i].x, nodes[i].y);
    ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
    ctx.stroke();
  }
  nodes.forEach((n) => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE[Math.floor(rand() * PALETTE.length)] + '.7)';
    ctx.fill();
  });

  // tick-mark rule, echoing the sundial motif
  const tickY = h * (0.78 + rand() * 0.12);
  ctx.strokeStyle = 'rgba(244,237,226,.14)';
  ctx.beginPath();
  ctx.moveTo(w * 0.08, tickY);
  ctx.lineTo(w * 0.92, tickY);
  ctx.stroke();
  for (let x = w * 0.08; x < w * 0.92; x += w * 0.09) {
    ctx.beginPath();
    ctx.moveTo(x, tickY - 4);
    ctx.lineTo(x, tickY + 4);
    ctx.stroke();
  }
}

export function initGalleryGenerative() {
  const plates = document.querySelectorAll('.c-plate canvas[data-seed]');
  if (!plates.length) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const canvas = entry.target;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawYantraPlate(ctx, rect.width, rect.height, hashSeed(canvas.dataset.seed));
      observer.unobserve(canvas);
    });
  }, { threshold: 0.15, rootMargin: '80px' });

  plates.forEach((canvas) => io.observe(canvas));
}
