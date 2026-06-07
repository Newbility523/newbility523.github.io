(function () {
  var root = document.querySelector('[data-site-search]');
  if (!root) return;

  var input = root.querySelector('.site-search-input');
  var cancel = root.querySelector('.site-search-cancel');
  var results = root.querySelector('.site-search-results');
  var indexUrl = root.getAttribute('data-index-url') || '/search.json';
  var posts = [];
  var indexLoaded = false;

  function normalize(value) {
    return (value || '').toString().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || '').toString().replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function stripPortableTitle(post, text) {
    var title = (post.title || '').trim();
    var value = (text || '').trim();

    if (!title || !value) return value;
    if (value === title) return '';
    if (value.indexOf(title + '\n') === 0) return value.slice(title.length).trim();
    if (value.indexOf(title + ' ') === 0) return value.slice(title.length).trim();
    return value;
  }

  function makeExcerpt(post, query) {
    var summary = stripPortableTitle(post, post.summary || '');
    var content = stripPortableTitle(post, post.content || '');
    var source = summary || content;
    var normalized = normalize(source);
    var queryIndex = normalized.indexOf(normalize(query));
    var start = queryIndex > 60 ? queryIndex - 60 : 0;
    var snippet = source.slice(start, start + 180).trim();

    if (start > 0) snippet = '...' + snippet;
    if (source.length > start + snippet.length) snippet += '...';
    return snippet;
  }

  function clearResults() {
    results.hidden = true;
    results.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    cancel.hidden = true;
  }

  function renderResults(matches, query) {
    cancel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    results.hidden = false;

    if (matches.length === 0) {
      results.innerHTML = '<p class="site-search-empty">No results found.</p>';
      return;
    }

    results.innerHTML = matches.slice(0, 8).map(function (post) {
      var excerpt = makeExcerpt(post, query);
      var tags = (post.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join(' ');

      return [
        '<a class="site-search-result" href="' + escapeHtml(post.url) + '">',
          '<span class="site-search-result-title">' + escapeHtml(post.title) + '</span>',
          '<span class="site-search-result-meta">' + escapeHtml(post.date) + (tags ? ' · ' + tags : '') + '</span>',
          excerpt ? '<span class="site-search-result-excerpt">' + escapeHtml(excerpt) + '</span>' : '',
        '</a>'
      ].join('');
    }).join('');
  }

  function runSearch() {
    var query = input.value.trim();
    var normalizedQuery = normalize(query);

    if (!query) {
      clearResults();
      return;
    }

    var terms = normalizedQuery.split(/\s+/).filter(Boolean);
    var matches = posts.map(function (post) {
      var haystack = normalize([
        post.title,
        post.date,
        post.section,
        (post.tags || []).join(' '),
        post.summary,
        post.content
      ].join(' '));
      var score = 0;
      var title = normalize(post.title);

      for (var i = 0; i < terms.length; i += 1) {
        if (haystack.indexOf(terms[i]) === -1) return null;
        score += title.indexOf(terms[i]) !== -1 ? 4 : 1;
      }

      return { post: post, score: score };
    }).filter(Boolean).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return b.post.timestamp - a.post.timestamp;
    }).map(function (item) {
      return item.post;
    });

    renderResults(matches, query);
  }

  function loadIndex() {
    if (indexLoaded) return Promise.resolve();

    return fetch(indexUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('Search index failed to load.');
        return response.json();
      })
      .then(function (data) {
        posts = data;
        indexLoaded = true;
      });
  }

  input.addEventListener('input', function () {
    loadIndex().then(runSearch).catch(function () {
      results.hidden = false;
      results.innerHTML = '<p class="site-search-empty">Search is unavailable.</p>';
    });
  });

  input.addEventListener('focus', function () {
    if (input.value.trim()) {
      loadIndex().then(runSearch);
    }
  });

  cancel.addEventListener('click', function () {
    input.value = '';
    clearResults();
    input.focus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      input.value = '';
      clearResults();
      input.blur();
    }
  });

  document.addEventListener('click', function (event) {
    if (!root.contains(event.target) && input.value.trim() === '') {
      clearResults();
    }
  });
}());

(function () {
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var timer = null;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function moveSpotlight() {
    if (reducedMotion && reducedMotion.matches) return;

    var duration = Math.round(randomBetween(5600, 9200));
    sidebar.style.setProperty('--sidebar-spotlight-duration', duration + 'ms');
    sidebar.style.setProperty('--sidebar-spotlight-x', randomBetween(8, 92).toFixed(1) + '%');
    sidebar.style.setProperty('--sidebar-spotlight-y', randomBetween(6, 94).toFixed(1) + '%');
    sidebar.style.setProperty('--sidebar-spotlight-scale', randomBetween(.88, 1.18).toFixed(2));

    timer = window.setTimeout(moveSpotlight, duration + Math.round(randomBetween(350, 1200)));
  }

  function startSpotlight() {
    clearTimer();

    if (reducedMotion && reducedMotion.matches) {
      sidebar.style.setProperty('--sidebar-spotlight-x', '72%');
      sidebar.style.setProperty('--sidebar-spotlight-y', '18%');
      sidebar.style.setProperty('--sidebar-spotlight-scale', '1');
      return;
    }

    window.setTimeout(moveSpotlight, 320);
  }

  startSpotlight();

  if (reducedMotion && reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', startSpotlight);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimer();
    } else {
      startSpotlight();
    }
  });
}());
