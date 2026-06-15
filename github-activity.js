// GitHub activity panel — fetches the live contribution calendar
// (github-contributions-api.jogruber.de) and profile stats (api.github.com),
// then draws the heatmap on a canvas using the site's accent colour.
// Fails soft: if either fetch dies, the panel shows a link instead of breaking.
(function () {
  var USER = "ashvinctrl";
  var cv = document.getElementById("ghCanvas");
  var msg = document.getElementById("ghMsg");
  if (!cv || !msg) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var weeksData = null;

  function setStat(id, val) {
    var el = document.getElementById(id);
    if (!el || val == null) return;
    var n = parseInt(val, 10);
    if (isNaN(n) || reduce) { el.textContent = val; return; }
    var t0 = null, dur = 900;
    function fr(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(n * p).toLocaleString();
      if (p < 1) requestAnimationFrame(fr);
    }
    requestAnimationFrame(fr);
  }

  function accentRGB() {
    var hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2fe27f";
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(hex, 16);
    if (isNaN(n)) return [47, 226, 127];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function draw() {
    if (!weeksData) return;
    var wpx = cv.parentElement.clientWidth;
    if (wpx < 40) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var unit = Math.floor(wpx / weeksData.length);
    var weeks = weeksData;
    if (unit < 8) {                       // narrow screens: show the most recent weeks, bigger cells
      unit = 8;
      var n = Math.max(10, Math.floor(wpx / unit));
      weeks = weeksData.slice(weeksData.length - n);
    }
    var hpx = unit * 7;
    cv.width = Math.floor(wpx * dpr);
    cv.height = Math.floor(hpx * dpr);
    cv.style.height = hpx + "px";
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, wpx, hpx);
    var rgb = accentRGB();
    var alphas = [0.07, 0.25, 0.45, 0.7, 1];
    for (var x = 0; x < weeks.length; x++) {
      for (var y = 0; y < 7; y++) {
        var lvl = weeks[x][y];
        if (lvl < 0) continue;
        ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alphas[lvl] + ")";
        ctx.fillRect(x * unit, y * unit, unit - 2, unit - 2);
      }
    }
  }
  window.ghRedraw = draw;
  if ("ResizeObserver" in window) new ResizeObserver(draw).observe(cv.parentElement);

  function fail() {
    msg.innerHTML = '\u25b8 live feed unavailable \u2014 <a href="https://github.com/' + USER +
      '" target="_blank" rel="noopener" style="color:var(--accent)">open github.com/' + USER + ' \u2197</a>';
  }

  // contribution calendar (last 12 months)
  fetch("https://github-contributions-api.jogruber.de/v4/" + USER + "?y=last")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      var days = d.contributions || [];
      if (!days.length) { fail(); return; }
      var total = (d.total && d.total.lastYear != null) ? d.total.lastYear
        : days.reduce(function (s, c) { return s + c.count; }, 0);
      var weeks = [], col = [];
      var firstDow = new Date(days[0].date + "T00:00:00").getDay();
      for (var i = 0; i < firstDow; i++) col.push(-1);
      days.forEach(function (c) {
        col.push(Math.max(0, Math.min(4, c.level)));
        if (col.length === 7) { weeks.push(col); col = []; }
      });
      if (col.length) { while (col.length < 7) col.push(-1); weeks.push(col); }
      weeksData = weeks;
      msg.style.display = "none";
      cv.style.display = "block";
      setStat("ghContrib", total);
      draw();
    })
    .catch(fail);

  // profile stats
  fetch("https://api.github.com/users/" + USER)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (u) {
      if (!u) return;
      setStat("ghRepos", u.public_repos);
      setStat("ghFollowers", u.followers);
    })
    .catch(function () {});
})();
