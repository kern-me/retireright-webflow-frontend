# retireright-webflow-frontend

Site-wide custom CSS/JS for the RetireRight Webflow site, edited as local files and
served via jsDelivr. **Additive** — layers on top of Webflow Designer styles and any
custom code already in the site; it replaces nothing.

**Must stay a public repo** (jsDelivr only serves public GitHub repos). Frontend code is
public anyway — never commit secrets.

## Live URLs (set once in Webflow site-wide custom code)

- Head:   `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kern-me/retireright-webflow-frontend@main/custom.css">`
- Footer: `<script defer src="https://cdn.jsdelivr.net/gh/kern-me/retireright-webflow-frontend@main/custom.js"></script>`

## Make a tweak

1. Edit `custom.css` or `custom.js` (keep changes under a labeled section).
2. `./deploy.sh "short message"` — commits, pushes, purges jsDelivr, verifies the CDN.
3. Hard-refresh the page to see it.
