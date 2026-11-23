/* Страница направления: вход заголовка, ленивые YouTube-видео, активный пункт подменю */
(function () {
  if (window.__meDisc) return;
  window.__meDisc = true;
  var root = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

  /* ---------- Hero: letters slam in ---------- */
  var hero = root.querySelector('.me-dhero');
  var word = root.querySelector('[data-me-letters]');
  if (hero && word && !reduce) {
    var text = word.textContent;
    word.textContent = '';
    word.setAttribute('aria-label', text);
    var chars = [];
    Array.prototype.forEach.call(text, function (c) {
      var s = document.createElement('span');
      s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      word.appendChild(s); chars.push(s);
    });
    hero.classList.add('is-intro');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.remove('is-intro');
        chars.forEach(function (c, k) {
          c.animate([
            { opacity: 0, transform: 'translateY(30%) scale(1.25)', filter: 'blur(14px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0px)' }
          ], { duration: 900, delay: 200 + k * 50, easing: EASE_OUT, fill: 'backwards' });
        });
      });
    });
  }

  /* ---------- YouTube: thumbnail first, iframe on click ---------- */
  root.querySelectorAll('[data-yt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-yt');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Видео';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.replaceWith((function () { var w = document.createElement('div'); w.className = 'me-video'; w.appendChild(f); return w; })());
    });
  });

  /* ---------- Sub nav: highlight current section ---------- */
  var links = Array.prototype.slice.call(root.querySelectorAll('[data-me-subnav] a[href^="#"]:not([href^="#popup"])'));
  var map = {};
  links.forEach(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) map[el.id] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); });
          var a = map[en.target.id];
          if (a) {
            a.classList.add('is-active');
            var bar = a.parentElement;
            bar.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }
  /* Smooth anchor scroll accounting for sticky bars */
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + el.id);
    });
  });
})();
