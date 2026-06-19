(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function siteRoot() {
    return document.body.getAttribute('data-root') || './';
  }

  function setupImages() {
    all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.removeAttribute('src');
      });
    });
  }

  function setupMenu() {
    var button = one('[data-menu-button]');
    var nav = one('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function setupSearch() {
    var inputs = all('[data-site-search]');
    var items = window.SEARCH_ITEMS || [];
    var root = siteRoot();
    inputs.forEach(function (input) {
      var wrap = input.closest('.nav-search') || input.closest('.hero-search-box') || input.parentNode;
      var panel = one('[data-search-results]', wrap);
      if (!panel) {
        return;
      }
      function close() {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
      }
      function render(value) {
        var query = value.trim().toLowerCase();
        if (!query) {
          close();
          return;
        }
        var matches = items.filter(function (item) {
          return item.text.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 12);
        if (!matches.length) {
          panel.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
          panel.classList.add('is-open');
          return;
        }
        panel.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + root + item.link + '">' +
            '<span class="search-result-thumb"><img src="' + root + item.cover + '" alt="' + escapeHtml(item.title) + '"></span>' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></span>' +
            '</a>';
        }).join('');
        panel.classList.add('is-open');
        all('img', panel).forEach(function (img) {
          img.addEventListener('error', function () {
            img.classList.add('is-missing');
            img.removeAttribute('src');
          });
        });
      }
      input.addEventListener('input', function () {
        render(input.value);
      });
      input.addEventListener('focus', function () {
        render(input.value);
      });
      document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target)) {
          close();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupCategoryFilter() {
    var input = one('[data-filter-input]');
    if (!input) {
      return;
    }
    var cards = all('[data-filter-card]');
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.style.display = !query || text.indexOf(query) !== -1 ? '' : 'none';
      });
    });
  }

  function setupPlayer() {
    var shell = one('[data-stream]');
    if (!shell) {
      return;
    }
    var video = one('video', shell);
    var cover = one('.player-cover', shell);
    var stream = shell.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;
    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          startLevel: -1
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = stream;
      playVideo();
    }
    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupImages();
    setupMenu();
    setupHero();
    setupSearch();
    setupCategoryFilter();
    setupPlayer();
  });
})();
