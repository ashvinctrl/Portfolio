// Tweaks for the hi-fi cyberpunk portfolio. Drives CSS variables, the rain
// colour/speed/density, and the CRT/glitch overlays on the vanilla page.
function PortfolioTweaks() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "green",
    "rainSpeed": 0.7,
    "rainDensity": 1,
    "scanlines": true,
    "glitch": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    const M = {
      green: { accent:"#2fe27f", head:"#d9ffe9", rain:"#2bd96a", line:"rgba(86,224,150,0.16)", line2:"rgba(86,224,150,0.30)" },
      amber: { accent:"#ffb22e", head:"#ffe9b0", rain:"#ffb22e", line:"rgba(255,178,46,0.16)", line2:"rgba(255,178,46,0.32)" },
      both:  { accent:"#ffb22e", head:"#d9ffe9", rain:"#2bd96a", line:"rgba(86,224,150,0.16)", line2:"rgba(86,224,150,0.30)" },
    };
    const c = M[t.accent] || M.green;
    root.style.setProperty("--accent", c.accent);
    root.style.setProperty("--accent-head", c.head);
    root.style.setProperty("--line", c.line);
    root.style.setProperty("--line2", c.line2);
    document.body.dataset.scan = t.scanlines ? "on" : "off";
    document.body.dataset.glitch = t.glitch ? "on" : "off";

    document.querySelectorAll("canvas.matrix-rain").forEach((cv) => {
      cv.style.setProperty("--rain", c.rain);
      cv.style.setProperty("--rain-head", c.head);
      cv.dataset.speed = t.rainSpeed;
      cv.dataset.density = t.rainDensity;
    });
    if (window.matrixReseed) window.matrixReseed();
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      <TweakRadio label="Accent" value={t.accent}
        options={["green", "amber", "both"]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Matrix rain" />
      <TweakSlider label="Fall speed" value={t.rainSpeed} min={0.3} max={1.6} step={0.1} unit="x"
        onChange={(v) => setTweak("rainSpeed", v)} />
      <TweakSlider label="Density" value={t.rainDensity} min={0.6} max={1.6} step={0.1}
        onChange={(v) => setTweak("rainDensity", v)} />
      <TweakSection label="CRT" />
      <TweakToggle label="Scanlines" value={t.scanlines}
        onChange={(v) => setTweak("scanlines", v)} />
      <TweakToggle label="Glitch hover" value={t.glitch}
        onChange={(v) => setTweak("glitch", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<PortfolioTweaks />);
