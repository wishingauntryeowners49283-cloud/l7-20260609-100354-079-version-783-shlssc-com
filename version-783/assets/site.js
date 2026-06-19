(function () {
  'use strict';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function updateSearchAction(form) {
    var input = qs('input[name="q"]', form);
    if (!input) {
      return;
    }
    form.addEventListener('submit', function (event) {
      if (!input.value.trim()) {
        event.preventDefault();
        input.focus();
      }
    });
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function setupFilters() {
    var filterRoot = qs('[data-filter-root]');

    if (!filterRoot) {
      return;
    }

    var cards = qsa('[data-card]', filterRoot);
    var searchInput = qs('[data-filter-search]', filterRoot);
    var typeSelect = qs('[data-filter-type]', filterRoot);
    var yearSelect = qs('[data-filter-year]', filterRoot);
    var regionSelect = qs('[data-filter-region]', filterRoot);
    var resultCount = qs('[data-result-count]', filterRoot);
    var noResults = qs('[data-no-results]', filterRoot);

    function apply() {
      var query = normalize(searchInput && searchInput.value);
      var selectedType = normalize(typeSelect && typeSelect.value);
      var selectedYear = normalize(yearSelect && yearSelect.value);
      var selectedRegion = normalize(regionSelect && regionSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !selectedType || normalize(card.getAttribute('data-type')).indexOf(selectedType) !== -1;
        var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var matchesRegion = !selectedRegion || normalize(card.getAttribute('data-region')).indexOf(selectedRegion) !== -1;
        var shouldShow = matchesQuery && matchesType && matchesYear && matchesRegion;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '当前显示 ' + visible + ' 部影片，共 ' + cards.length + ' 部';
      }

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, typeSelect, yearSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    apply();
  }

  function setupMissingImages() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (!target || target.tagName !== 'IMG' || target.classList.contains('image-missing')) {
        return;
      }

      target.classList.add('image-missing');
      var label = document.createElement('span');
      label.className = 'missing-image-label';
      label.textContent = target.getAttribute('alt') || '影视封面';

      if (target.parentNode) {
        target.parentNode.appendChild(label);
      }
    }, true);
  }

  function setupPlayer() {
    var video = qs('[data-hls-player]');
    var wrapper = qs('[data-video-wrap]');
    var playButton = qs('[data-player-button]');
    var status = qs('[data-player-status]');

    if (!video || !playButton || !wrapper) {
      return;
    }

    var primarySource = video.getAttribute('data-m3u8');
    var fallbackSource = video.getAttribute('data-fallback-m3u8');
    var mp4Fallback = video.getAttribute('data-fallback-mp4');
    var hlsInstance = null;
    var currentSource = '';
    var hasLoaded = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function destroyHls() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('播放器已就绪，请再次点击播放按钮。');
        });
      }
    }

    function loadMp4Fallback() {
      destroyHls();
      if (!mp4Fallback) {
        setStatus('当前浏览器不支持 HLS 播放，请更换浏览器或接入可播放源。');
        return;
      }
      currentSource = mp4Fallback;
      video.src = mp4Fallback;
      video.controls = true;
      setStatus('正在使用本地 MP4 兜底源播放。');
      playVideo();
    }

    function loadSource(source, isFallback) {
      if (!source) {
        loadMp4Fallback();
        return;
      }

      currentSource = source;
      setStatus(isFallback ? '主线路暂不可用，正在切换本地 HLS 兜底源。' : '正在初始化 HLS 播放源。');
      destroyHls();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.controls = true;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.controls = true;
          setStatus('播放源已加载完成。');
          playVideo();
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (!isFallback && fallbackSource && currentSource !== fallbackSource) {
            loadSource(fallbackSource, true);
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }

          loadMp4Fallback();
        });
        return;
      }

      loadMp4Fallback();
    }

    function beginPlayback() {
      if (!hasLoaded) {
        hasLoaded = true;
        loadSource(primarySource, false);
      } else {
        playVideo();
      }
    }

    playButton.addEventListener('click', beginPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
      setStatus('正在播放。');
    });
    video.addEventListener('pause', function () {
      wrapper.classList.remove('is-playing');
      setStatus('已暂停，点击画面继续播放。');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    qsa('form[data-search-form]').forEach(updateSearchAction);
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupMissingImages();
    setupPlayer();
  });
})();
