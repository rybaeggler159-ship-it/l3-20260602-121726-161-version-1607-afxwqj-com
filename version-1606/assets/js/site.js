import { H as Hls } from './video-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initMobileNavigation() {
  const toggle = $('.js-mobile-toggle');
  const menu = $('.site-mobile-menu');
  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
  });
}

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const previous = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  let current = 0;
  let timer = null;

  const activate = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => activate(current + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  previous?.addEventListener('click', () => {
    activate(current - 1);
    start();
  });

  next?.addEventListener('click', () => {
    activate(current + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      activate(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  activate(0);
  start();
}

function initPlayers() {
  $$('.player-shell').forEach((shell) => {
    const video = $('.js-hls-player', shell);
    if (!video) {
      return;
    }

    const src = video.dataset.src;
    const loader = $('.js-video-loader', shell);
    const errorBox = $('.js-video-error', shell);
    const errorText = $('.js-video-error-text', shell);
    const toggle = $('.js-video-toggle', shell);
    const mute = $('.js-video-mute', shell);
    const fullscreen = $('.js-video-fullscreen', shell);

    const showError = (message) => {
      if (loader) {
        loader.hidden = true;
      }
      if (errorText) {
        errorText.textContent = message;
      }
      if (errorBox) {
        errorBox.hidden = false;
      }
    };

    if (!src) {
      showError('当前影片缺少播放源');
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (loader) {
          loader.hidden = true;
        }
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          showError('网络错误，请检查连接后刷新页面');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          showError('媒体错误，正在尝试恢复');
          hls.recoverMediaError();
        } else {
          showError('无法播放视频');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        if (loader) {
          loader.hidden = true;
        }
      }, { once: true });
    } else {
      showError('您的浏览器不支持 HLS 视频播放');
    }

    const updatePlayButton = () => {
      if (toggle) {
        toggle.textContent = video.paused ? '▶' : 'Ⅱ';
      }
    };

    const playOrPause = () => {
      if (video.paused) {
        video.play().catch(() => showError('浏览器阻止了自动播放，请再次点击播放按钮'));
      } else {
        video.pause();
      }
      updatePlayButton();
    };

    toggle?.addEventListener('click', playOrPause);
    video.addEventListener('click', playOrPause);
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);

    mute?.addEventListener('click', () => {
      video.muted = !video.muted;
      mute.textContent = video.muted ? '×' : '♬';
    });

    fullscreen?.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        shell.requestFullscreen?.();
      }
    });
  });
}

function initCardFilters() {
  $$('.js-card-filter').forEach((filter) => {
    const container = filter.parentElement;
    const list = $('.js-card-list', container || document);
    if (!list) {
      return;
    }

    const cards = $$('.movie-card, .movie-card-horizontal', list);
    const count = $('.js-filter-count', filter);
    const reset = $('.js-filter-reset', filter);
    const controls = $$('input, select', filter);

    const apply = () => {
      const form = new FormData();
      controls.forEach((control) => form.set(control.name, control.value.trim().toLowerCase()));
      const q = form.get('q') || '';
      const year = form.get('year') || '';
      const type = form.get('type') || '';
      const category = form.get('category') || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.category,
          card.dataset.type
        ].join(' ').toLowerCase();
        const cardYear = Number(card.dataset.year || 0);
        const matchesQuery = !q || haystack.includes(q);
        const matchesType = !type || (card.dataset.type || '').toLowerCase().includes(type);
        const matchesCategory = !category || (card.dataset.category || '').toLowerCase() === category;
        let matchesYear = true;
        if (year === '2022') {
          matchesYear = cardYear && cardYear <= 2022;
        } else if (year) {
          matchesYear = String(cardYear) === year;
        }
        const show = matchesQuery && matchesType && matchesCategory && matchesYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    };

    controls.forEach((control) => control.addEventListener('input', apply));
    reset?.addEventListener('click', () => {
      controls.forEach((control) => {
        control.value = '';
      });
      apply();
    });
    apply();
  });
}

