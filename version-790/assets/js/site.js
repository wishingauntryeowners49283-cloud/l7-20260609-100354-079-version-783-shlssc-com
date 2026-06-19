(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
        const prev = document.querySelector('[data-hero-prev]');
        const next = document.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) return;
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        const searchInput = filterPanel.querySelector('[data-search-input]');
        const yearFilter = filterPanel.querySelector('[data-year-filter]');
        const regionFilter = filterPanel.querySelector('[data-region-filter]');
        const cards = Array.from(document.querySelectorAll('[data-search-card]'));
        const noResult = document.querySelector('[data-no-result]');

        function normalize(text) {
            return String(text || '').trim().toLowerCase();
        }

        function applyFilter() {
            const keyword = normalize(searchInput ? searchInput.value : '');
            const year = yearFilter ? yearFilter.value : '';
            const region = regionFilter ? regionFilter.value : '';
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' '));
                const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchYear = !year || card.getAttribute('data-year') === year;
                const matchRegion = !region || card.getAttribute('data-region') === region;
                const visible = matchKeyword && matchYear && matchRegion;
                card.style.display = visible ? '' : 'none';
                if (visible) visibleCount += 1;
            });

            if (noResult) {
                noResult.classList.toggle('show', visibleCount === 0);
            }
        }

        [searchInput, yearFilter, regionFilter].forEach(function (control) {
            if (control) control.addEventListener('input', applyFilter);
            if (control) control.addEventListener('change', applyFilter);
        });
    }

    const player = document.querySelector('[data-player]');
    if (player) {
        const frame = player.closest('.player-frame');
        const button = document.querySelector('[data-play-button]');
        const source = player.getAttribute('data-source');
        let attached = false;

        function attachSource() {
            if (attached || !source) return;
            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = source;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(player);
                attached = true;
                return;
            }
            player.src = source;
            attached = true;
        }

        function playVideo() {
            attachSource();
            if (frame) frame.classList.add('is-playing');
            const promise = player.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (frame) frame.classList.remove('is-playing');
                });
            }
        }

        attachSource();

        if (button) {
            button.addEventListener('click', playVideo);
        }

        player.addEventListener('click', function () {
            if (player.paused) playVideo();
        });

        player.addEventListener('play', function () {
            if (frame) frame.classList.add('is-playing');
        });

        player.addEventListener('pause', function () {
            if (frame) frame.classList.remove('is-playing');
        });
    }
})();
