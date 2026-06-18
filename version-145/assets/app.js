document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => body.classList.toggle('nav-open'));
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) body.classList.remove('nav-open');
    });
  }
  document.querySelectorAll('[data-search-form]').forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = (input?.value || document.getElementById('search-input')?.value || '').trim();
      const target = new URL('search.html', window.location.href);
      if (q) target.searchParams.set('q', q);
      window.location.href = target.pathname + target.search;
    });
  });
  document.querySelectorAll('[data-scroll-rail]').forEach((rail) => {
    const root = rail.closest('.hero-rail-wrap');
    const prev = root?.querySelector('[data-rail-prev]');
    const next = root?.querySelector('[data-rail-next]');
    if (prev) prev.addEventListener('click', () => rail.scrollBy({ left: -rail.clientWidth * 0.8, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => rail.scrollBy({ left: rail.clientWidth * 0.8, behavior: 'smooth' }));
  });
});
