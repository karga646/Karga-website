/* Portada de karga.fit: animaciones e interacción del plan de ejemplo */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Coreografía de entrada del hero ── */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.documentElement.classList.add('is-ready'); });
  });

  /* ── Plan de ejemplo: definición / recomposición / volumen limpio ──
     Ejemplo ilustrativo para 75 kg con 18 % de grasa (proteína 2.0–2.2 g/kg).
     kcal = proteína×4 + carbos×4 + grasa×9 */
  var PLANES = {
    definicion:    { kcal: 2060, p: 165, c: 215, f: 60, i: 0, desc: 'Comes un poco menos de lo que gastas para bajar grasa sin perder músculo.' },
    recomposicion: { kcal: 2490, p: 160, c: 305, f: 70, i: 1, desc: 'Comes cerca de tu mantenimiento para ganar músculo y perder grasa a la vez.' },
    volumen:       { kcal: 2800, p: 150, c: 370, f: 80, i: 2, desc: 'Comes un poco más de lo que gastas para ganar músculo sin acumular grasa de más.' }
  };
  var MAX = { p: 200, c: 400, f: 100 };

  var plan = document.querySelector('[data-plan]');
  if (plan) {
    var kcalEl = plan.querySelector('[data-kcal]');
    var descEl = plan.querySelector('[data-desc]');
    var thumb = plan.querySelector('.thumb');
    var buttons = plan.querySelectorAll('.modes button');
    var current = { kcal: 0, p: 0, c: 0, f: 0 };

    function animateNumber(el, from, to, ms) {
      if (reduce) { el.textContent = to.toLocaleString('es-MX'); return; }
      var start = null;
      function step(t) {
        if (!start) start = t;
        var k = Math.min(1, (t - start) / ms);
        var e = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(from + (to - from) * e).toLocaleString('es-MX');
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function show(key, delay) {
      var d = PLANES[key];
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === key)); });
      thumb.style.transform = 'translateX(calc(' + d.i + ' * (100% + 3px)))';
      descEl.textContent = d.desc;
      setTimeout(function () {
        animateNumber(kcalEl, current.kcal, d.kcal, 900);
        ['p', 'c', 'f'].forEach(function (m) {
          var row = plan.querySelector('[data-m="' + m + '"]');
          animateNumber(row.querySelector('.val span'), current[m], d[m], 900);
          row.querySelector('.bar i').style.width = (d[m] / MAX[m] * 100).toFixed(1) + '%';
        });
        current = { kcal: d.kcal, p: d.p, c: d.c, f: d.f };
      }, delay || 0);
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.mode); });
    });
    show('definicion', reduce ? 0 : 1100);
  }

  /* ── Barra superior con borde al hacer scroll ── */
  var topbar = document.querySelector('.topbar');
  function onScroll() { topbar && topbar.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── Aparición de bloques al entrar en pantalla ── */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Línea de progreso de "Cómo funciona" ── */
  var steps = document.querySelector('.steps');
  if (steps) {
    var lis = steps.querySelectorAll('li');
    var ticking = false;
    function update() {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var mid = window.innerHeight * 0.55;
      var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      steps.style.setProperty('--p', p.toFixed(3));
      lis.forEach(function (li) { li.classList.toggle('on', li.getBoundingClientRect().top < mid); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update); update();
  }
})();
