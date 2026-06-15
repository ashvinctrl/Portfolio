// Matrix "digital rain" — comet-trail style, tuned to feel slow & satisfying.
// Per-column speeds, bright glowing heads, long fading green tails.
// Colour comes from the canvas CSS props --rain / --rain-head so the Tweaks
// panel can recolour live. Density / speed come from data-* attributes.
(function () {
  const GLYPHS =
    "アァカサタナハマヤラワンイゥゴゲゼボォドベヂヅェォクグケゾ" +
    "ｱｲｳｴｵｶｷｸｹｺﾊﾐﾋｰｳｼﾅﾆﾇﾈﾎﾏﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ" +
    "日二三四五六七八九十百千万円時分秒月火水木金土" +
    "ΞΨΩΣΔΦΓΛΘΠ" +
    "0123456789" +
    ":.=*+-<>¦|╱╲#%&@$/\\{}[]^~_†‡●◦▪╳⟁⟆";
  const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const instances = [];
  const resizers = [];

  function makeRain(canvas) {
    const ctx = canvas.getContext("2d");
    let fontSize = 18, w = 0, h = 0, cols = 0;
    let y = [], spd = [], chars = [];

    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.max(1, Math.floor(r.width * dpr));
      h = canvas.height = Math.max(1, Math.floor(r.height * dpr));
      const density = parseFloat(canvas.dataset.density || "1");
      fontSize = Math.max(13, 21 * dpr) / density;
      cols = Math.max(1, Math.floor(w / fontSize));
      const rows = h / fontSize;
      y = new Array(cols); spd = new Array(cols); chars = new Array(cols);
      for (let i = 0; i < cols; i++) {
        y[i] = Math.random() * (rows + 40) - 20;     // seed across full height
        spd[i] = 0.30 + Math.random() * 0.55;        // organic per-column speed
        chars[i] = rnd();
      }
    }

    let frame = 0;
    function tick() {
      const speed = parseFloat(canvas.dataset.speed || "1");
      const cs = getComputedStyle(canvas);
      const rain = (cs.getPropertyValue("--rain").trim()) || "#2bd96a";
      const head = (cs.getPropertyValue("--rain-head").trim()) || "#d9ffe9";
      // gentle fade -> long satisfying trails
      ctx.fillStyle = "rgba(5,7,8,0.052)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "600 " + fontSize + "px 'Share Tech Mono', monospace";
      ctx.textBaseline = "top";
      frame++;
      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const yy = y[i] * fontSize;
        // mutate head glyph occasionally so it shimmers without strobing
        if ((frame + i * 3) % 9 === 0) chars[i] = rnd();
        // body glyph (green) — becomes the fading tail
        ctx.shadowBlur = 0;
        ctx.fillStyle = rain;
        ctx.globalAlpha = 0.85;
        ctx.fillText(chars[i], x, yy);
        // glowing bright head on top
        ctx.globalAlpha = 1;
        ctx.fillStyle = head;
        ctx.shadowColor = rain;
        ctx.shadowBlur = fontSize * 0.6;
        ctx.fillText(chars[i], x, yy);
        ctx.shadowBlur = 0;
        // advance (slow base step)
        y[i] += spd[i] * 0.82 * speed;
        if (yy > h && Math.random() > 0.97) {
          y[i] = Math.random() * -18;
          spd[i] = 0.30 + Math.random() * 0.55;
        }
      }
      ctx.globalAlpha = 1;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    instances.push(tick);
    resizers.push(resize);
  }

  let started = false;
  let running = true;        // pauses when tab hidden or hero off-screen
  let last = 0;
  const FRAME_MS = 33;       // ~30fps cap — plenty for rain, half the work of 60fps

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!running) return;
    if (ts - last < FRAME_MS) return;
    last = ts;
    for (const t of instances) t();
  }

  window.matrixReseed = function () { resizers.forEach((r) => r()); };

  window.initMatrixRain = function () {
    const canvases = document.querySelectorAll("canvas.matrix-rain");
    canvases.forEach(makeRain);
    if (instances.length && !started) {
      started = true;
      let visible = true;
      requestAnimationFrame(loop);

      // Pause when the tab is backgrounded — saves battery/CPU entirely.
      document.addEventListener("visibilitychange", function () {
        running = !document.hidden && visible;
      });

      // Pause when no rain canvas is on screen (e.g. scrolled past the hero).
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(function (entries) {
          visible = entries.some((e) => e.isIntersecting);
          running = !document.hidden && visible;
        }, { threshold: 0.01 });
        canvases.forEach((c) => io.observe(c));
      }
    }
  };

  if (document.readyState !== "loading") window.initMatrixRain();
  else document.addEventListener("DOMContentLoaded", window.initMatrixRain);
})();
