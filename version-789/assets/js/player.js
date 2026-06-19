(function () {
  const player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const source = player.getAttribute('data-video-src');
  let ready = false;
  let hls = null;

  function attachSource() {
    if (ready || !source || !video) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();
    player.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
