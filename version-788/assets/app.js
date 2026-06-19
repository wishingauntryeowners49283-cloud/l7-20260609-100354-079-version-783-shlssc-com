(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startCarousel();
        });
    });

    startCarousel();

    var filterInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    function fillYears() {
        if (!yearSelect || !cards.length) {
            return;
        }
        var years = [];
        cards.forEach(function (card) {
            var year = card.getAttribute("data-year");
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
        });
        years.sort(function (a, b) {
            return Number(b) - Number(a);
        });
        years.forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    function applyQueryParam() {
        if (!filterInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            filterInput.value = q;
        }
    }

    function updateCards() {
        if (!cards.length) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-text") || "").toLowerCase();
            var title = (card.getAttribute("data-title") || "").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var matchedType = !type || cardType === type;
            card.hidden = !(matchedKeyword && matchedYear && matchedType);
        });
    }

    fillYears();
    applyQueryParam();
    updateCards();

    [filterInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", updateCards);
            control.addEventListener("change", updateCards);
        }
    });
})();
