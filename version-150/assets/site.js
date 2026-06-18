(function() {
  var header = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.body.classList.toggle('menu-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterBars = document.querySelectorAll('.filter-bar');
  filterBars.forEach(function(bar) {
    var grid = document.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    bar.addEventListener('click', function(event) {
      var button = event.target.closest('.filter-button');
      if (!button) {
        return;
      }
      var value = button.getAttribute('data-filter');
      bar.querySelectorAll('.filter-button').forEach(function(item) {
        item.classList.toggle('is-active', item === button);
      });
      cards.forEach(function(card) {
        var show = true;
        if (value && value !== 'all') {
          var parts = value.split(':');
          if (parts[0] === 'type') {
            show = (card.getAttribute('data-type') || '').indexOf(parts[1]) !== -1;
          }
          if (parts[0] === 'year') {
            show = card.getAttribute('data-year') === parts[1];
          }
        }
        card.style.display = show ? '' : 'none';
      });
    });
  });

  var searchResults = document.getElementById('search-results');
  var searchStatus = document.getElementById('search-status');
  if (searchResults && searchStatus && Array.isArray(window.SEARCH_INDEX || SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var formInput = document.querySelector('.search-page-form input[name="q"]');
    if (formInput) {
      formInput.value = query;
    }
    if (query) {
      var lowered = query.toLowerCase();
      var data = (window.SEARCH_INDEX || SEARCH_INDEX).filter(function(item) {
        return (item.keywords || '').toLowerCase().indexOf(lowered) !== -1;
      }).slice(0, 120);
      searchStatus.textContent = data.length ? '搜索结果' : '未找到相关内容';
      searchResults.innerHTML = data.map(function(item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="poster-gradient"></span>',
          '<span class="card-badge">' + escapeHtml(item.category) + '</span>',
          '<span class="card-duration">' + escapeHtml(item.duration) + '</span>',
          '</a>',
          '<div class="card-body">',
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.desc) + '</p>',
          '<div class="card-meta">',
          '<span>' + escapeHtml(item.year || '热播') + '</span>',
          '<span>' + escapeHtml(item.region) + '</span>',
          '<span>' + escapeHtml(item.type) + '</span>',
          '</div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();

function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var playButton = document.getElementById(options.playButtonId);
  var source = options.source;
  var hlsInstance = null;

  if (!video || !cover || !source) {
    return;
  }

  function bindSource() {
    if (video.getAttribute('data-ready') === 'true') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video._hlsInstance = hlsInstance;
    } else {
      video.src = source;
    }
    video.setAttribute('data-ready', 'true');
  }

  function startPlay() {
    bindSource();
    video.controls = true;
    cover.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  }

  cover.addEventListener('click', startPlay);
  if (playButton) {
    playButton.addEventListener('click', function(event) {
      event.stopPropagation();
      startPlay();
    });
  }
  video.addEventListener('click', function() {
    if (video.paused) {
      startPlay();
    }
  });
}
