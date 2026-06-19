(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var opened = panel.hasAttribute('hidden') === false;
      if (opened) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function reset() {
      window.clearInterval(timer);
      play();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }

    show(0);
    play();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        card.style.display = matchedKeyword && matchedYear ? '' : 'none';
      });
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }
})();
