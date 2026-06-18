(function () {
  function queryAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = mobile.hasAttribute('hidden');
      if (opened) {
        mobile.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        mobile.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initHero() {
    var hero = document.querySelector('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = queryAll('.hero-slide', hero);
    var dots = queryAll('.hero-dot', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function reset(index) {
      window.clearInterval(timer);
      show(index);
      start();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        reset(index);
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var searchInput = document.querySelector('.js-local-search');
    var list = document.querySelector('.js-filter-list');
    if (!list) {
      return;
    }
    var cards = queryAll('.movie-card', list);
    var buttons = queryAll('[data-tag-filter]');
    var currentTag = 'all';

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        var tagPass = currentTag === 'all' || haystack.indexOf(normalize(currentTag)) !== -1;
        var keywordPass = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !(tagPass && keywordPass));
      });
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var keyword = params.get('q');
      if (keyword) {
        searchInput.value = keyword;
      }
      searchInput.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentTag = button.getAttribute('data-tag-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    apply();
  }

  window.initPlayer = function (videoId, streamUrl, playerId) {
    var video = document.getElementById(videoId);
    var player = document.getElementById(playerId);
    if (!video || !player || !streamUrl) {
      return;
    }
    var cover = player.querySelector('.player-cover');
    var connected = false;
    var hlsInstance = null;

    function attachStream() {
      if (connected) {
        return;
      }
      connected = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attachStream();
      player.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.muted = true;
          video.play().catch(function () {});
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!connected) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
