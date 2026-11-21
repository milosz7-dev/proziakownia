/* Proziakownia — interactions (simple, readable, native scroll) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  $('.js-year').textContent = new Date().getFullYear();
  document.documentElement.style.scrollBehavior = reduce ? 'auto' : 'smooth';
  document.documentElement.style.scrollPaddingTop = '80px';

  initUI();
  if (!hasGsap || reduce) return;

  gsap.registerPlugin(ScrollTrigger);

  /* split headings into letters (for a short, one-time reveal) */
  function splitChars(el) {
    const parts = el.textContent.split(/([ \t\n\r]+)/);
    el.textContent = '';
    parts.forEach(w => {
      if (!w) return;
      if (/^[ \t\n\r]+$/.test(w)) { el.appendChild(document.createTextNode(' ')); return; }
      const wrap = document.createElement('span');
      wrap.className = 'word-wrap';
      [...w].forEach(ch => { const c = document.createElement('span'); c.className = 'char'; c.textContent = ch; wrap.appendChild(c); });
      el.appendChild(wrap);
    });
    return $$('.char', el);
  }
  const heroChars = $$('.hero__title .split').flatMap(splitChars);
  $$('.section-title .split, .visit__title .split').forEach(splitChars);

  /* hero entrance — quick, under 1.5 s */
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero .eyebrow', { y: 16, autoAlpha: 0, duration: .7 }, 0.1)
    .from(heroChars, { yPercent: 110, duration: 1, stagger: .02 }, 0.15)
    .from('.hero__arch-inner', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 18px 18px)', duration: 1.2, ease: 'expo.inOut' }, 0.1)
    .from('.hero__arch-inner img', { scale: 1.25, duration: 1.4 }, 0.3)
    .from('.hero .reveal-up', { y: 24, autoAlpha: 0, duration: .8, stagger: .1 }, 0.5)
    .from('.hero__badge', { scale: 0, rotate: -90, duration: .9, ease: 'back.out(1.8)' }, 0.8)
    .from('.quick__item', { y: 20, autoAlpha: 0, duration: .7, stagger: .07 }, 0.7);

  /* gentle hero parallax */
  gsap.to('.hero__arch-inner img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* section titles + generic reveals */
  $$('.section-title, .visit__title').forEach(t => {
    gsap.from($$('.char', t), { yPercent: 110, duration: .9, ease: 'expo.out', stagger: .015, scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
  });
  $$('.reveal-up, .reveal-words').filter(el => !el.closest('.hero')).forEach(el => {
    gsap.from(el, { y: 30, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  /* marquee */
  $$('.marquee__track').forEach(track => {
    const row = $('.marquee__row', track);
    for (let k = 0; k < 3; k++) track.appendChild(row.cloneNode(true));
    gsap.fromTo(track, { x: 0 }, { x: -row.offsetWidth, duration: 40, ease: 'none', repeat: -1 });
  });

  /* menu cards */
  gsap.from('.dish', { y: 40, autoAlpha: 0, duration: .8, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.menu__grid', start: 'top 85%', once: true } });

  /* proziak bakes on the griddle */
  const spots = $$('.bread-spots ellipse');
  gsap.set(spots, { opacity: 0, scale: .2, transformOrigin: 'center' });
  gsap.timeline({ scrollTrigger: { trigger: '.proziak__visual', start: 'top 80%', once: true } })
    .fromTo('.js-bread', { scale: .6, rotate: -40 }, { scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.4)' })
    .to(spots, { opacity: (i, el) => el.getAttribute('opacity') || .7, scale: 1, duration: .4, stagger: .07 }, .5);

  /* story */
  gsap.from('.story__img', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: .2, scrollTrigger: { trigger: '.story__images', start: 'top 80%', once: true } });
  const tlEl = $('.timeline');
  ScrollTrigger.create({ trigger: tlEl, start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: s => tlEl.style.setProperty('--tl', (s.progress * 100).toFixed(1) + '%') });
  $$('.timeline__item').forEach(item => ScrollTrigger.create({ trigger: item, start: 'top 80%', onEnter: () => item.classList.add('is-on'), onLeaveBack: () => item.classList.remove('is-on') }));

  /* numbers */
  $$('.js-num').forEach(el => {
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = dec ? o.v.toFixed(dec).replace('.', ',') : Math.round(o.v); } });
  });

  /* gallery */
  gsap.from('.g', { y: 40, autoAlpha: 0, duration: .9, stagger: .05, ease: 'power3.out', scrollTrigger: { trigger: '.gallery__grid', start: 'top 85%', once: true } });

  /* footer word */
  gsap.from('.footer__word span', { yPercent: 60, autoAlpha: 0, duration: 1, stagger: .04, ease: 'expo.out', scrollTrigger: { trigger: '.footer__word', start: 'top 98%', once: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ========================================================= */
  function initUI() {
    const nav = $('.nav'), credit = $('.credit');
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 20);
      const max = document.documentElement.scrollHeight - innerHeight;
      credit.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* highlight current section in the nav */
    $$('main section[id]').forEach(sec => {
      const link = $(`.nav__links a[href="#${sec.id}"]`);
      if (!link) return;
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { $$('.nav__links a').forEach(l => l.classList.remove('is-active')); link.classList.add('is-active'); }
      }, { rootMargin: '-40% 0px -55% 0px' }).observe(sec);
    });

    /* mobile menu */
    const burger = $('.nav__burger'), mob = $('.mobile-menu');
    const setMenu = open => {
      burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      mob.classList.toggle('is-open', open); mob.setAttribute('aria-hidden', !open); nav.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', mob).forEach(a => a.addEventListener('click', () => setMenu(false)));

    /* size toggle */
    const tog = $('.sizes__toggle'), pill = $('.sizes__pill'), griddle = $('.griddle');
    const hints = { '15': 'Na szybki obiad w biegu po Rynku.', '20': 'Dla porządnie głodnych — albo na pół z kimś.' };
    const placePill = btn => { pill.style.width = btn.offsetWidth + 'px'; pill.style.transform = `translateX(${btn.offsetLeft - 5}px)`; };
    $$('button', tog).forEach(b => b.addEventListener('click', () => {
      $$('button', tog).forEach(x => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b); });
      placePill(b);
      griddle.classList.toggle('is-large', b.dataset.size === '20');
      $('.js-size-num').textContent = b.dataset.size;
      $('.js-size-hint').textContent = hints[b.dataset.size];
    }));
    requestAnimationFrame(() => placePill($('button.is-active', tog)));
    window.addEventListener('resize', () => placePill($('button.is-active', tog)));

    /* lightbox */
    const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('.lightbox__cap', lb);
    $$('.g').forEach(g => {
      g.tabIndex = 0; g.setAttribute('role', 'button');
      const open = () => { const img = $('img', g); lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); $('.lightbox__close').focus(); };
      g.addEventListener('click', open);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); };
    lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb(); setMenu(false); } });
  }
})();
