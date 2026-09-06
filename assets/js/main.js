/* Cubevia — site behaviour. No dependencies, no build step. */
(function () {
  'use strict';

  /* ---------------------------------------------------- mobile nav */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.click(); }
    });
  }

  /* ------------------------------------------- header shadow on scroll */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------- reveal on scroll */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------- the year */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* ------------------------------------------------------ quote form */
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
    var required = form.querySelectorAll('[required]');
    var firstBad = null;

    required.forEach(function (input) {
      var bad = !input.checkValidity();
      markField(input, bad);
      if (bad && !firstBad) { firstBad = input; }
    });

    if (firstBad) {
      e.preventDefault();
      setStatus('Please check the highlighted fields and try again.', 'err');
      firstBad.focus();
      return;
    }

    // If the endpoint has not been configured yet, say so rather than
    // sending the visitor to a broken page.
    var key = form.querySelector('[name="access_key"]');
    if (key && key.value.indexOf('PASTE-YOUR') === 0) {
      e.preventDefault();
      setStatus('This form is not connected yet. See step 4 of README.md.', 'err');
      return;
    }

    // Submit in the background so the visitor stays on the page.
    if (!window.fetch) { return; }
    e.preventDefault();

    var button = form.querySelector('button[type="submit"]');
    var original = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    setStatus('');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) { throw new Error('Request failed with status ' + res.status); }
        form.reset();
        setStatus('Thank you. Your request is with us and we will reply by email shortly.', 'ok');
      })
      .catch(function () {
        setStatus('Something went wrong sending that. Please email contact@cubevia.com instead.', 'err');
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = original;
      });
  });
})();
