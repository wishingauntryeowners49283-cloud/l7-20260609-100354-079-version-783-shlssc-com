(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    function prepare(container) {
        var video = container.querySelector('video');
        if (!video) {
            return null;
        }
        var stream = video.getAttribute('data-hls');
        if (!stream) {
            return video;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = stream;
            }
            return video;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!container.hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                container.hlsInstance = hls;
            }
            return video;
        }
        if (!video.src) {
            video.src = stream;
        }
        return video;
    }

    function play(container) {
        var video = prepare(container);
        if (!video) {
            return;
        }
        container.classList.add('is-playing');
        var start = video.play();
        if (start && typeof start.catch === 'function') {
            start.catch(function () {
                container.classList.remove('is-playing');
            });
        }
    }

    players.forEach(function (container) {
        var video = prepare(container);
        var trigger = container.querySelector('[data-play-trigger]');

        if (trigger) {
            trigger.addEventListener('click', function () {
                play(container);
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                container.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    container.classList.remove('is-playing');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    play(container);
                }
            });
        }
    });
})();
