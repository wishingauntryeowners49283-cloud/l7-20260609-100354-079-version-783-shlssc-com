(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  function applyFilters(form) {
    var input = form.querySelector('[data-filter-input]');
    var year = form.querySelector('[data-filter-year]');
    var region = form.querySelector('[data-filter-region]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var words = input ? input.value.trim().toLowerCase() : '';
    var yearValue = year ? year.value : '';
    var regionValue = region ? region.value : '';

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var ok = true;

      if (words && text.indexOf(words) === -1) {
        ok = false;
      }

      if (yearValue && cardYear !== yearValue) {
        ok = false;
      }

      if (regionValue && cardRegion !== regionValue) {
        ok = false;
      }

      card.hidden = !ok;
    });
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var controls = form.querySelectorAll('input, select');

    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(form);
      });

      control.addEventListener('change', function () {
        applyFilters(form);
      });
    });

    applyFilters(form);
  });

  var searchInput = document.getElementById('siteSearchInput');

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
      var searchForm = searchInput.closest('[data-filter-form]');

      if (searchForm) {
        applyFilters(searchForm);
      }
    }
  }
})();
