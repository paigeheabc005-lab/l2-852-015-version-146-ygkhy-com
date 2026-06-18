const input = document.getElementById('search-input');
const results = document.getElementById('search-results');
const count = document.getElementById('search-count');
function score(item, q) {
  const blob = [item.title, item.region, item.type, (item.genre || []).join(' '), (item.tags || []).join(' '), item.one_line, item.summary].join(' ').toLowerCase();
  if (!q) return 0;
  if (blob.includes(q.toLowerCase())) return 1000 + blob.indexOf(q.toLowerCase());
  let s = 0;
  q.toLowerCase().split(/\s+/).forEach((term) => { if (term && blob.includes(term)) s += 100; });
  return s;
}
function card(item) {
  const tags = (item.tags || []).slice(0, 3).map((t) => `<span>${t}</span>`).join('');
  const genres = (item.genre || []).slice(0, 2).join(' / ');
  return `
    <a class="movie-card" href="${item.url}" title="${item.title}">
      <div class="movie-poster" style="${item.poster}">
        <span class="poster-code">${item.id}</span>
        <span class="poster-title">${item.title}</span>
        <span class="poster-sub">${genres}</span>
      </div>
      <div class="movie-card-body">
        <div class="movie-card-head"><strong>${item.title}</strong><span>${item.year || ''}</span></div>
        <p class="movie-card-line">${item.one_line || item.summary || ''}</p>
        <div class="movie-card-tags">${tags}</div>
      </div>
    </a>`;
}
function render(q) {
  const query = (q || '').trim();
  let list = (window.SEARCH_INDEX || []).slice();
  if (query) {
    list = list
      .map((item) => ({ item, s: score(item, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || b.item.year - a.item.year)
      .map((x) => x.item);
  } else {
    list.sort((a, b) => b.year - a.year);
  }
  count.textContent = query ? `找到 ${list.length} 条结果` : `共 ${list.length} 条影片可检索`;
  results.innerHTML = list.slice(0, 120).map(card).join('') || '<div class="empty-state">没有找到匹配内容</div>';
}
const params = new URLSearchParams(location.search);
const q = params.get('q') || '';
if (input) input.value = q;
render(q);
input?.addEventListener('input', () => render(input.value));
