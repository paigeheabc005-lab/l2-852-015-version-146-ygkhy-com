(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function attachPlayer(video, shell) {
    var source = video.getAttribute("data-src");
    if (!source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    function play() {
      shell.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    var overlay = shell.querySelector(".play-overlay");
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(
      document.querySelectorAll(".movie-video"),
    );
    videos.forEach(function (video) {
      var shell = video.closest(".player-shell");
      if (shell) {
        attachPlayer(video, shell);
      }
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function movieResultCard(movie) {
    return [
      '<article class="ranking-row">',
      '<a class="ranking-poster" href="' +
        movie.url +
        '"><img src="' +
        movie.cover +
        '" alt="' +
        movie.title.replace(/"/g, "&quot;") +
        '" loading="lazy"></a>',
      '<div class="ranking-info">',
      '<h2><a href="' + movie.url + '">' + movie.title + "</a></h2>",
      "<p>" + movie.desc + "</p>",
      '<div class="movie-meta"><span>' +
        movie.category +
        "</span><span>" +
        movie.region +
        "</span><span>" +
        movie.year +
        "</span><span>" +
        movie.views +
        " 次观看</span></div>",
      "</div>",
      '<a class="mini-btn" href="' + movie.url + '">观看</a>',
      "</article>",
    ].join("");
  }

  function initSearch() {
    var target = document.getElementById("search-results");
    if (!target || !window.SEARCH_MOVIES) {
      return;
    }
    var query = getQuery();
    var input = document.querySelector(".search-page-form input[name='q']");
    if (input) {
      input.value = query;
    }
    if (!query) {
      target.innerHTML =
        '<div class="search-empty">请输入关键词开始搜索。</div>';
      return;
    }
    var q = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      return (
        movie.title.toLowerCase().indexOf(q) !== -1 ||
        movie.desc.toLowerCase().indexOf(q) !== -1 ||
        movie.category.toLowerCase().indexOf(q) !== -1 ||
        movie.region.toLowerCase().indexOf(q) !== -1 ||
        movie.year.toLowerCase().indexOf(q) !== -1 ||
        movie.tags.toLowerCase().indexOf(q) !== -1
      );
    }).slice(0, 120);
    if (!results.length) {
      target.innerHTML = '<div class="search-empty">没有找到匹配内容。</div>';
      return;
    }
    target.innerHTML = results.map(movieResultCard).join("");
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayers();
    initSearch();
  });
})();
