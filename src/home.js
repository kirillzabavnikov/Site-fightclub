/* Главная: hero-«постер» с ударной сменой направлений + плавающий боец в списке направлений */
(function () {
  if (window.__meHome) return;
  window.__meHome = true;
  var root = document;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  var EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';
  var SHADOW = 'drop-shadow(0 30px 60px rgba(0,0,0,0.65))';

  /* =====================================================================
     HERO
     ===================================================================== */
  var hero = root.querySelector('[data-me-hero]');
  if (hero) (function () {
    var wordEl = hero.querySelector('[data-me-word]');
    var ring = hero.querySelector('[data-me-ring]');
    var slash = hero.querySelector('[data-me-slash]');
    var fightersWrap = hero.querySelector('[data-me-fighters]');
    var fighters = Array.prototype.slice.call(fightersWrap.querySelectorAll('img'));
    var tabsWrap = hero.querySelector('[data-me-tabs]');
    var tabs = Array.prototype.slice.call(tabsWrap.querySelectorAll('[role="tab"]'));
    var infos = Array.prototype.slice.call(hero.querySelectorAll('.me-hero__info'));
    var stage = hero.querySelector('.me-hero__stage');
    var current = 0;
    var busy = false;

    /* -- Build the giant word as per-letter spans and fit it to the stage -- */
    function buildWord(text) {
      wordEl.innerHTML = '';
      text.split('|').forEach(function (line) {
        var ln = document.createElement('span');
        ln.className = 'ln';
        Array.prototype.forEach.call(line, function (c) {
          var s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c === ' ' ? ' ' : c;
          ln.appendChild(s);
        });
        wordEl.appendChild(ln);
      });
      fitWord();
      return wordEl.querySelectorAll('.ch');
    }
    function fitWord() {
      var lines = wordEl.querySelectorAll('.ln');
      if (!lines.length) return;
      wordEl.style.fontSize = '100px';
      var widest = 0;
      lines.forEach(function (l) {
        l.style.display = 'inline-block';
        widest = Math.max(widest, l.getBoundingClientRect().width);
        l.style.display = '';
      });
      var cs = getComputedStyle(wordEl);
      var availW = wordEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var mobile = window.innerWidth <= 960;
      var availH = (mobile ? window.innerWidth * 0.78 : hero.clientHeight * 0.66) / (lines.length * 0.8);
      var size = Math.min(100 * availW / widest, availH, mobile ? 9999 : 420);
      wordEl.style.fontSize = Math.floor(size) + 'px';
    }

    /* -- Select tab / info -- */
    function setTab(i) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      var t = tabs[i];
      var l = t.offsetLeft - tabsWrap.clientWidth / 2 + t.clientWidth / 2;
      tabsWrap.scrollTo({ left: l, behavior: reduce ? 'auto' : 'smooth' });
      infos.forEach(function (el, k) { el.hidden = k !== i; el.classList.toggle('is-active', k === i); });
      if (!reduce && infos[i]) infos[i].animate(
        [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, delay: 180, easing: EASE_OUT, fill: 'backwards' }
      );
    }

    /* -- Entrance of letters: slam in from scale + blur -- */
    function slamIn(chars, delay) {
      Array.prototype.forEach.call(chars, function (c, k) {
        c.animate([
          { opacity: 0, transform: 'translateY(38%) scale(1.3)', filter: 'blur(14px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0px)' }
        ], { duration: 820, delay: delay + k * 38, easing: EASE_OUT, fill: 'backwards' });
      });
    }

    function impact(delay) {
      if (ring) ring.animate([
        { opacity: 0.95, transform: 'scale(0.5)' },
        { opacity: 0, transform: 'scale(1.18)' }
      ], { duration: 1100, delay: delay, easing: EASE_OUT });
      if (stage) stage.animate([
        { transform: 'translate(0,0)' },
        { transform: 'translate(5px,-3px)' },
        { transform: 'translate(-4px,2px)' },
        { transform: 'translate(2px,-1px)' },
        { transform: 'translate(0,0)' }
      ], { duration: 280, delay: delay, easing: 'linear' });
    }

    function goTo(i, dir) {
      i = (i + tabs.length) % tabs.length;
      if (i === current || busy) return;
      var prevIdx = current;
      current = i;
      setTab(i);

      if (reduce) {
        fighters.forEach(function (f, k) { f.classList.toggle('is-active', k === i); });
        buildWord(tabs[i].dataset.word);
        return;
      }
      busy = true;
      dir = dir || (i > prevIdx ? 1 : -1);

      /* 1. old letters scatter up */
      var oldChars = wordEl.querySelectorAll('.ch');
      var outDur = 260;
      Array.prototype.forEach.call(oldChars, function (c, k) {
        c.animate([
          { opacity: 1, transform: 'none', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translateY(-26%) scale(0.94)', filter: 'blur(8px)' }
        ], { duration: outDur, delay: k * 14, easing: EASE_OUT, fill: 'forwards' });
      });

      /* 2. red slash sweeps across */
      if (slash) slash.animate([
        { clipPath: dir > 0 ? 'polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)' : 'polygon(120% 0%, 120% 0%, 100% 100%, 100% 100%)' },
        { clipPath: 'polygon(0% 0%, 120% 0%, 100% 100%, -20% 100%)', offset: 0.5 },
        { clipPath: dir > 0 ? 'polygon(120% 0%, 120% 0%, 100% 100%, 100% 100%)' : 'polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)' }
      ], { duration: 560, easing: EASE_IN_OUT, composite: 'replace' });

      /* 3. fighters swap */
      var oldF = fighters[prevIdx], newF = fighters[i];
      oldF.animate([
        { opacity: 1, transform: 'none', filter: 'blur(0px) ' + SHADOW },
        { opacity: 0, transform: 'translateX(' + (-6 * dir) + '%) scale(0.97)', filter: 'blur(10px) ' + SHADOW }
      ], { duration: 340, easing: EASE_OUT, fill: 'forwards' }).onfinish = function () {
        oldF.classList.remove('is-active');
        oldF.getAnimations().forEach(function (a) { a.cancel(); });
      };
      newF.classList.add('is-active');
      newF.animate([
        { opacity: 0, transform: 'translateX(' + (9 * dir) + '%) scale(1.05)', filter: 'blur(12px) ' + SHADOW },
        { opacity: 1, transform: 'none', filter: 'blur(0px) ' + SHADOW }
      ], { duration: 900, delay: 200, easing: EASE_OUT, fill: 'backwards' });

      /* 4. new word slams in, with ring + micro-shake on impact */
      setTimeout(function () {
        var chars = buildWord(tabs[i].dataset.word);
        slamIn(chars, 0);
        impact(260);
        setTimeout(function () { busy = false; }, 420);
      }, outDur + 40);
    }

    /* -- Controls -- */
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { goTo(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = (k + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          busy = false; goTo(n); tabs[n].focus();
        }
      });
    });
    var prevBtn = hero.querySelector('[data-me-prev]');
    var nextBtn = hero.querySelector('[data-me-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1, -1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1, 1); });

    /* Swipe on touch */
    var sx = null, sy = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && !e.target.closest('[data-me-tabs]')) goTo(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      sx = null;
    }, { passive: true });

    /* -- Autoplay: driven by the progress bar's CSS animation, so pause = pause -- */
    if (reduce) {
      hero.classList.add('is-static');
    } else {
      hero.style.setProperty('--me-dur', '6500ms');
      tabsWrap.addEventListener('animationend', function (e) {
        if (e.animationName === 'me-progress') goTo(current + 1, 1);
      });
      var hovering = false, focused = false, offscreen = false;
      function syncPause() { hero.classList.toggle('is-paused', hovering || focused || offscreen); }
      var ui = hero.querySelector('.me-hero__ui');
      if (finePointer) {
        hero.querySelector('.me-hero__panel').addEventListener('pointerenter', function () { hovering = true; syncPause(); });
        hero.querySelector('.me-hero__panel').addEventListener('pointerleave', function () { hovering = false; syncPause(); });
        hero.querySelector('.me-hero__bar').addEventListener('pointerenter', function () { hovering = true; syncPause(); });
        hero.querySelector('.me-hero__bar').addEventListener('pointerleave', function () { hovering = false; syncPause(); });
      }
      ui.addEventListener('focusin', function () { focused = true; syncPause(); });
      ui.addEventListener('focusout', function () { focused = false; syncPause(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { offscreen = !en[0].isIntersecting; syncPause(); }, { threshold: 0.25 }).observe(hero);
      }
    }

    /* -- Pointer parallax: word and fighter move against each other -- */
    if (finePointer && !reduce) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function loop() {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        wordEl.style.transform = 'translate3d(' + (-cx * 18).toFixed(2) + 'px,' + (-cy * 10).toFixed(2) + 'px,0)';
        fightersWrap.style.transform = 'translate3d(' + (cx * 26).toFixed(2) + 'px,' + (cy * 12).toFixed(2) + 'px,0)';
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop); else raf = null;
      }
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    }

    /* -- Resize -- */
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fitWord, 120); });

    /* -- First paint: the entrance -- */
    var firstChars = buildWord(tabs[0].dataset.word);
    if (!reduce) {
      hero.classList.add('is-intro');
      Array.prototype.forEach.call(firstChars, function (c) { c.style.opacity = '0'; });
      fighters[0].style.opacity = '0';
      var start = function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            hero.classList.remove('is-intro');
            fitWord();
            Array.prototype.forEach.call(firstChars, function (c) { c.style.opacity = ''; });
            slamIn(firstChars, 380);
            fighters[0].style.opacity = '';
            fighters[0].animate([
              { opacity: 0, transform: 'translateY(6%) scale(1.06)', filter: 'blur(14px) ' + SHADOW },
              { opacity: 1, transform: 'none', filter: 'blur(0px) ' + SHADOW }
            ], { duration: 1200, delay: 560, easing: EASE_OUT, fill: 'backwards' });
            impact(760);
          });
        });
      };
      if (document.fonts && document.fonts.ready) {
        var done = false;
        document.fonts.ready.then(function () { if (!done) { done = true; start(); } });
        setTimeout(function () { if (!done) { done = true; start(); } }, 900);
      } else start();
    }
  })();

  /* =====================================================================
     DISCIPLINES: a fighter follows the cursor over the list
     ===================================================================== */
  var disc = root.querySelector('[data-me-disc]');
  if (disc && finePointer && !reduce) (function () {
    var img = disc.querySelector('[data-me-float]');
    var list = disc.querySelector('.me-disc__list');
    var x = 0, y = 0, cx = 0, cy = 0, raf = null, on = false;
    var cache = {};
    disc.querySelectorAll('[data-img]').forEach(function (a) {
      var pre = new Image(); pre.src = a.dataset.img; cache[a.dataset.img] = pre;
      a.addEventListener('pointerenter', function () {
        if (img.getAttribute('src') !== a.dataset.img) {
          img.src = a.dataset.img;
          img.animate([{ transform: 'translate3d(' + cx + 'px,' + cy + 'px,0) rotate(-6deg) scale(0.9)' }, { transform: 'translate3d(' + cx + 'px,' + cy + 'px,0) rotate(0) scale(1)' }], { duration: 400, easing: EASE_OUT });
        }
      });
    });
    function loop() {
      cx += (x - cx) * 0.14; cy += (y - cy) * 0.14;
      img.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      raf = on || Math.abs(x - cx) > 0.5 ? requestAnimationFrame(loop) : null;
    }
    list.addEventListener('pointermove', function (e) {
      x = e.clientX + 40; y = e.clientY - 300;
      if (!on) { cx = x; cy = y; }
      on = true; img.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener('pointerleave', function () { on = false; img.classList.remove('is-on'); });
    window.addEventListener('scroll', function () { if (on) { on = false; img.classList.remove('is-on'); } }, { passive: true });
  })();
})();
