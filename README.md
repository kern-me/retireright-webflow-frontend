# retireright-webflow-frontend

Site-wide custom CSS/JS for the RetireRight Webflow site, edited as local files and
served via **GitHub Pages**. **Additive** — layers on top of Webflow Designer styles and any
custom code already in the site; it replaces nothing.

Two-file ownership: `custom.css` is Claude-owned (curated); `browser.css` is Nico-owned
(edited visually in Chrome via Local Overrides). `custom.js` is Claude-owned interactions.

Served from GitHub Pages (reflects the latest commit ~1 min after push, `Cache-Control: max-age=600`).
We moved off jsDelivr `@main` because its branch cache served stale commits for hours.

## Live URLs (plain tags in Webflow site-wide custom code)

- Head:   `<link rel="stylesheet" href="https://kern-me.github.io/retireright-webflow-frontend/custom.css">`
- Head:   `<link rel="stylesheet" href="https://kern-me.github.io/retireright-webflow-frontend/browser.css">`
- Footer: `<script defer src="https://kern-me.github.io/retireright-webflow-frontend/custom.js"></script>`

## Make a tweak

1. Edit `custom.css` / `custom.js` (or Nico edits `browser.css` in Chrome).
2. `./deploy.sh "short message"` — commits, pushes, waits for Pages, verifies served bytes.
3. Reload the page (updates reach everyone within ~10 min via the Pages cache).
