# Ashvin Sharma — Portfolio

Personal portfolio site. Static HTML/CSS/JS — no build step required.

## Files
```
index.html            # the site
matrix-rain.js        # background matrix-rain canvas effect
immersive.js          # scroll reveals, parallax, cursor glow
github-activity.js    # GitHub contribution graph panel
assets/
  me.jpg                       # portrait
  matrix-bg.jpg                # background image
  Ashvin-Sharma-Resume.docx    # downloadable résumé
```

## Deploy to GitHub Pages
1. Create a new repo (e.g. `portfolio` or `<username>.github.io`).
2. Upload the **contents of this folder** to the repo root (so `index.html` sits at the top level).
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `/ (root)` → Save.
4. Your site goes live at `https://<username>.github.io/<repo>/` within a minute or two.

> Tip: for a root domain (`https://<username>.github.io/`), name the repo exactly `<username>.github.io`.

## Notes
- Fonts load from Google Fonts; the GitHub graph fetches public contribution data — both need an internet connection (normal for any deployed site).
- To swap the résumé, replace `assets/Ashvin-Sharma-Resume.docx` (keep the same filename, or update the three `RÉSUMÉ` links in `index.html`).
