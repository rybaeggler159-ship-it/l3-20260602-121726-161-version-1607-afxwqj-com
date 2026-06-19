/* Static interaction script for generated movie pages. */

(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initBackTop() {
    var button = document.querySelector('[data-back-top]');

    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    });

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-local-search]');
      var pageRoot = scope.parentElement || document;
      var list = pageRoot.querySelector('[data-card-list]');
      var result = pageRoot.querySelector('[data-result-count]');

      if (!list) {
        list = document.querySelector('[data-card-list]');
      }

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-item'));
      var selectedYear = 'all';
      var selectedType = 'all';

      function apply() {
        var q = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre')
          ].join(' '));
          var year = String(card.getAttribute('data-year') || '');
          var type = String(card.getAttribute('data-type') || '');
          var matchedQuery = !q || haystack.indexOf(q) !== -1;
          var matchedYear = selectedYear === 'all' || year === selectedYear;
          var matchedType = selectedType === 'all' || type === selectedType;
          var show = matchedQuery && matchedYear && matchedType;

          card.classList.toggle('is-hidden', !show);

          if (show) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '共 ' + visible + ' 部影片';
        }
      }

      function activateButton(buttons, activeButton) {
        buttons.forEach(function (button) {
          button.classList.toggle('active', button === activeButton);
        });
      }

      if (input) {
        input.addEventListener('input', apply);

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          input.value = query;
        }
      }

      var yearButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]'));
      var typeButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]'));

      yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          selectedYear = button.getAttribute('data-filter-year') || 'all';
          activateButton(yearButtons, button);
          apply();
        });
      });

      typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          selectedType = button.getAttribute('data-filter-type') || 'all';
          activateButton(typeButtons, button);
          apply();
        });
      });

      var urlYear = new URLSearchParams(window.location.search).get('year');
      if (urlYear) {
        yearButtons.forEach(function (button) {
          if (button.getAttribute('data-filter-year') === urlYear) {
            selectedYear = urlYear;
            activateButton(yearButtons, button);
          }
        });
      }

      apply();
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    var video = document.querySelector('[data-video-src]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-src');
    var start = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function bindNative() {
      video.src = source;
      setStatus('播放器已就绪');
    }

    function bindWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('HLS 播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus('播放源加载中断，可刷新重试');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        bindNative();
      } else {
        setStatus('当前浏览器需要 HLS 支持');
      }
    }

    if (!source) {
      setStatus('未找到播放源');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      bindNative();
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js')
        .then(bindWithHls)
        .catch(function () {
          setStatus('HLS 组件加载失败');
        });
    }

    if (start) {
      start.addEventListener('click', function () {
        start.classList.add('hidden');
        video.play().catch(function () {
          start.classList.remove('hidden');
          setStatus('请再次点击播放');
        });
      });

      video.addEventListener('play', function () {
        start.classList.add('hidden');
      });
    }
  }

  function initImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.parentElement && image.parentElement.classList.add('image-missing');
      }, { once: true });
    });
  }

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initFilters();
    initPlayer();
    initImageFallback();
  });
})();
