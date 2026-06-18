(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var header = qs('.site-header');
        var button = qs('.menu-toggle');

        if (!header || !button) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = header.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            button.textContent = isOpen ? '×' : '☰';
        });
    }

    function setupHeaderSearch() {
        qsa('form[role="search"], .header-search, .search-page-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');

                if (input && !input.value.trim()) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var index = 0;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });

        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupCategoryFilters() {
        var panel = qs('[data-filter-panel]');
        var grid = qs('[data-filterable-grid]');

        if (!panel || !grid) {
            return;
        }

        var keywordInput = qs('[data-filter-keyword]', panel);
        var genreSelect = qs('[data-filter-genre]', panel);
        var yearSelect = qs('[data-filter-year]', panel);
        var countNode = qs('[data-filter-count]', panel);
        var emptyNode = qs('[data-empty-state]');
        var cards = qsa('.movie-card', grid);

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var genre = normalize(genreSelect && genreSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.category,
                    card.textContent
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesGenre = !genre || normalize(card.dataset.genre).indexOf(genre) !== -1;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var show = matchesKeyword && matchesGenre && matchesYear;

                card.hidden = !show;

                if (show) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }

            if (emptyNode) {
                emptyNode.hidden = visible > 0;
            }
        }

        [keywordInput, genreSelect, yearSelect].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        });
    }

    function setupPlayer() {
        var video = qs('#movie-player');
        var overlay = qs('.play-overlay');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-hls-src');
        var started = false;
        var hlsInstance = null;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function startPlayer() {
            if (started || !source) {
                if (video.play) {
                    video.play().catch(function () {});
                }
                hideOverlay();
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
                hideOverlay();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.recoverMediaError();
                    }
                });
                hideOverlay();
                return;
            }

            video.src = source;
            video.play().catch(function () {});
            hideOverlay();
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayer);
        }

        video.addEventListener('click', function () {
            if (!started) {
                startPlayer();
            }
        });
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function escapeHtml(value) {
        return (value || '').toString().replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderSearchResults() {
        var resultsRoot = qs('[data-search-results]');

        if (!resultsRoot || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var input = qs('[data-search-page-input]');
        var title = qs('[data-search-title]');
        var summary = qs('[data-search-summary]');
        var empty = qs('[data-search-empty]');
        var query = getQuery('q').trim();
        var normalizedQuery = query.toLowerCase();

        if (input) {
            input.value = query;
        }

        if (!query) {
            resultsRoot.innerHTML = '';
            if (title) {
                title.textContent = '搜索结果';
            }
            if (summary) {
                summary.textContent = '请输入关键词开始搜索。';
            }
            if (empty) {
                empty.hidden = true;
            }
            return;
        }

        var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
            return [
                item.title,
                item.description,
                item.tags,
                item.category,
                item.genre,
                item.region,
                item.year
            ].join(' ').toLowerCase().indexOf(normalizedQuery) !== -1;
        }).slice(0, 120);

        if (title) {
            title.textContent = '搜索结果：' + query;
        }
        if (summary) {
            summary.textContent = '找到 ' + matches.length + ' 个相关结果。';
        }
        if (empty) {
            empty.hidden = matches.length > 0;
        }

        resultsRoot.innerHTML = matches.map(function (item) {
            return [
                '<a class="movie-card" href="' + escapeHtml(item.href) + '">',
                '    <figure class="poster-frame">',
                '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\';">',
                '        <span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
                '        <span class="play-badge">▶</span>',
                '    </figure>',
                '    <div class="movie-card-body">',
                '        <h3>' + escapeHtml(item.title) + '</h3>',
                '        <p>' + escapeHtml(item.description) + '</p>',
                '        <div class="card-meta">',
                '            <span>' + escapeHtml(item.year) + '</span>',
                '            <span>' + escapeHtml(item.region) + '</span>',
                '            <span>' + escapeHtml(item.category) + '</span>',
                '        </div>',
                '        <div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
                '    </div>',
                '</a>'
            ].join('\n');
        }).join('\n');
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHeroCarousel();
        setupCategoryFilters();
        setupPlayer();
        renderSearchResults();
    });
})();
