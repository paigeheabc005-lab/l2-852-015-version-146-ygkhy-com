(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function bindMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function bindHero() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function createResult(item) {
    var link = document.createElement('a');
    link.className = 'search-result';
    link.href = item.url;

    var img = document.createElement('img');
    img.src = item.cover;
    img.alt = item.title;
    img.loading = 'lazy';

    var body = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = item.title;
    var meta = document.createElement('span');
    meta.textContent = item.meta;

    body.appendChild(title);
    body.appendChild(meta);
    link.appendChild(img);
    link.appendChild(body);
    return link;
  }

  function bindGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.search-form'));
    forms.forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var panel = form.querySelector('.search-panel');
      if (!input || !panel) {
        return;
      }

      input.addEventListener('input', function () {
        var query = normalize(input.value);
        panel.innerHTML = '';
        if (!query || typeof SITE_SEARCH_INDEX === 'undefined') {
          panel.hidden = true;
          return;
        }
        var matches = SITE_SEARCH_INDEX.filter(function (item) {
          return item.text.indexOf(query) !== -1;
        }).slice(0, 7);
        matches.forEach(function (item) {
          panel.appendChild(createResult(item));
        });
        panel.hidden = matches.length === 0;
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        if (query) {
          window.location.href = './library.html?search=' + encodeURIComponent(query);
        } else {
          window.location.href = './library.html';
        }
      });
    });

    document.addEventListener('click', function (event) {
      forms.forEach(function (form) {
        if (!form.contains(event.target)) {
          var panel = form.querySelector('.search-panel');
          if (panel) {
            panel.hidden = true;
          }
        }
      });
    });
  }

  function filterGrid(input, grid, empty) {
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function bindLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    var grid = document.querySelector('[data-filter-grid]');
    var empty = document.querySelector('[data-empty-result]');
    if (!input || !grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('search');
    if (initial) {
      input.value = initial;
    }
    input.addEventListener('input', function () {
      filterGrid(input, grid, empty);
    });
    filterGrid(input, grid, empty);
  }

  ready(function () {
    bindMobileMenu();
    bindHero();
    bindGlobalSearch();
    bindLocalFilter();
  });
})();
