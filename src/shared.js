/* Мир единоборств — общие скрипты: шапка, мобильное меню, появление блоков, слайдеры-ленты, аккордеоны */
(function () {
  if (window.__meShared) return;
  window.__meShared = true;
  /* Блок шапки стоит в Tilda раньше контента страницы — ждём, пока документ соберётся */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  function init() {
  var root = document;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  var header = root.querySelector('[data-me-header]');
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-solid', y > 24);
      var menuOpen = menu && menu.classList.contains('is-open');
      header.classList.toggle('is-hidden', !menuOpen && y > 480 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove('is-hidden');
      document.documentElement.classList.toggle('me-header-hidden', header.classList.contains('is-hidden'));
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  var burger = root.querySelector('[data-me-burger]');
  var menu = root.querySelector('[data-me-menu]');
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) header.classList.add('is-solid');
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* Current page in nav */
  var path = location.pathname.replace(/\/$/, '') || '/';
  root.querySelectorAll('.me-nav a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page');
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = root.querySelectorAll('.me-reveal');
  /* Проверка по скроллу, а не IntersectionObserver: при прыжке по якорю блок,
     пролетевший мимо экрана, тоже должен проявиться */
  if (!reduce) {
    var pending = Array.prototype.slice.call(reveals);
    document.querySelectorAll('.me').forEach(function (el) { el.classList.add('is-ready'); });
    var rTick = false;
    var check = function () {
      rTick = false;
      var limit = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('is-in'); return false; }
        return true;
      });
      if (!pending.length) { window.removeEventListener('scroll', onRevealScroll); window.removeEventListener('resize', onRevealScroll); }
    };
    var onRevealScroll = function () { if (!rTick) { rTick = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll);
    check();
  }

  /* ---------- Rails (coaches, reviews, gallery) ---------- */
  root.querySelectorAll('[data-me-rail-wrap]').forEach(function (wrap) {
    var rail = wrap.querySelector('[data-me-rail]');
    var prev = wrap.querySelector('[data-me-rail-prev]');
    var next = wrap.querySelector('[data-me-rail-next]');
    if (!rail) return;
    function step() {
      var item = rail.children[0];
      if (!item) return rail.clientWidth;
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return (item.getBoundingClientRect().width + gap) * Math.max(1, Math.floor(rail.clientWidth / (item.getBoundingClientRect().width + gap)));
    }
    function update() {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    rail.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Accordions: smooth height for <details> ---------- */
  root.querySelectorAll('details.me-acc').forEach(function (d) {
    var summary = d.querySelector('summary');
    var body = d.querySelector('.me-acc__body');
    if (!summary || !body || reduce) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.dataset.anim) return;
      d.dataset.anim = '1';
      if (!d.open) {
        d.open = true;
        var h = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' })
          .onfinish = function () { delete d.dataset.anim; };
      } else {
        var h2 = body.scrollHeight;
        body.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' })
          .onfinish = function () { d.open = false; delete d.dataset.anim; };
      }
    });
  });
  }
})();
