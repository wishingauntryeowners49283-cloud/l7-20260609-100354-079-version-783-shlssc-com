(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var yearSelect = panel.querySelector('[data-year-filter]');
        var categorySelect = panel.querySelector('[data-category-filter]');
        var section = panel.closest('section');
        var list = section ? section.querySelector('[data-movie-list]') : document.querySelector('[data-movie-list]');
        var empty = section ? section.querySelector('[data-empty-state]') : document.querySelector('[data-empty-state]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var category = normalize(categorySelect ? categorySelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute('data-year')) !== year) {
                    ok = false;
                }
                if (category && normalize(card.getAttribute('data-category')) !== category) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }
        if (yearSelect && params.get('year')) {
            yearSelect.value = params.get('year');
        }
        applyFilters();
    });
})();
