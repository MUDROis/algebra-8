/* Общий JS курса «Алгебра 8 класс» */
(function () {
  'use strict';

  function renderKatexIfPresent() {
    if (window.renderMathInElement && document.querySelector('.math')) {
      try {
        window.renderMathInElement(document.body, {
          delimiters: [{ left: '\\(', right: '\\)', display: false }],
          throwOnError: false,
          strict: 'ignore'
        });
      } catch (e) {
        if (window.console && console.error) console.error('KaTeX render error:', e);
      }
    }
  }

  function initSearch() {
    var box = document.getElementById('course-search');
    if (!box) return;
    box.addEventListener('input', function () {
      var q = box.value.trim().toLowerCase();
      var items = document.querySelectorAll('.lesson-item');
      for (var i = 0; i < items.length; i++) {
        var txt = (items[i].textContent || '').toLowerCase();
        items[i].classList.toggle('hidden', !!q && txt.indexOf(q) === -1);
      }
    });
  }

  function initToc() {
    var headings = Array.prototype.slice.call(document.querySelectorAll('h2'))
      .filter(function (h) { return !h.closest || !h.closest('.chapter-header'); });
    if (headings.length < 2) return;
    var toc = document.createElement('div');
    toc.className = 'toc-sidebar';
    var h3 = document.createElement('h3');
    h3.textContent = 'Содержание';
    toc.appendChild(h3);
    headings.forEach(function (h, idx) {
      h.id = h.id || ('sec-' + (idx + 1));
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.dataset.target = h.id;
      toc.appendChild(a);
    });
    document.body.appendChild(toc);
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    function setActive(id) {
      links.forEach(function (a) { a.classList.toggle('active', a.dataset.target === id); });
    }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-40% 0px -50% 0px' });
      headings.forEach(function (h) { obs.observe(h); });
    }
  }

  function initContentsWidget() {
    var chapters = document.querySelectorAll('.chapter');
    if (!chapters.length) return;

    var widget = document.createElement('div');
    widget.className = 'contents-widget';
    var title = document.createElement('h2');
    title.textContent = '📑 Содержание курса';
    widget.appendChild(title);

    chapters.forEach(function (chapter) {
      var h2 = chapter.querySelector('.chapter-header h2');
      if (!h2) return;
      var det = document.createElement('details');
      det.open = true;
      var sum = document.createElement('summary');
      sum.textContent = h2.textContent;
      det.appendChild(sum);

      var body = document.createElement('div');
      body.className = 'cw-body';
      var sections = chapter.querySelectorAll('.section');
      sections.forEach(function (section) {
        var st = section.querySelector('.section-title');
        if (!st) return;
        var stDiv = document.createElement('div');
        stDiv.className = 'cw-section';
        stDiv.textContent = st.textContent;
        body.appendChild(stDiv);

        var ul = document.createElement('ul');
        var items = section.querySelectorAll('.lesson-item');
        items.forEach(function (item) {
          var a = item.querySelector('a.btn[href]');
          var ltitle = item.querySelector('.lesson-title');
          var num = item.querySelector('.lesson-number');
          var li = document.createElement('li');
          if (a) {
            var link = document.createElement('a');
            link.href = a.getAttribute('href');
            var label = (num ? num.textContent + ' ' : '') + (ltitle ? ltitle.textContent : '');
            link.textContent = label.replace(/\s+/g, ' ').trim();
            li.appendChild(link);
          } else {
            li.textContent = (ltitle ? ltitle.textContent : '').replace(/\s+/g, ' ').trim();
          }
          ul.appendChild(li);
        });
        body.appendChild(ul);
      });

      det.appendChild(body);
      widget.appendChild(det);
    });

    // вставить после поиска или в начало контейнера
    var container = document.querySelector('.container');
    var search = document.getElementById('course-search');
    if (container) {
      if (search && search.closest('.container')) {
        search.closest('div').after(widget);
      } else {
        container.prepend(widget);
      }
    }
  }

  function initSelfCheck() {
    var core = window.CourseAnswerCore;
    if (!core) return;
    var btns = document.querySelectorAll('.check-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        function run() {
          var row = btn.closest ? btn.closest('.check-row') : null;
          if (!row) return;
          var input = row.querySelector('.check-input');
          var fb = row.querySelector('.check-feedback');
          if (!input || !fb) return;
          var ok = core.checkAnswer(input.value, input.getAttribute('data-answer') || '');
          fb.classList.remove('ok', 'bad');
          fb.textContent = ok ? '✅ Верно!' : '❌ Попробуй ещё';
          fb.classList.add(ok ? 'ok' : 'bad');
        }
        btn.addEventListener('click', run);
        var input = btn.previousElementSibling;
        if (input && input.classList && input.classList.contains('check-input')) {
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); run(); }
          });
        }
      })(btns[i]);
    }
  }

  window.Course = {
    init: function () {
      renderKatexIfPresent();
      initContentsWidget();
      initSearch();
      initToc();
      initSelfCheck();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.Course.init(); });
  } else {
    window.Course.init();
  }
})();
