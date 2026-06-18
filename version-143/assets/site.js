
(function () {
  const d = document;
  const $$ = (sel, root = d) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = d) => root.querySelector(sel);

  function setMobileMenu() {
    const btn = $('.menu-btn');
    const links = $('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => links.classList.toggle('open'));
  }

  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href === path) a.classList.add('active');
    });
  }

  function initCarousel() {
    const root = $('.hero-main');
    if (!root) return;
    const slides = $$('.hero-slide', root);
    if (slides.length < 2) return;
    let i = 0;
    const activate = (n) => {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
      const dots = $$('.hero-dot');
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === n));
    };
    const next = () => { i = (i + 1) % slides.length; activate(i); };
    let timer = setInterval(next, 5200);
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', () => timer = setInterval(next, 5200));
    $$('.hero-dot').forEach((dot, idx) => dot.addEventListener('click', () => { i = idx; activate(i); }));
    activate(0);
  }

  function readText(el, attr) {
    return (el.getAttribute(attr) || '').toLowerCase();
  }

  function normalize(s) {
    return (s || '').toLowerCase().trim();
  }

  function filterCards(scope) {
    const search = $('.filter-query', scope);
    const type = $('.filter-type', scope);
    const year = $('.filter-year', scope);
    const region = $('.filter-region', scope);
    const sort = $('.filter-sort', scope);
    const cards = $$('.movie-card, .rank-item[data-card="true"]', scope);
    if (!cards.length) return;

    const apply = () => {
      const q = normalize(search && search.value);
      const tv = normalize(type && type.value);
      const yr = normalize(year && year.value);
      const rg = normalize(region && region.value);
      cards.forEach(card => {
        const t = readText(card, 'data-title');
        const y = readText(card, 'data-year');
        const r = readText(card, 'data-region');
        const g = readText(card, 'data-genre');
        const tags = readText(card, 'data-tags');
        const okQ = !q || [t, g, tags, r, y, readText(card, 'data-desc')].join(' ').includes(q);
        const okT = !tv || g.includes(tv) || readText(card, 'data-type').includes(tv);
        const okY = !yr || y === yr;
        const okR = !rg || r.includes(rg);
        card.hidden = !(okQ && okT && okY && okR);
      });
      if (sort) {
        const method = sort.value;
        const holder = cards[0] && cards[0].parentElement;
        if (!holder) return;
        const visible = cards.filter(c => !c.hidden);
        visible.sort((a, b) => {
          const ay = parseInt(a.dataset.year || '0', 10);
          const by = parseInt(b.dataset.year || '0', 10);
          const an = a.dataset.title || '';
          const bn = b.dataset.title || '';
          if (method === 'title') return an.localeCompare(bn, 'zh-Hans-CN');
          if (method === 'year-asc') return ay - by;
          return by - ay;
        });
        visible.forEach(n => holder.appendChild(n));
      }
    };

    [search, type, year, region, sort].forEach(el => el && el.addEventListener('input', apply));
    [search, type, year, region, sort].forEach(el => el && el.addEventListener('change', apply));
    apply();
  }

  function initPlayer() {
    const video = $('#movie-player');
    if (!video) return;
    const buttons = $$('.source-btn');
    const defaults = {
      mp4: video.getAttribute('data-mp4') || '',
      webm: video.getAttribute('data-webm') || '',
      hls: video.getAttribute('data-hls') || ''
    };

    function playSource(kind) {
      buttons.forEach(b => b.classList.toggle('active', b.dataset.src === kind));
      const src = defaults[kind] || defaults.mp4 || defaults.webm;
      video.pause();
      video.removeAttribute('src');
      while (video.firstChild) video.removeChild(video.firstChild);
      if (kind === 'hls' && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        const fallback = kind === 'webm' ? (defaults.webm || defaults.mp4) : (defaults.mp4 || defaults.webm || src);
        const source = d.createElement('source');
        source.src = kind === 'hls' ? fallback : src;
        source.type = kind === 'webm' ? 'video/webm' : 'video/mp4';
        video.appendChild(source);
      }
      video.load();
      video.play().catch(() => {});
    }

    buttons.forEach(btn => btn.addEventListener('click', () => playSource(btn.dataset.src)));
    playSource(buttons.find(b => b.classList.contains('active'))?.dataset.src || 'mp4');
  }

  function setupBackToTop() {
    const btn = $('.back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  setMobileMenu();
  setActiveNav();
  initCarousel();
  filterCards(d);
  initPlayer();
  setupBackToTop();
})();
