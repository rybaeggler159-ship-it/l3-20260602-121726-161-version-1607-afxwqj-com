(function () {
  window.MovieSite = window.MovieSite || {};

  window.MovieSite.initPlayer = function (sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    if (!video || !button || !sourceUrl) {
      return;
    }

    var loaded = false;

    function attachStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = sourceUrl;
    }

    function startVideo() {
      attachStream();
      button.classList.add("is-hidden");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    button.addEventListener("click", startVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo();
      }
    });
  };

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));
    forms.forEach(function (form) {
      var scope = form.closest("main") || document;
      var search = form.querySelector(".js-filter-search");
      var year = form.querySelector(".js-filter-year");
      var type = form.querySelector(".js-filter-type");
      var empty = scope.querySelector(".empty-state");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card, .js-rank-card"));

      function apply() {
        var query = normalize(search && search.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-tags"),
            item.getAttribute("data-year"),
            item.getAttribute("data-type")
          ].join(" "));
          var yearValue = normalize(item.getAttribute("data-year"));
          var typeValue = normalize(item.getAttribute("data-type"));
          var matched = (!query || haystack.indexOf(query) !== -1) && (!selectedYear || yearValue === selectedYear) && (!selectedType || typeValue === selectedType);
          item.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
