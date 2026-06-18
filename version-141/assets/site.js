
(function () {
  const state = {
    heroIndex: 0,
    heroTimer: null,
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initMobileMenu() {
    const btn = qs('[data-menu-toggle]');
    const panel = qs('[data-mobile-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => panel.classList.toggle('open'));
  }

  function initHeroSlider() {
    const slides = qsa('[data-slide]');
    const dots = qsa('[data-hero-dot]');
    if (!slides.length) return;

    function activate(i) {
      state.heroIndex = i;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === i));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === i));
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => activate(Number(dot.dataset.heroDot)));
    });

    activate(0);
    if (slides.length > 1) {
      state.heroTimer = window.setInterval(() => {
        activate((state.heroIndex + 1) % slides.length);
      }, 5000);
    }
  }

  function movieCardHtml(movie, compact = false) {
    const poster = coverSvg(movie, compact ? '320x480' : '480x680');
    const year = movie.YEAR || '未知';
    const genre = movie.GENRE || '精选';
    const snippet = movie.ONE_LINE || movie.SUMMARY || '';
    return `
      <a class="${compact ? 'movie-list-card' : 'movie-card'}" href="movie-${movie.id}.html">
        <div class="poster-wrap">
          <img src="${poster}" alt="${escapeHtml(movie.TITLE)}" loading="lazy" />
          <div class="poster-glow"></div>
          <span class="poster-tag">${escapeHtml(movie.TYPE || '影片')}</span>
        </div>
        <div class="content card-body">
          <div class="card-meta">
            <span>${escapeHtml(movie.REGION || '')}</span>
            <span>${escapeHtml(year)}</span>
          </div>
          <h3>${escapeHtml(movie.TITLE)}</h3>
          <p class="card-genre">${escapeHtml(genre)}</p>
          <p class="card-snippet">${escapeHtml(snippet).slice(0, 88)}${snippet.length > 88 ? '…' : ''}</p>
        </div>
      </a>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function coverSvg(movie, size = '480x680') {
    const palettes = [
      ['#ef4444', '#0f172a', '#f8fafc'],
      ['#7c3aed', '#111827', '#f8fafc'],
      ['#06b6d4', '#0f172a', '#ecfeff'],
      ['#f59e0b', '#111827', '#fffbeb'],
      ['#10b981', '#052e16', '#ecfdf5'],
      ['#ec4899', '#111827', '#fdf2f8'],
      ['#3b82f6', '#0f172a', '#eff6ff'],
      ['#22c55e', '#111827', '#f0fdf4'],
    ];
    const [c1, c2, fg] = palettes[Number(movie.id) % palettes.length];
    const [w, h] = size.split('x').map(Number);
    const title = String(movie.TITLE || '影片');
    const year = movie.YEAR || '未知年份';
    const meta = `${movie.REGION || '未知'} · ${movie.TYPE || '影片'}`;
    const genre = movie.GENRE || '精选';
    const lines = wrapText(title, 9).slice(0, 2);
    let titleSvg = '';
    lines.forEach((line, idx) => {
      titleSvg += `<text x="64" y="${230 + idx * 44}" fill="${fg}" font-size="34" font-weight="700" font-family="Noto Sans SC, Microsoft YaHei, sans-serif">${escapeSvg(line)}</text>`;
    });
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c1}" />
            <stop offset="100%" stop-color="${c2}" />
          </linearGradient>
          <radialGradient id="r" cx="30%" cy="20%" r="80%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
        <circle cx="${w * 0.82}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.24}" fill="url(#r)" />
        <circle cx="${w * 0.18}" cy="${h * 0.82}" r="${Math.min(w, h) * 0.18}" fill="#ffffff" opacity="0.06" />
        <rect x="40" y="40" width="${w - 80}" height="${h - 80}" rx="36" fill="none" stroke="#ffffff" stroke-opacity="0.2" />
        <text x="64" y="110" fill="${fg}" font-size="30" font-weight="600" opacity="0.86" font-family="Noto Sans SC, Microsoft YaHei, sans-serif">${escapeSvg(movie.id)}</text>
        ${titleSvg}
        <text x="64" y="${230 + lines.length * 44 + 18}" fill="${fg}" font-size="24" font-weight="500" opacity="0.85" font-family="Noto Sans SC, Microsoft YaHei, sans-serif">${escapeSvg(meta)}</text>
        <text x="64" y="${230 + lines.length * 44 + 54}" fill="${fg}" font-size="22" font-weight="400" opacity="0.72" font-family="Noto Sans SC, Microsoft YaHei, sans-serif">${escapeSvg(year)} · ${escapeSvg(genre)}</text>
        <rect x="64" y="${h - 110}" width="${w - 128}" height="26" rx="13" fill="#000" opacity="0.18" />
        <text x="${w / 2}" y="${h - 91}" text-anchor="middle" fill="${fg}" font-size="18" font-weight="500" opacity="0.8" font-family="Noto Sans SC, Microsoft YaHei, sans-serif">静态网站示意封面</text>
      </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function escapeSvg(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function wrapText(text, maxChars) {
    const s = String(text).trim();
    if (s.length <= maxChars) return [s];
    const out = [];
    let rest = s;
    while (rest && out.length < 2) {
      out.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars);
    }
    if (rest && out.length) out[out.length - 1] = out[out.length - 1].slice(0, Math.max(1, maxChars - 1)) + '…';
    return out;
  }

  function initSearchPage() {
    const root = qs('[data-search-root]');
    if (!root || !window.MOVIES) return;

    const results = qs('[data-search-results]', root);
    const queryInput = qs('[data-query-input]', root);
    const regionSelect = qs('[data-region-select]', root);
    const typeSelect = qs('[data-type-select]', root);
    const yearSelect = qs('[data-year-select]', root);
    const countLabel = qs('[data-count-label]', root);
    const url = new URL(window.location.href);
    queryInput.value = url.searchParams.get('q') || '';

    const typeOptions = ['全部', ...new Set(window.MOVIES.map(m => m.TYPE || '未知'))].slice(0, 12);
    if (typeSelect && !typeSelect.options.length) {
      typeOptions.forEach(t => {
        const op = document.createElement('option');
        op.value = t;
        op.textContent = t;
        typeSelect.appendChild(op);
      });
    }

    function uniqueSorted(values) {
      return Array.from(new Set(values)).filter(Boolean).sort();
    }
    if (regionSelect && !regionSelect.options.length) {
      uniqueSorted(window.MOVIES.map(m => m.REGION)).forEach(v => {
        const op = document.createElement('option');
        op.value = v;
        op.textContent = v;
        regionSelect.appendChild(op);
      });
    }
    if (yearSelect && !yearSelect.options.length) {
      uniqueSorted(window.MOVIES.map(m => m.YEAR)).reverse().forEach(v => {
        const op = document.createElement('option');
        op.value = v;
        op.textContent = v || '未知';
        yearSelect.appendChild(op);
      });
    }

    function matches(movie, q, region, type, year) {
      const hay = [movie.TITLE, movie.REGION, movie.TYPE, movie.YEAR, movie.GENRE, movie.TAGS.join(' '), movie.ONE_LINE, movie.SUMMARY, movie.REVIEW].join(' ').toLowerCase();
      const kw = q.toLowerCase().trim();
      const qOk = !kw || hay.includes(kw);
      const regionOk = !region || region === '全部' || movie.REGION === region;
      const typeOk = !type || type === '全部' || movie.TYPE === type;
      const yearOk = !year || year === '全部' || movie.YEAR === year;
      return qOk && regionOk && typeOk && yearOk;
    }

    function render() {
      const q = queryInput?.value || '';
      const region = regionSelect?.value || '';
      const type = typeSelect?.value || '';
      const year = yearSelect?.value || '';
      const filtered = window.MOVIES.filter(m => matches(m, q, region, type, year));
      if (countLabel) countLabel.textContent = `共 ${filtered.length} 条结果`;
      if (!filtered.length) {
        results.innerHTML = '<div class="empty-state">没有找到符合条件的影片，试试更换关键词或筛选条件。</div>';
        return;
      }
      results.innerHTML = filtered.slice(0, 240).map(m => movieCardHtml(m, true)).join('');
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(el => el && el.addEventListener('input', render));
    const form = qs('form', root);
    if (form) form.addEventListener('submit', e => { e.preventDefault(); render(); });
    render();
  }

  function initPlayer() {
    const video = qs('[data-player-video]');
    if (!video || !window.SITE_MOVIE) return;
    const mp4 = video.dataset.mp4;
    const hls = video.dataset.hls;
    const poster = video.dataset.poster;
    if (poster) video.poster = poster;

    function fallBackToMp4() {
      video.src = mp4;
    }

    const loadHls = window.Hls
      ? Promise.resolve(window.Hls)
      : import('./video-vendor-dru42stk.js').then(mod => mod.H).catch(() => null);

    loadHls.then(HlsCtor => {
      if (HlsCtor && typeof HlsCtor.isSupported === 'function' && HlsCtor.isSupported()) {
        const hlsPlayer = new HlsCtor({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });
        hlsPlayer.loadSource(hls);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(HlsCtor.Events.ERROR, function (_event, data) {
          console.warn('HLS error', data);
          if (data && data.fatal) {
            hlsPlayer.destroy();
            fallBackToMp4();
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hls;
        return;
      }

      fallBackToMp4();
    }).catch(() => {
      fallBackToMp4();
    });
  }

  function initCategoryFilters() {
    const root = qs('[data-category-root]');
    if (!root) return;
    const input = qs('[data-filter-input]', root);
    const region = qs('[data-filter-region]', root);
    const year = qs('[data-filter-year]', root);
    const cards = qsa('[data-filter-item]', root);
    const count = qs('[data-filter-count]', root);

    function apply() {
      const q = (input?.value || '').trim().toLowerCase();
      const regionVal = region?.value || '全部';
      const yearVal = year?.value || '全部';
      let visible = 0;
      cards.forEach(card => {
        const meta = (card.dataset.meta || '').toLowerCase();
        const ok = (!q || meta.includes(q)) && (regionVal === '全部' || card.dataset.region === regionVal) && (yearVal === '全部' || card.dataset.year === yearVal);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (count) count.textContent = `展示 ${visible} 条`;
    }

    [input, region, year].forEach(el => el && el.addEventListener('input', apply));
    apply();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeroSlider();
    initSearchPage();
    initCategoryFilters();
    initPlayer();
  });
})();
