/* =========================================================================
   ACM UEMJ — Global Script
   Vanilla JS. Shared across index.html, event.html, team.html.
   Every module guards on the elements it needs, so pages missing a
   particular section simply skip that module.
   ========================================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  /* ---------------------------------------------------------------------
     Preloader — mandala assembles (concentric rings + radiating circuit
     spokes draw themselves), a percentage counts up, then the whole mark
     morphs out into the hero. Spokes are built here so the markup stays
     a single reusable SVG skeleton across all three pages.
     --------------------------------------------------------------------- */
  function initPreloader() {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const percentEl = document.getElementById('preloaderPercent');
    const spokesGroup = document.getElementById('mandalaSpokes');
    const SVG_NS = 'http://www.w3.org/2000/svg';

    if (spokesGroup && !reduceMotion) {
      const SPOKE_COUNT = 12;
      for (let i = 0; i < SPOKE_COUNT; i++) {
        const angle = (360 / SPOKE_COUNT) * i;
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', '100'); line.setAttribute('y1', '28');
        line.setAttribute('x2', '100'); line.setAttribute('y2', '44');
        line.setAttribute('class', 'mandala-spoke');
        line.setAttribute('transform', `rotate(${angle} 100 100)`);
        line.style.animationDelay = (300 + i * 55) + 'ms';
        spokesGroup.appendChild(line);
      }
    }

    const MIN_DURATION = reduceMotion ? 250 : 1900;
    const startTime = performance.now();

    if (percentEl) {
      (function countUp(now) {
        const p = Math.min(1, ((now || performance.now()) - startTime) / MIN_DURATION);
        const eased = 1 - Math.pow(1 - p, 2);
        percentEl.textContent = String(Math.round(eased * 100)).padStart(2, '0') + '%';
        if (p < 1) requestAnimationFrame(countUp);
      })();
    }

    let scheduled = false;
    const done = () => {
      if (pre.classList.contains('hidden')) return;
      pre.classList.add('exit');
      setTimeout(() => {
        pre.classList.add('hidden');
        document.body.style.overflow = '';
        setTimeout(() => pre.remove(), 700);
      }, reduceMotion ? 0 : 480);
    };
    const finish = () => {
      if (scheduled) return;
      scheduled = true;
      const elapsed = performance.now() - startTime;
      setTimeout(done, Math.max(0, MIN_DURATION - elapsed));
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('load', finish);
    setTimeout(finish, 4000); // safety fallback if load never fires
  }

  /* ---------------------------------------------------------------------
     Background particle field (canvas-free, DOM based, lightweight)
     --------------------------------------------------------------------- */
  function initParticles() {
    const field = document.getElementById('particleField');
    if (!field || reduceMotion) return;
    let count;
    function build() {
      field.innerHTML = '';
      const vw = window.innerWidth;
      count = Math.min(50, Math.round(vw / 26));
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 1 + Math.random() * 2.4;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        const colors = ['#00d4ff', '#5b7fff', '#9b5cff', '#ff4fa3', '#d9a441'];
        p.style.color = colors[i % colors.length];
        p.style.opacity = (0.15 + Math.random() * 0.5).toFixed(2);
        const tx = (Math.random() - 0.5) * 220;
        const ty = (Math.random() - 0.5) * 220;
        const dur = 10000 + Math.random() * 14000;
        p.animate(
          [
            { transform: 'translate(0,0)', opacity: p.style.opacity },
            { transform: `translate(${tx}px, ${ty}px)`, opacity: 0.05 },
            { transform: 'translate(0,0)', opacity: p.style.opacity }
          ],
          { duration: dur, iterations: Infinity, delay: -Math.random() * dur, easing: 'ease-in-out' }
        );
        field.appendChild(p);
      }
    }
    build();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 300); }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Cursor glow (desktop pointer only)
     --------------------------------------------------------------------- */
  function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || reduceMotion || matchMedia('(pointer: coarse)').matches) {
      if (glow) glow.style.display = 'none';
      return;
    }
    let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
    (function loop() {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------------------------------------------------------------
     Nav: scroll state, mobile toggle, scroll-spy active link, smooth scroll
     --------------------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById('siteNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 20);
      const menuOpen = links && links.classList.contains('active');
      if (!menuOpen) {
        // hide the nav on scroll-down past the fold, bring it back on any scroll-up
        if (y > lastY && y > 160) nav.classList.add('nav-hidden');
        else nav.classList.remove('nav-hidden');
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const active = toggle.classList.toggle('active');
        links.classList.toggle('active', active);
        toggle.setAttribute('aria-expanded', String(active));
        document.body.style.overflow = active ? 'hidden' : '';
      });
      links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }));
    }

    // scroll-spy for in-page sections (home page)
    const sections = [...document.querySelectorAll('main section[id]')];
    const navAnchors = [...document.querySelectorAll('.nav-links a[href*="#"]')];
    if (sections.length && navAnchors.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navAnchors.forEach((a) => {
              const hash = a.getAttribute('href').split('#')[1];
              a.classList.toggle('active', hash === id);
            });
          });
        },
        { rootMargin: '-45% 0px -50% 0px' }
      );
      sections.forEach((s) => spy.observe(s));
    }
  }

  /* ---------------------------------------------------------------------
     Scroll progress bar
     --------------------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
     --------------------------------------------------------------------- */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
    if (!targets.length) return;
    if (reduceMotion) { targets.forEach((t) => t.classList.add('in')); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* ---------------------------------------------------------------------
     Animated counters
     --------------------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io.observe(c));
  }

  /* ---------------------------------------------------------------------
     Hero typing effect
     --------------------------------------------------------------------- */
  function initTyping() {
    const el = document.getElementById('typeTarget');
    if (!el) return;
    const words = JSON.parse(el.dataset.words || '[]');
    if (!words.length) return;
    if (reduceMotion) { el.textContent = words[0]; return; }
    let wi = 0, ci = 0, deleting = false;
    function tick() {
      const word = words[wi];
      if (!deleting) {
        ci++;
        el.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, 1600); return; }
      } else {
        ci--;
        el.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      }
      setTimeout(tick, deleting ? 45 : 85);
    }
    tick();
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons + ripple
     --------------------------------------------------------------------- */
  function initMagnetic() {
    const els = document.querySelectorAll('.magnetic');
    if (!reduceMotion && !matchMedia('(pointer: coarse)').matches) {
      els.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const mx = e.clientX - r.left - r.width / 2;
          const my = e.clientY - r.top - r.height / 2;
          el.style.transform = `translate(${mx * 0.22}px, ${my * 0.35}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      });
    }

    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const r = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(r.width, r.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - r.left - size / 2 + 'px';
        ripple.style.top = e.clientY - r.top - size / 2 + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Card tilt effect
     --------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion || matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 9}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------------
     Hero mouse parallax on floating shapes
     --------------------------------------------------------------------- */
  function initParallaxHero() {
    const hero = document.querySelector('.hero');
    const shapes = document.querySelectorAll('.hero-shape');
    if (!hero || !shapes.length || reduceMotion) return;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      shapes.forEach((s, i) => {
        const depth = (i + 1) * 14;
        s.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      if (!q || !a) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item.open').forEach((other) => {
          if (other !== item) { other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
        });
        item.classList.toggle('open', !isOpen);
        a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
      });
    });
  }

  /* ---------------------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------------------- */
  function initLightbox() {
    const items = document.querySelectorAll('[data-lightbox]');
    const box = document.getElementById('lightbox');
    if (!items.length || !box) return;
    const img = box.querySelector('img');
    const closeBtn = box.querySelector('.lightbox-close');
    const prevBtn = box.querySelector('.lightbox-nav.prev');
    const nextBtn = box.querySelector('.lightbox-nav.next');
    const srcs = [...items].map((i) => i.dataset.lightbox);
    let idx = 0;

    function show(i) {
      idx = (i + srcs.length) % srcs.length;
      img.src = srcs[idx];
      box.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function hide() {
      box.classList.remove('active');
      document.body.style.overflow = '';
    }
    items.forEach((item, i) => item.addEventListener('click', () => show(i)));
    closeBtn && closeBtn.addEventListener('click', hide);
    prevBtn && prevBtn.addEventListener('click', () => show(idx - 1));
    nextBtn && nextBtn.addEventListener('click', () => show(idx + 1));
    box.addEventListener('click', (e) => { if (e.target === box) hide(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('active')) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------------------------------------------------------------------
     Back to top
     --------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 700), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------------------------------------------------------------
     Contact form validation
     --------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const status = document.getElementById('formStatus');

    const validators = {
      name: (v) => v.trim().length >= 2 || 'Enter your full name',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
      subject: (v) => v.trim().length >= 3 || 'Subject is required',
      message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters'
    };

    function validateField(field) {
      const name = field.name;
      const validator = validators[name];
      if (!validator) return true;
      const result = validator(field.value);
      const wrap = field.closest('.field');
      const errEl = wrap.querySelector('.err');
      if (result === true) {
        wrap.classList.remove('invalid');
        if (errEl) errEl.textContent = '';
        return true;
      } else {
        wrap.classList.add('invalid');
        if (errEl) errEl.textContent = result;
        return false;
      }
    }

    form.querySelectorAll('input, textarea').forEach((f) => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => { if (f.closest('.field').classList.contains('invalid')) validateField(f); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input, textarea').forEach((f) => { if (!validateField(f)) valid = false; });
      if (!valid) return;
      status.textContent = 'Message sent! We\'ll get back to you within 2 business days.';
      status.classList.add('show', 'ok');
      form.reset();
      setTimeout(() => status.classList.remove('show', 'ok'), 6000);
    });
  }

  /* ---------------------------------------------------------------------
     Newsletter form (footer)
     --------------------------------------------------------------------- */
  function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      input.value = '';
      setTimeout(() => { btn.textContent = original; }, 2400);
    });
  }

  /* ---------------------------------------------------------------------
     Events page: filter bar + search
     --------------------------------------------------------------------- */
  function initEventFilters() {
    const bar = document.getElementById('eventFilters');
    const search = document.getElementById('eventSearch');
    const items = document.querySelectorAll('.tl-item');
    const noResults = document.getElementById('noResults');
    if (!items.length) return;

    function apply() {
      const activeBtn = bar ? bar.querySelector('.filter-btn.active') : null;
      const cat = activeBtn ? activeBtn.dataset.filter : 'all';
      const q = search ? search.value.trim().toLowerCase() : '';
      let visible = 0;
      items.forEach((item) => {
        const cats = (item.dataset.category || '').split(' ');
        const text = item.textContent.toLowerCase();
        const matchCat = cat === 'all' || cats.includes(cat);
        const matchSearch = !q || text.includes(q);
        const show = matchCat && matchSearch;
        item.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noResults) noResults.classList.toggle('show', visible === 0);
    }

    if (bar) {
      bar.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          apply();
        });
      });
    }
    if (search) search.addEventListener('input', apply);
    apply();
  }

  /* ---------------------------------------------------------------------
     Team page: search/filter + member modal
     --------------------------------------------------------------------- */
  function initTeamPage() {
    const bar = document.getElementById('teamFilters');
    const search = document.getElementById('teamSearch');
    const cards = document.querySelectorAll('.team-card');
    const noResults = document.getElementById('noResults');
    if (!cards.length) return;

    function apply() {
      const activeBtn = bar ? bar.querySelector('.filter-btn.active') : null;
      const group = activeBtn ? activeBtn.dataset.filter : 'all';
      const q = search ? search.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach((card) => {
        const matchGroup = group === 'all' || card.dataset.group === group;
        const matchSearch = !q || card.textContent.toLowerCase().includes(q);
        const show = matchGroup && matchSearch;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noResults) noResults.classList.toggle('show', visible === 0);
    }

    if (bar) {
      bar.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          apply();
        });
      });
    }
    if (search) search.addEventListener('input', apply);
    apply();

    // Member modal
    const modal = document.getElementById('memberModal');
    if (!modal) return;
    const mAvatar = modal.querySelector('.member-modal-avatar img');
    const mName = modal.querySelector('.member-modal-name');
    const mRole = modal.querySelector('.member-modal-role');
    const mDept = modal.querySelector('.member-modal-dept');
    const mId = modal.querySelector('.member-modal-id');
    const mLink = modal.querySelector('.member-modal-link');
    const mClose = modal.querySelector('.member-modal-close');

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        mAvatar.src = card.querySelector('img').src;
        mName.textContent = card.dataset.name || '';
        mRole.textContent = card.dataset.role || '';
        mDept.textContent = card.dataset.dept || '';
        mId.textContent = card.dataset.id || '';
        mLink.href = card.dataset.linkedin || '#';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
    function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; }
    mClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  onReady(() => {
    initPreloader();
    initParticles();
    initCursorGlow();
    initNav();
    initScrollProgress();
    initReveal();
    initCounters();
    initTyping();
    initMagnetic();
    initTilt();
    initParallaxHero();
    initFAQ();
    initLightbox();
    initBackToTop();
    initContactForm();
    initNewsletter();
    initEventFilters();
    initTeamPage();
  });
})();
