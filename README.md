# retireright-webflow-frontend

Site-wide custom CSS/JS for the RetireRight Webflow site, edited as local files and
served via **GitHub Pages**. **Additive** — layers on top of Webflow Designer styles and any
custom code already in the site; it replaces nothing.

Two-file ownership: `custom.css` is Claude-owned (curated); `browser.css` is Nico-owned
(edited visually in Chrome via Local Overrides). `custom.js` is Claude-owned interactions.

Served from GitHub Pages (reflects the latest commit ~1 min after push, `Cache-Control: max-age=600`).
We moved off jsDelivr `@main` because its branch cache served stale commits for hours.

## Two sets of files

| File | Loaded where | Owner |
|---|---|---|
| `custom.css`, `custom.js` | **site-wide** custom code — every page of the migrated site | Claude |
| `browser.css` | site-wide, after `custom.css` | Nico (Chrome Local Overrides) |
| `rr-lp.css`, `rr-script.js` | the **`/formula`** landing page only (page custom code) | Claude |
| `rr-lp-browser.css` | `/formula` only, after `rr-lp.css` | Nico (Chrome Local Overrides) |
| `rr-avatar-logo.png` | referenced by `rr-lp.css` (testimonial avatars) | — |

## Live URLs (plain tags in Webflow custom code — set once, never touched again)

Site-wide code:
- Head:   `<link rel="stylesheet" href="https://kern-me.github.io/retireright-webflow-frontend/custom.css">`
- Head:   `<link rel="stylesheet" href="https://kern-me.github.io/retireright-webflow-frontend/browser.css">`
- Footer: `<script defer src="https://kern-me.github.io/retireright-webflow-frontend/custom.js"></script>`

`/formula` page code:
- Head:   `<link rel="stylesheet" href="https://kern-me.github.io/retireright-webflow-frontend/rr-lp.css">`
- Head:   `<link rel="stylesheet" href="https://kern-me.github.io/retireright-webflow-frontend/rr-lp-browser.css">`
- Footer: `<script src="https://kern-me.github.io/retireright-webflow-frontend/rr-script.js"></script>`

The landing page used to serve these as uploaded Webflow assets, which meant every CSS tweak
was an asset upload + a freeform-code edit + a site publish + an orphan cleanup. It doesn't
anymore. **A CSS/JS change is now just a push.** Only DOM/content changes still need Webflow.

## Make a tweak

1. Edit the file (or Nico edits a `*browser.css` in Chrome).
2. `./deploy.sh "short message"` — commits, pushes, waits for Pages, verifies served bytes.
3. **Hard-reload** the page. Pages sends `max-age=600`, so a normal reload can show you a file
   up to 10 minutes stale. `deploy.sh` printing OK means the bytes are live, *not* that your
   browser is seeing them — this is the #1 source of "my change didn't work" here.

## Gotcha: the host site's global stylesheet bleeds into `#rr-lp`

The Webflow site's own global styles reach inside the landing page's `#rr-lp` wrapper and have
repeatedly overridden it (the `.lead-form` grid, `.nav-logo` height, and the card-title
uppercase). To beat it you must **set an explicit value** — deleting our declaration just lets
the global one win. `#rr-lp .thing` (id + class) outranks any class-only global rule.