function movieCardTemplate(movie, detailPrefix, imagePrefix) {
  const year = movie.year || movie.yearText || '';
  const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(' · ') : '';
  return `
<a href="${detailPrefix}${escapeHTML(movie.id)}.html" class="group block bg-slate-800 rounded-lg overflow-hidden hover:shadow-soft-lg transition-all movie-card">
  <div class="relative aspect-video">
    <img src="${imagePrefix}${escapeHTML(movie.cover)}" alt="${escapeHTML(movie.title)}" class="w-full h-full object-cover" loading="lazy">
    <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
      <span class="w-14 h-14 rounded-full bg-ocean-500/90 flex items-center justify-center group-hover:scale-110 transition-transform site-play-dot">▶</span>
    </div>
    <span class="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-white text-xs rounded">${escapeHTML(movie.type)}</span>
  </div>
  <div class="p-3">
    <h3 class="font-semibold text-white text-sm line-clamp-2 group-hover:text-ocean-400 transition-colors mb-2">${escapeHTML(movie.title)}</h3>
    <p class="text-slate-400 text-xs line-clamp-2 mb-2">${escapeHTML(movie.oneLine)}</p>
    <div class="flex items-center justify-between text-xs text-slate-500">
      <span>${escapeHTML(year)}年</span>
      <span class="truncate">${escapeHTML(movie.region)}</span>
    </div>
    <p class="text-ocean-400 text-xs mt-2 line-clamp-1">${escapeHTML(tags)}</p>
  </div>
</a>`.trim();
}

function initSearchPage() {
  const page = $('.js-search-page');
  if (!page) {
    return;
  }

  const results = $('.js-search-results', page);
  const input = $('.js-search-input', page);
  const category = $('.js-search-category', page);
  const year = $('.js-search-year', page);
  const count = $('.js-search-count', page);
  const reset = $('.js-search-reset', page);
  const detailPrefix = page.dataset.detailPrefix || 'video/';
  const imagePrefix = page.dataset.imagePrefix || '';
  let movies = [];

  const params = new URLSearchParams(window.location.search);
  if (params.get('q') && input) {
    input.value = params.get('q');
  }

  const render = () => {
    const q = (input?.value || '').trim().toLowerCase();
    const selectedCategory = (category?.value || '').trim();
    const selectedYear = year?.value || '';
    const filtered = movies.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.category,
        movie.genreRaw,
        movie.oneLine,
        ...(movie.tags || [])
      ].join(' ').toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesCategory = !selectedCategory || movie.category === selectedCategory;
      let matchesYear = true;
      if (selectedYear === '2022') {
        matchesYear = movie.year && movie.year <= 2022;
      } else if (selectedYear) {
        matchesYear = String(movie.year) === selectedYear;
      }
      return matchesQuery && matchesCategory && matchesYear;
    }).slice(0, 120);

    if (count) {
      count.textContent = String(filtered.length);
    }

    if (!results) {
      return;
    }

    if (filtered.length === 0) {
      results.innerHTML = '<div class="search-empty">没有匹配的影片，请更换关键词或筛选条件。</div>';
      return;
    }

    results.innerHTML = filtered
      .map((movie) => movieCardTemplate(movie, detailPrefix, imagePrefix))
      .join('\n');
  };

  fetch(page.dataset.dataUrl)
    .then((response) => response.json())
    .then((data) => {
      movies = Array.isArray(data) ? data : [];
      render();
    })
    .catch(() => {
      if (results) {
        results.innerHTML = '<div class="search-empty">影片数据加载失败，请刷新页面重试。</div>';
      }
    });

  [input, category, year].forEach((control) => {
    control?.addEventListener('input', render);
  });

  reset?.addEventListener('click', () => {
    if (input) {
      input.value = '';
    }
    if (category) {
      category.value = '';
    }
    if (year) {
      year.value = '';
    }
    render();
  });
}

function initSearchForms() {
  $$('.site-search-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = $('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initHero();
  initPlayers();
  initCardFilters();
  initSearchPage();
  initSearchForms();
});
