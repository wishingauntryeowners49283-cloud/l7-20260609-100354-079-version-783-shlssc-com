function initMoviePlayer(videoId, maskId, streamUrl) {
  var video = document.getElementById(videoId);
  var mask = document.getElementById(maskId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !mask || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    attached = true;
  }

  function startPlayback() {
    attachStream();
    mask.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  mask.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (!attached) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
