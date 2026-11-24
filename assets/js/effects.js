/* Cubevia motion effects.

   Plain-JavaScript ports of patterns from motion-primitives (MIT License,
   Copyright (c) 2024 ibelick, https://motion-primitives.com), running on the
   self-hosted Motion library (MIT, https://motion.dev). No build step.

     TextEffect        hero headline, word by word, preset "fade-in-blur"
     TextShimmerWave   slow gold sheen travelling across the gold words
     InfiniteSlider    the services marquee under the hero, slows on hover
     Scroll reveal     statement words brighten as you scroll through them
     AnimatedGroup     AI workflow steps, preset "blur-slide"
     Parallax          hero photo and statement photos drift with scroll

   The services carousel and expanded card view are in main.js, so they work
   even if this file never runs. If Motion fails to load, or the visitor
   prefers reduced motion, this file does nothing and every element is shown
   in its finished state. */
(function () {
  'use strict';

  var root = document.documentElement;
  var M = window.Motion;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!M || reduce) { root.classList.remove('fx'); return; }
  window.__cubeviaFx = true;
  root.classList.add('fx');

  var animate = M.animate, inView = M.inView, stagger = M.stagger, scroll = M.scroll;
  var EASE = [0.22, 0.61, 0.36, 1];

  function splitWords(el, cls) {
    var words = [];
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    text.split(' ').forEach(function (w, i) {
      if (i) { el.appendChild(document.createTextNode(' ')); }
      var s = document.createElement('span');
      s.className = cls;
      s.textContent = w;
      el.appendChild(s);
      words.push(s);
    });
    return words;
  }

  /* ------------------------------------------- TextEffect + TextShimmerWave */
  var h1 = document.querySelector('[data-text-effect]');
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    var all = [], gold = [];
    h1.querySelectorAll('.line').forEach(function (line) {
      line.setAttribute('aria-hidden', 'true');
      line.classList.add('split');
      var w = splitWords(line, 'te-word');
      all = all.concat(w);
      if (line.classList.contains('gold-text')) { gold = gold.concat(w); }
    });
    animate(all, { opacity: [0, 1], y: [28, 0], filter: ['blur(12px)', 'blur(0px)'] },
      { duration: 0.8, ease: EASE, delay: stagger(0.07, { startDelay: 0.2 }) });
    if (gold.length) {
      animate(gold, { backgroundPosition: ['0% 50%', '100% 50%'] },
        { duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', delay: stagger(0.18, { startDelay: 1.2 }) });
    }
  }

  var giant = document.querySelector('.footer-giant');
  if (giant) {
    animate(giant, { backgroundPosition: ['0% 50%', '100% 50%'] },
      { duration: 6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' });
  }

  /* ---------------------------------------------------------------- parallax */
  var hero = document.querySelector('.hero');
  var heroImg = document.getElementById('heroImg');
  if (hero && heroImg) {
    scroll(animate(heroImg, { y: ['0%', '10%'], scale: [1.04, 1.12] }, { ease: 'linear' }),
      { target: hero, offset: ['start start', 'end start'] });
  }
  var media = document.querySelector('.statement-media');
  if (media) {
    var a = media.querySelector('.frame-a'), b = media.querySelector('.frame-b');
    if (a) { scroll(animate(a, { y: [40, -30] }, { ease: 'linear' }), { target: media, offset: ['start end', 'end start'] }); }
    if (b) { scroll(animate(b, { y: [90, -60] }, { ease: 'linear' }), { target: media, offset: ['start end', 'end start'] }); }
  }

  /* ---------------------------------------------------------- InfiniteSlider */
  function infiniteSlider(el) {
    var track = el.firstElementChild;
    if (!track) { return; }
    var count = track.children.length;
    var speed = Number(el.getAttribute('data-speed')) || 50;
    var hoverSpeed = Number(el.getAttribute('data-speed-hover')) || speed;
    var controls = null, rate = 1, rateAnim = null, visible = false;

    Array.prototype.slice.call(track.children).forEach(function (item) {
      var c = item.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
    });
    el.classList.add('is-rolling');

    function start() {
      if (controls) { controls.stop(); }
      var dist = track.children[count].offsetLeft - track.children[0].offsetLeft;
      if (dist <= 0) { return; }
      controls = animate(track, { x: [0, -dist] }, { duration: dist / speed, ease: 'linear', repeat: Infinity });
      controls.speed = rate;
      if (!visible) { controls.pause(); }
    }
    function setRate(target) {
      if (rateAnim) { rateAnim.stop(); }
      rateAnim = animate(rate, target, { duration: 0.6, ease: 'easeOut',
        onUpdate: function (v) { rate = v; if (controls) { controls.speed = v; } } });
    }
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { setRate(hoverSpeed / speed); } });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { setRate(1); } });
    inView(el, function () {
      visible = true; if (controls) { controls.play(); }
      return function () { visible = false; if (controls) { controls.pause(); } };
    });
    var lastW = 0, t = null;
    if ('ResizeObserver' in window) {
      new ResizeObserver(function (en) {
        var w = Math.round(en[0].contentRect.width); if (w === lastW) { return; }
        lastW = w; clearTimeout(t); t = setTimeout(start, 150);
      }).observe(el);
    }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(start); } else { start(); }
  }
  document.querySelectorAll('[data-infinite-slider]').forEach(infiniteSlider);

  /* ---------------------------------------------------- statement scroll reveal */
  var statement = document.querySelector('[data-scroll-words]');
  if (statement) {
    var words = splitWords(statement, 'sw');
    var n = words.length;
    words.forEach(function (w) { w.style.opacity = '0.16'; });
    scroll(function (p) {
      var pos = p * (n + 4);
      for (var i = 0; i < n; i++) {
        var v = Math.max(0, Math.min(1, (pos - i) / 4));
        words[i].style.opacity = (0.16 + 0.84 * v).toFixed(3);
      }
    }, { target: statement, offset: ['start 85%', 'end 45%'] });
  }

  /* ----------------------------------------------------- AI workflow steps */
  var flow = document.getElementById('aiFlow');
  if (flow) {
    var fill = document.createElement('span');
    fill.className = 'flow-fill';
    fill.setAttribute('aria-hidden', 'true');
    flow.insertBefore(fill, flow.firstChild);
    scroll(animate(fill, { scaleY: [0, 1] }, { ease: 'linear' }), { target: flow, offset: ['start 75%', 'end 60%'] });

    flow.querySelectorAll('li').forEach(function (li) {
      inView(li, function () {
        if (li.dataset.shown) { return; }
        li.dataset.shown = '1';
        animate(li, { opacity: [0, 1], x: [24, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.7, ease: EASE });
      }, { amount: 0.4 });
    });
  }
})();
