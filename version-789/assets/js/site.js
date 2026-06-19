(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[type="search"], input[type="text"]');
      const query = input ? input.value.trim() : '';
      const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.location.href = target;
    });
  });

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
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
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    const grid = document.querySelector(input.getAttribute('data-local-filter') || '[data-movie-grid]');
    const empty = document.querySelector('[data-empty-results]');

    input.addEventListener('input', function () {
      const query = input.value.trim().toLowerCase();
      let visibleCount = 0;
      grid.querySelectorAll('[data-movie-card]').forEach(function (card) {
        const text = (card.getAttribute('data-search-text') || '').toLowerCase();
        const matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    });
  });

  const searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    const input = searchRoot.querySelector('[data-search-input]');
    const genre = searchRoot.querySelector('[data-search-genre]');
    const year = searchRoot.querySelector('[data-search-year]');
    const results = searchRoot.querySelector('[data-search-results]');
    const empty = searchRoot.querySelector('[data-empty-results]');
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function createCard(movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-movie-card>' +
        '<a class="poster-link" href="' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="card-badge">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="card-content">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '<a class="watch-link" href="' + movie.file + '">立即观看</a>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function render() {
      const q = input.value.trim().toLowerCase();
      const selectedGenre = genre.value;
      const selectedYear = year.value;
      const matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        const text = [movie.title, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        const byText = !q || text.indexOf(q) !== -1;
        const byGenre = !selectedGenre || movie.category === selectedGenre || movie.genre.indexOf(selectedGenre) !== -1 || movie.tags.indexOf(selectedGenre) !== -1;
        const byYear = !selectedYear || movie.year === selectedYear;
        return byText && byGenre && byYear;
      }).slice(0, 180);
      results.innerHTML = matched.map(createCard).join('');
      empty.classList.toggle('is-visible', matched.length === 0);
    }

    [input, genre, year].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
    render();
  }
})();
