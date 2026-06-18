import { H as Hls } from "./hls-vendor-dru42stk.js";

const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initHeader() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-nav-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    const syncHeader = () => {
        if (window.scrollY > 48) {
            header?.classList.add("is-scrolled");
        } else {
            header?.classList.remove("is-scrolled");
        }
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    toggle?.addEventListener("click", () => {
        mobileNav?.classList.toggle("is-open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    const slides = selectAll("[data-hero-slide]", hero);
    const dots = selectAll("[data-hero-dot]", hero);
    let current = 0;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => show(index));
    });

    show(0);
    window.setInterval(() => show(current + 1), 5600);
}

function initCatalog() {
    const searchInputs = selectAll("[data-catalog-search]");
    const grids = selectAll("[data-catalog-grid]");
    if (!searchInputs.length || !grids.length) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    let activeCategory = "all";

    const filter = () => {
        const query = searchInputs[0].value.trim().toLowerCase();
        let visibleCount = 0;
        grids.forEach((grid) => {
            selectAll(".movie-card, .ranking-item", grid).forEach((item) => {
                const text = item.dataset.search || "";
                const category = item.dataset.category || "all";
                const matchesText = !query || text.includes(query);
                const matchesCategory = activeCategory === "all" || category === activeCategory;
                const visible = matchesText && matchesCategory;
                item.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
        });
        selectAll("[data-empty-state]").forEach((state) => {
            state.hidden = visibleCount !== 0;
        });
    };

    searchInputs.forEach((input) => {
        input.value = initialQuery;
        input.addEventListener("input", () => {
            searchInputs.forEach((other) => {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            filter();
        });
    });

    selectAll("[data-filter-category]").forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.filterCategory || "all";
            selectAll("[data-filter-category]").forEach((item) => {
                item.classList.toggle("is-active", item.dataset.filterCategory === activeCategory);
            });
            filter();
        });
    });

    filter();
}

function initPlayers() {
    selectAll(".movie-player").forEach((player) => {
        const video = player.querySelector("video");
        const trigger = player.querySelector(".player-cover");
        const state = player.querySelector(".player-state");
        const videoUrl = player.dataset.videoUrl;
        let hls = null;
        let attachPromise = null;

        const setState = (message) => {
            if (state) {
                state.textContent = message;
            }
        };

        const attach = () => {
            if (!video || !videoUrl) {
                setState("播放暂时不可用");
                return Promise.reject(new Error("missing media"));
            }

            if (attachPromise) {
                return attachPromise;
            }

            attachPromise = new Promise((resolve, reject) => {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                    video.addEventListener("loadedmetadata", resolve, { once: true });
                    video.addEventListener("error", reject, { once: true });
                    return;
                }

                if (Hls.isSupported()) {
                    hls = new Hls({
                        maxBufferLength: 36,
                        backBufferLength: 18
                    });
                    hls.on(Hls.Events.MANIFEST_PARSED, resolve);
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (data?.fatal) {
                            setState("播放暂时不可用");
                            reject(new Error("media error"));
                        }
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    return;
                }

                setState("播放暂时不可用");
                reject(new Error("unsupported"));
            });

            return attachPromise;
        };

        const start = async () => {
            if (!video) {
                return;
            }

            try {
                await attach();
                await video.play();
                player.classList.add("is-playing");
                setState("");
            } catch (error) {
                if (video.src || hls) {
                    setState("点击画面继续播放");
                }
            }
        };

        trigger?.addEventListener("click", start);
        video?.addEventListener("click", () => {
            if (!video.src && !hls) {
                start();
            }
        });
        video?.addEventListener("play", () => player.classList.add("is-playing"));
        video?.addEventListener("pause", () => {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove("is-playing");
            }
        });
        video?.addEventListener("error", () => setState("播放暂时不可用"));

        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initHero();
    initCatalog();
    initPlayers();
});
