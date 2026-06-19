(function () {
  var menuButton = document.querySelector('.mobile-menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-index')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var searchForms = document.querySelectorAll('[data-global-search]');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
    });
  });

  var panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach(function (panel) {
    var scope = panel.parentElement;
    var input = panel.querySelector('[data-filter-input]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function match(card) {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var typeText = card.getAttribute('data-type') || '';
      var yearText = card.getAttribute('data-year') || '';
      return (!keyword || text.indexOf(keyword) !== -1) &&
        (!typeValue || typeText.indexOf(typeValue) !== -1) &&
        (!yearValue || yearText === yearValue);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var keep = match(card);
        card.hidden = !keep;
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  });
}());
