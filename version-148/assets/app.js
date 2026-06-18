(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 6000);
  });

  document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.querySelector(button.getAttribute('data-scroll-target'));
      var direction = button.getAttribute('data-direction') === 'left' ? -1 : 1;
      if (target) {
        target.scrollBy({ left: direction * 430, behavior: 'smooth' });
      }
    });
  });

  var searchInput = document.querySelector('[data-search]');
  var filterSelect = document.querySelector('[data-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var noResult = document.querySelector('[data-no-result]');

  function applySearch() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = filterSelect ? filterSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search-text') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchCategory = !category || cardCategory === category;
      var match = matchKeyword && matchCategory;
      card.classList.toggle('hidden-card', !match);
      if (match) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applySearch);
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;

    function prepare() {
      if (!video || !source || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', '1');
    }

    function play() {
      if (!video) {
        return;
      }
      prepare();
      box.classList.add('is-active');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance && hlsInstance.stopLoad) {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
