/* Briefing Breakpoint · Etic Training — Agência Quebra */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Menu ---------- */
  var header = $(".header");
  var nav = $("#nav");
  var burger = $(".burger");
  function closeNav() {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menu");
  }
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Barra de progresso, tema do header e link ativo ---------- */
  var progress = $(".progress");
  var dark = $("#breakpoint");
  var links = $$(".nav a[href^='#']");
  var targets = links.map(function (a) { return $(a.getAttribute("href")); });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    header.classList.toggle("is-scrolled", y > 8);
    var r = dark.getBoundingClientRect();
    var h = header.offsetHeight;
    header.classList.toggle("theme-dark", r.top <= h / 2 && r.bottom > h / 2);
    var current = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= h + 40) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Revelação ao rolar ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
  /* escalonamento dentro de grupos */
  $$("[data-stagger]").forEach(function (group) {
    $$(".reveal", group).forEach(function (el, i) { el.style.setProperty("--delay", (i % 6) * 0.07 + "s"); });
  });

  /* ---------- Realce cruzado (ecossistema e território) ---------- */
  function linkHighlight(rootSel, itemSel, attr) {
    var root = $(rootSel);
    if (!root) return;
    $$(itemSel, root).forEach(function (item) {
      var key = item.getAttribute(attr);
      function on() {
        root.setAttribute("data-active", key);
        $$(itemSel, root).forEach(function (o) { o.classList.toggle("is-on", o === item); });
      }
      function off() {
        root.removeAttribute("data-active");
        item.classList.remove("is-on");
      }
      item.addEventListener("mouseenter", on);
      item.addEventListener("focus", on);
      item.addEventListener("mouseleave", off);
      item.addEventListener("blur", off);
      item.addEventListener("click", on);
    });
  }
  linkHighlight(".eco", "[data-layer]", "data-layer");
  linkHighlight(".terr", "[data-dim]", "data-dim");

  /* ---------- Navegação dos tópicos da proposta ---------- */
  $$(".stepnav a").forEach(function (a) {
    a.addEventListener("click", function () {
      var t = $(a.getAttribute("href"));
      if (t && t.tagName === "DETAILS") t.open = true;
    });
  });
  /* abre o <details> quando a âncora aponta para ele */
  function openFromHash() {
    var t = location.hash && $(location.hash);
    if (t && t.tagName === "DETAILS") t.open = true;
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- Gráfico de linhas: novos residentes (R1) ---------- */
  (function () {
    var el = $("#chart-r1");
    if (!el) return;
    var years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    var series = [
      { name: "Ortopedia e traumatologia", cls: "1", data: [852, 858, 826, 751, 804, 864, 948] },
      { name: "Neurocirurgia", cls: "2", data: [131, 136, 133, 125, 136, 142, 141] }
    ];
    var W = 640, H = 340, m = { t: 24, r: 20, b: 34, l: 40 };
    var max = 1000;
    var x = function (i) { return m.l + (i * (W - m.l - m.r)) / (years.length - 1); };
    var y = function (v) { return H - m.b - (v / max) * (H - m.t - m.b); };
    var s = "";
    [0, 250, 500, 750, 1000].forEach(function (v) {
      s += '<line class="grid-l" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
      s += '<text class="axis" x="' + (m.l - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + "</text>";
    });
    years.forEach(function (yr, i) {
      s += '<text class="axis" x="' + x(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + yr + "</text>";
    });
    series.forEach(function (se) {
      var d = se.data.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
      var len = 0;
      se.data.forEach(function (v, i) {
        if (i) len += Math.hypot(x(i) - x(i - 1), y(v) - y(se.data[i - 1]));
      });
      s += '<path class="line s' + se.cls + '" style="--len:' + Math.ceil(len) + '" d="' + d + '"/>';
      se.data.forEach(function (v, i) {
        s += '<circle class="dot d' + se.cls + '" cx="' + x(i) + '" cy="' + y(v) + '" r="5"><title>' + se.name + " · " + years[i] + ": " + v + "</title></circle>";
        s += '<text class="val" x="' + x(i) + '" y="' + (y(v) - 12) + '">' + v + "</text>";
      });
    });
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    el.innerHTML = s;
  })();

  /* ---------- Hero: malha tridimensional animada com GSAP ---------- */
  (function () {
    var canvas = $(".hero-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    /* estado controlado pelo GSAP */
    var st = { rot: -0.5, tilt: 0.34, build: 0, scan: -1.2, px: 0, py: 0, alpha: 1 };

    /* Geometria: um arco em malha, como uma placa de fixação curvada.
       Abstrato de propósito: remete a implante, planejamento cirúrgico e leitura 3D. */
    var COLS = 46, ROWS = 7, ARC = Math.PI * 1.25;
    var pts = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var u = c / (COLS - 1) - 0.5;
        var v = r / (ROWS - 1) - 0.5;
        var a = u * ARC;
        var rad = 1 + 0.1 * Math.cos(a * 2) + v * 0.1;
        pts.push({
          x: Math.sin(a) * rad,
          y: v * 0.62 + 0.16 * Math.cos(a * 1.5) - 0.05,
          z: Math.cos(a) * rad - 0.35,
          c: c, r: r,
          hole: r % 2 === 1 && c % 4 === 2,
          sx: 0, sy: 0, d: 0
        });
      }
    }
    var P = function (c, r) { return pts[r * COLS + c]; };

    function resize() {
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function project() {
      var wide = W > 860;
      var scale = Math.min(W, H) * (wide ? 0.5 : 0.48);
      var cx = wide ? W * 0.72 : W * 0.6;
      var cy = wide ? H * 0.4 : H * 0.3;
      var ry = st.rot + st.px * 0.25, rx = st.tilt + st.py * 0.15;
      var cyR = Math.cos(ry), syR = Math.sin(ry), cxR = Math.cos(rx), sxR = Math.sin(rx);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x = p.x * cyR + p.z * syR;
        var z = -p.x * syR + p.z * cyR;
        var y = p.y * cxR - z * sxR;
        z = p.y * sxR + z * cxR;
        var f = 3.2 / (3.2 + z);
        p.sx = cx + x * scale * f;
        p.sy = cy + y * scale * f;
        p.d = f;
      }
    }

    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      project();
      var visibleCols = st.build * (COLS + 6);
      ctx.lineWidth = 1;
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var p = P(c, r);
          var k = Math.max(0, Math.min(1, visibleCols - c));
          if (k <= 0) continue;
          var depth = Math.max(0, Math.min(1, (p.d - 0.7) / 0.6));
          var u = c / (COLS - 1) * 2 - 1;
          var glow = Math.max(0, 1 - Math.abs(u - st.scan) * 5);
          var base = (0.1 + depth * 0.4) * k * st.alpha;
          /* arestas */
          ctx.strokeStyle = glow > 0.05
            ? "rgba(140,180,0," + Math.min(1, base + glow * 0.6) + ")"
            : "rgba(84,101,36," + base + ")";
          ctx.beginPath();
          if (c + 1 < COLS) { var q = P(c + 1, r); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); }
          if (r + 1 < ROWS) {
            var d1 = P(c, r + 1); ctx.moveTo(p.sx, p.sy); ctx.lineTo(d1.sx, d1.sy);
            if ((c + r) % 2 === 0 && c + 1 < COLS) { var d2 = P(c + 1, r + 1); ctx.moveTo(p.sx, p.sy); ctx.lineTo(d2.sx, d2.sy); }
          }
          ctx.stroke();
          /* nós */
          var size = (p.hole ? 5.5 : 1.5) * p.d;
          if (p.hole) {
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, size, 0, 6.2832);
            ctx.fillStyle = "rgba(249,251,230," + k + ")";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = glow > 0.05 ? "rgba(168,214,0," + (0.5 + glow * 0.5) * k + ")" : "rgba(84,101,36," + (0.25 + depth * 0.55) * k * st.alpha + ")";
            ctx.stroke();
            ctx.lineWidth = 1;
            if (glow > 0.3) {
              ctx.beginPath(); ctx.arc(p.sx, p.sy, size * 0.42, 0, 6.2832);
              ctx.fillStyle = "rgba(193,244,28," + glow * k + ")"; ctx.fill();
            }
          } else {
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, size + glow * 1.6, 0, 6.2832);
            ctx.fillStyle = glow > 0.05 ? "rgba(168,214,0," + Math.min(1, 0.4 + glow) * k + ")" : "rgba(84,101,36," + (0.2 + depth * 0.6) * k * st.alpha + ")";
            ctx.fill();
          }
        }
      }
      /* linha de leitura (scanner) com marcações de medida */
      if (st.build >= 1 && st.scan > -1.05 && st.scan < 1.05) {
        var ci = Math.max(0, Math.min(COLS - 1, Math.round((st.scan + 1) / 2 * (COLS - 1))));
        var top = P(ci, 0), bot = P(ci, ROWS - 1);
        var dx = bot.sx - top.sx, dy = bot.sy - top.sy;
        ctx.strokeStyle = "rgba(168,214,0,0.55)";
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(top.sx - dx * 0.35, top.sy - dy * 0.35);
        ctx.lineTo(bot.sx + dx * 0.35, bot.sy + dy * 0.35);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    window.addEventListener("resize", resize);
    resize();

    var hasGsap = typeof window.gsap !== "undefined";
    if (reduce || !hasGsap) {
      st.build = 1; st.scan = 0.2; draw();
      return;
    }
    var gsap = window.gsap;
    gsap.ticker.add(draw);

    /* entrada */
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero .eyebrow", { y: 16, opacity: 0, duration: 0.7 })
      .from(".hero h1 span", { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }, "-=0.4")
      .from(".hero-meta .tag", { y: 12, opacity: 0, duration: 0.5, stagger: 0.07 }, "-=0.6")
      .from(".hero-read", { y: 28, opacity: 0, duration: 0.9 }, "-=0.7")
      .from(".door", { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, clearProps: "transform,opacity" }, "-=0.6")
      .to(st, { build: 1, duration: 2.6, ease: "power2.inOut" }, 0.1)
      .fromTo(st, { rot: -1.1 }, { rot: -0.35, duration: 3.2, ease: "power2.out" }, 0);

    /* movimento contínuo */
    gsap.to(st, { rot: 0.35, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3.2 });
    gsap.to(st, { tilt: 0.22, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.fromTo(st, { scan: -1.2 }, { scan: 1.2, duration: 5.5, ease: "none", repeat: -1, repeatDelay: 1.2, delay: 2.6 });

    /* paralaxe com o ponteiro */
    var toX = gsap.quickTo(st, "px", { duration: 1.2, ease: "power3.out" });
    var toY = gsap.quickTo(st, "py", { duration: 1.2, ease: "power3.out" });
    hero.addEventListener("pointermove", function (e) {
      var b = hero.getBoundingClientRect();
      toX((e.clientX - b.left) / b.width - 0.5);
      toY((e.clientY - b.top) / b.height - 0.5);
    });

    /* pausa quando o hero sai da tela */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) gsap.ticker.add(draw); else gsap.ticker.remove(draw);
      }).observe(hero);
    }
  })();
})();
