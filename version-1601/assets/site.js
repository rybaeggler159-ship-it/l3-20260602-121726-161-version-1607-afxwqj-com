(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    var heroTitle = document.querySelector('[data-hero-title]');
    var heroText = document.querySelector('[data-hero-text]');
    var heroLink = document.querySelector('[data-hero-link]');
    var heroPoster = document.querySelector('[data-hero-poster]');
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var currentHero = 0;

    function activateHero(index) {
      var thumb = thumbs[index];
      if (!thumb || !hero || !heroTitle || !heroText || !heroLink || !heroPoster) {
        return;
      }
      thumbs.forEach(function (item) {
        item.classList.remove('active');
      });
      thumb.classList.add('active');
      hero.style.setProperty('--hero-image', 'url("' + thumb.getAttribute('data-image') + '")');
      heroTitle.textContent = thumb.getAttribute('data-title') || '';
      heroText.textContent = thumb.getAttribute('data-text') || '';
      heroLink.setAttribute('href', thumb.getAttribute('data-link') || '#');
      heroPoster.setAttribute('src', thumb.getAttribute('data-image') || '');
      heroPoster.setAttribute('alt', thumb.getAttribute('data-title') || '');
      currentHero = index;
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        activateHero(index);
      });
    });

    if (thumbs.length) {
      activateHero(0);
      window.setInterval(function () {
        activateHero((currentHero + 1) % thumbs.length);
      }, 5200);
    }

    var controls = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    function applyFilter() {
      if (!controls || !cards.length) {
        return;
      }
      var q = (controls.querySelector('[data-search]') || {}).value || '';
      var region = (controls.querySelector('[data-region]') || {}).value || '';
      var type = (controls.querySelector('[data-type]') || {}).value || '';
      var year = (controls.querySelector('[data-year]') || {}).value || '';
      q = q.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        card.classList.toggle('hidden-card', !matched);
      });
    }

    if (controls) {
      controls.addEventListener('input', applyFilter);
      controls.addEventListener('change', applyFilter);
    }

    var player = document.querySelector('[data-player]');
    if (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-play-overlay]');
      var source = video ? video.getAttribute('data-src') : '';
      var hlsInstance = null;
      function startPlayback() {
        if (!video || !source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', source);
          }
        } else if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
        if (overlay) {
          overlay.classList.add('hidden');
        }
      }
      if (overlay) {
        overlay.addEventListener('click', startPlayback);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  });
})();
