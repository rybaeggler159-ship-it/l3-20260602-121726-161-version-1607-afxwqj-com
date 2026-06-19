(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupImages() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function setupNavigation() {
    var toggle = $('.nav-toggle');
    var mobile = $('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = $('.hero-shell');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var prev = $('.hero-prev', hero);
    var next = $('.hero-next', hero);
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchForms() {
    $all('form[action="search.html"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
        }
      });
    });
  }

  function setupFilters() {
    var input = $('.movie-filter-input');
    var cards = $all('.movie-card');
    if (!input || cards.length === 0) {
      return;
    }
    var year = $('.filter-year');
    var type = $('.filter-type');
    var region = $('.filter-region');
    var category = $('.filter-category');
    var empty = $('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      input.value = q;
    }

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = value(input);
      var selectedYear = value(year);
      var selectedType = value(type);
      var selectedRegion = value(region);
      var selectedCategory = value(category);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.category,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (selectedYear && (card.dataset.year || '').toLowerCase() !== selectedYear) {
          ok = false;
        }
        if (selectedType && (card.dataset.type || '').toLowerCase().indexOf(selectedType) === -1) {
          ok = false;
        }
        if (selectedRegion && (card.dataset.region || '').toLowerCase().indexOf(selectedRegion) === -1) {
          ok = false;
        }
        if (selectedCategory && (card.dataset.category || '').toLowerCase() !== selectedCategory) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, year, type, region, category].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    $all('.media-player').forEach(function (player) {
      var video = $('video', player);
      var overlay = $('.player-overlay', player);
      var button = $('.player-button', player);
      var source = video ? video.querySelector('source') : null;
      var url = source ? source.getAttribute('src') : '';
      var hls = null;
      var ready = false;
      if (!video || !url) {
        return;
      }

      function bind() {
        if (ready) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        bind();
        video.setAttribute('controls', 'controls');
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupImages();
    setupNavigation();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
