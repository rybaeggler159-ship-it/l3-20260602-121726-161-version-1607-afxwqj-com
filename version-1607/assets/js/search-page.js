(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);

  function render(query) {
    if (!results) {
      return;
    }

    var keyword = (query || '').trim().toLowerCase();
    var items = (window.searchItems || []).filter(function (item) {
      var text = [item.title, item.year, item.region, item.genre, item.oneLine].join(' ').toLowerCase();
      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 120);

    if (!items.length) {
      results.innerHTML = '<p class="movie-meta">没有找到匹配影片，请尝试其他关键词。</p>';
      return;
    }

    results.innerHTML = items.map(function (item) {
      return [
        '<a class="search-result-item" href="' + item.url + '">',
        '  <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '  <span>',
        '    <h3>' + escapeHtml(item.title) + '</h3>',
        '    <p>' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</p>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '  </span>',
        '</a>'
      ].join('');
    }).join('');
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

  if (input) {
    input.value = params.get('q') || '';
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input ? input.value : '');
    });
  }

  render(input ? input.value : '');
})();
