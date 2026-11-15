/* Reveal fallback: adds the same `is-visible` class the template expects,
   in case the original scroll observer misses an element. */
(function () {
  'use strict';
  var nodes = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!nodes.length) return;

  function show(el) { el.classList.add('is-visible'); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  } else {
    nodes.forEach(show);
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(show);
    }, 2500);
  });
})();
