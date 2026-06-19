(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var title = document.getElementById('searchTitle');
  var hint = document.getElementById('searchHint');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();

  if (!results || !window.MOVIES) {
    return;
  }

  if (input && query) {
    input.value = query;
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="cover-shade"></span>',
      '<span class="play-chip">▶</span>',
      '<span class="year-chip">' + movie.year + '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-tags">' + tags + '</div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  if (query) {
    var key = normalize(query);
    var matched = window.MOVIES.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.tags.join(' ')
      ].join(' ')).indexOf(key) !== -1;
    }).slice(0, 96);

    if (title) {
      title.textContent = '搜索结果';
    }

    if (hint) {
      hint.textContent = matched.length ? '已匹配相关影片。' : '未找到完全匹配内容，可尝试更换关键词。';
    }

    results.innerHTML = matched.length ? matched.map(card).join('') : '';
  }
})();
