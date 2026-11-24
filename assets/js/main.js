/* Cubevia site behaviour: navigation, header, services carousel, expanded
   service view and the enquiry form. Works on its own with no libraries;
   the decorative motion lives in effects.js. No build step. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- mobile nav */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function setNav(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) { setNav(false); }
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
    });
  }

  /* ------------------------------------------- header style once scrolled */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------- the year */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* ---------------------------------------------------- services carousel */
  var track = document.getElementById('svcTrack');
  if (track) {
    var prev = document.querySelector('[data-carousel="prev"]');
    var next = document.querySelector('[data-carousel="next"]');
    var bar = document.getElementById('svcProgress');

    var step = function () {
      var card = track.querySelector('.svc');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 22;
      return card ? card.getBoundingClientRect().width + gap : 320;
    };
    var go = function (dir) {
      track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      if (prev) { prev.disabled = x <= 2; }
      if (next) { next.disabled = x >= max - 2; }
      if (bar) {
        var visible = track.clientWidth / track.scrollWidth;
        var p = max > 0 ? x / max : 1;
        bar.style.transform = 'scaleX(' + Math.min(1, visible + (1 - visible) * p).toFixed(4) + ')';
      }
    };

    if (prev) { prev.addEventListener('click', function () { go(-1); }); }
    if (next) { next.addEventListener('click', function () { go(1); }); }
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    update();

    // Drag to scroll with a mouse. Touch and trackpads scroll natively.
    var dragging = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) { return; }
      dragging = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) { return; }
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('dragging'); }
      if (moved) { track.scrollLeft = startLeft - dx; }
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) { return; }
      dragging = false;
      if (moved) {
        track.classList.remove('dragging');
        // Settle on the nearest card.
        var s = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* ------------------------------------------------ expanded service view */
  var dialog = document.getElementById('svcDialog');
  if (dialog && typeof dialog.showModal === 'function') {
    var dImg = document.getElementById('svcDialogImg');
    var dTitle = document.getElementById('svcDialogTitle');
    var dLede = document.getElementById('svcDialogLede');
    var dMore = document.getElementById('svcDialogMore');
    var dCta = document.getElementById('svcDialogCta');
    var dClose = document.getElementById('svcDialogClose');
    var select = document.getElementById('support');
    var activeCard = null;
    var canMorph = !!document.startViewTransition && !reduceMotion;

    var names = function (img, title, on) {
      img.style.viewTransitionName = on ? 'svc-media' : '';
      title.style.viewTransitionName = on ? 'svc-title' : '';
    };

    var open = function (card) {
      var item = card.closest('.svc');
      var img = card.querySelector('img');
      var title = card.querySelector('.svc-title');
      activeCard = card;

      var fill = function () {
        dImg.src = img.currentSrc || img.src;
        dTitle.textContent = title.textContent;
        dLede.textContent = card.querySelector('.svc-line').textContent;
        dMore.innerHTML = item.querySelector('.svc-more').innerHTML;
        dCta.setAttribute('data-support', item.getAttribute('data-support') || '');
        dialog.showModal();
      };

      if (!canMorph) { fill(); return; }
      names(img, title, true);
      var t = document.startViewTransition(function () {
        names(img, title, false);
        names(dImg, dTitle, true);
        fill();
      });
      t.finished.then(function () { names(dImg, dTitle, false); });
    };

    var close = function () {
      if (!dialog.open) { return; }
      var card = activeCard;
      if (!canMorph || !card) { dialog.close(); if (card) { card.focus(); } return; }
      var img = card.querySelector('img');
      var title = card.querySelector('.svc-title');
      names(dImg, dTitle, true);
      var t = document.startViewTransition(function () {
        names(dImg, dTitle, false);
        names(img, title, true);
        dialog.close();
      });
      t.finished.then(function () { names(img, title, false); card.focus(); });
    };

    document.querySelectorAll('.svc-card').forEach(function (card) {
      card.addEventListener('click', function () { open(card); });
    });
    dClose.addEventListener('click', close);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) { close(); } });
    dCta.addEventListener('click', function () {
      var value = dCta.getAttribute('data-support');
      if (select && value) { select.value = value; }
      dialog.close();
    });
  }

  /* ---------------------------------------------------------- quote form */
  var form = document.getElementById('quoteForm');
  var status = document.getElementById('formStatus');
  if (!form || !status) { return; }

  var setStatus = function (msg, kind) {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  };
  var markField = function (input, bad) {
    var wrap = input.closest('.field');
    if (wrap) { wrap.classList.toggle('invalid', bad); }
  };

  form.addEventListener('input', function (e) {
    if (e.target.matches('input, select, textarea')) { markField(e.target, false); }
  });

  form.addEventListener('submit', function (e) {
    var firstBad = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      var bad = !input.checkValidity();
      markField(input, bad);
      if (bad && !firstBad) { firstBad = input; }
    });
    if (firstBad) {
      e.preventDefault();
      setStatus('Add your name and a valid work email, then send again.', 'err');
      firstBad.focus();
      return;
    }
    if (!window.fetch) { return; }
    e.preventDefault();

    var button = form.querySelector('button[type="submit"]');
    var label = button.querySelector('span') || button;
    var original = label.textContent;
    button.disabled = true;
    label.textContent = 'Sending…';
    setStatus('');

    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) { throw new Error('Request failed with status ' + res.status); }
        form.reset();
        setStatus('Thanks. Your enquiry is with us and we\'ll reply by email to arrange a call.', 'ok');
      })
      .catch(function () {
        setStatus('Your enquiry didn\'t send. Email contact@cubevia.com instead.', 'err');
      })
      .finally(function () {
        button.disabled = false;
        label.textContent = original;
      });
  });
})();
