// Immersive layer: scroll reveals, hero parallax, cursor glow, panel
// spotlight, scroll progress, text "decrypt", menu stagger.
// Every effect honours prefers-reduced-motion and degrades to a fully
// visible static page if JS fails (gated behind body.fx-on).
(function () {
  var body = document.body;
  var docEl = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  body.classList.add("fx-on");

  /* ---------- stagger indices ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) {
      c.style.setProperty("--rd", (i * 0.09).toFixed(2) + "s");
    });
  });
  document.querySelectorAll(".menu-nav a").forEach(function (a, i) {
    a.style.setProperty("--i", i);
  });

  /* ---------- scroll: progress bar + hero parallax ---------- */
  var bar = document.getElementById("scrollProgress");
  var heroBg = document.querySelector(".hero-bg");
  var fig = document.querySelector(".figure");
  var scrolldown = document.querySelector(".scrolldown");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var sc = window.scrollY || docEl.scrollTop || 0;
      var max = Math.max(1, docEl.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = "scaleX(" + Math.min(1, sc / max).toFixed(4) + ")";
      if (scrolldown) scrolldown.style.opacity = Math.max(0, 1 - sc / 320).toFixed(2);
      if (!reduce && sc < window.innerHeight * 1.25) {
        if (heroBg) heroBg.style.setProperty("--pb", (sc * 0.16).toFixed(1) + "px");
        if (fig) fig.style.setProperty("--pf", (sc * -0.05).toFixed(1) + "px");
      }
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- text decrypt ---------- */
  var GL = "アカサタナハマヤラワ0123456789#$%&<>/\\=+*";
  function decrypt(el) {
    if (reduce || !el || el.dataset.decrypted) return;
    el.dataset.decrypted = "1";
    var final = el.textContent;
    var n = final.length;
    var total = Math.min(26, Math.max(12, Math.round(n * 1.6)));
    var frame = 0;
    var iv = setInterval(function () {
      frame++;
      var settled = Math.ceil(n * (frame / total));
      var out = "";
      for (var i = 0; i < n; i++) {
        out += (i < settled || final[i] === " ") ? final[i] : GL[(Math.random() * GL.length) | 0];
      }
      el.textContent = out;
      if (frame >= total) { el.textContent = final; clearInterval(iv); }
    }, 36);
  }
  // hero name decrypts on load, line by line
  setTimeout(function () { decrypt(document.querySelector("h1.name .l1")); }, 350);
  setTimeout(function () { decrypt(document.querySelector("h1.name .l2")); }, 680);

  /* ---------- stat count-up ---------- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    if (reduce) return;
    var txt = el.textContent;
    var m = txt.match(/\d+/);
    if (!m) return;
    var target = parseInt(m[0], 10);
    var pre = txt.slice(0, m.index);
    var post = txt.slice(m.index + m[0].length);
    var t0 = null, dur = 1100;
    function fr(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * p) + post;
      if (p < 1) requestAnimationFrame(fr);
    }
    requestAnimationFrame(fr);
  }

  /* ---------- scroll reveals ---------- */
  var items = document.querySelectorAll(".reveal");
  function settle(el) {
    el.classList.add("settled");
  }
  function markIn(el) {
    el.classList.add("in");
    if (el.hasAttribute("data-scramble")) decrypt(el.querySelector("h2"));
    el.querySelectorAll(".stat .v").forEach(countUp);
    // once the entrance transition finishes, swap to a fast transition so
    // hover "pops" feel snappy (fallback timer in case transitionend is lost)
    var done = false;
    var finish = function () { if (!done) { done = true; settle(el); } };
    el.addEventListener("transitionend", function h(ev) {
      if (ev.target === el && ev.propertyName === "transform") {
        el.removeEventListener("transitionend", h);
        finish();
      }
    });
    setTimeout(finish, 1800);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { markIn(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(markIn);
  }

  /* ---------- pointer spotlight on panels ---------- */
  if (fine) {
    document.addEventListener("pointermove", function (e) {
      var t = e.target.closest && e.target.closest(".card, .feature, .idcard, .stat");
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(2) + "%");
      t.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(2) + "%");
    }, { passive: true });
  }

  /* ---------- cursor glow (lerped, desktop only) ---------- */
  var glow = document.getElementById("cursorGlow");
  if (glow && fine && !reduce) {
    var gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, raf = null;
    var step = function () {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = "translate3d(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px,0)";
      if (Math.abs(tx - gx) > 0.4 || Math.abs(ty - gy) > 0.4) raf = requestAnimationFrame(step);
      else raf = null;
    };
    addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      body.classList.add("glow-active");
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      body.classList.remove("glow-active");
    });
  }

  /* ---------- flip cards (projects + ID badge) ---------- */
  var flips = document.querySelectorAll("[data-flip]");
  function syncFaces(card) {
    var flipped = card.classList.contains("flipped");
    var f = card.querySelector(".cardface.front, .idface.front");
    var b = card.querySelector(".cardface.back, .idface.back");
    if (f) f.inert = flipped;
    if (b) b.inert = !flipped;
  }
  flips.forEach(function (card) {
    syncFaces(card);
    function toggle(e) {
      if (e && e.target && e.target.closest && e.target.closest("a")) return;
      card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", String(card.classList.contains("flipped")));
      syncFaces(card);
    }
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    flips.forEach(function (c) {
      if (c.classList.contains("flipped")) {
        c.classList.remove("flipped");
        c.setAttribute("aria-pressed", "false");
        syncFaces(c);
      }
    });
  });
})();
