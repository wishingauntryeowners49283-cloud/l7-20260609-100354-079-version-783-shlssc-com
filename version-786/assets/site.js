(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    setupHero();
    setupSearchAndFilters();
    applyQueryFromUrl();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupSearchAndFilters() {
    var input = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-search-list]");
    var filterGroup = document.querySelector("[data-filter-group]");
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var activeFilter = "全部";

    function apply() {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var typeValue = card.getAttribute("data-type") || "";
        var typeMatch = activeFilter === "全部" || typeValue.indexOf(activeFilter) !== -1 || haystack.indexOf(normalize(activeFilter)) !== -1;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !(typeMatch && keywordMatch));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    if (filterGroup) {
      filterGroup.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter]");
        if (!button) {
          return;
        }
        activeFilter = button.getAttribute("data-filter") || "全部";
        Array.prototype.slice.call(filterGroup.querySelectorAll("[data-filter]")).forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    }

    apply();
  }

  function applyQueryFromUrl() {
    var input = document.querySelector("[data-search-input]");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-play-overlay]");
    if (!video || !source) {
      return;
    }

    var hls = null;
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      video.setAttribute("controls", "controls");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
