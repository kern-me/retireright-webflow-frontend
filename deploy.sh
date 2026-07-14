#!/usr/bin/env bash
# Commit -> push -> confirm the pushed bytes are the ones Pages is serving.
# There is no deploy step: Pages serves whatever is on main. The push IS the deploy.
# The md5 poll exists only to disambiguate "my change isn't showing": once a file
# reports OK, it is provably live, so anything still wrong is your CSS or your cache.
# Pages rebuilds ~30-90s after push and serves Cache-Control: max-age=600.
# Usage: ./deploy.sh "short message"
set -euo pipefail

BASE="https://kern-me.github.io/retireright-webflow-frontend"
FILES=(custom.css custom.js browser.css rr-lp.css rr-script.js rr-lp-browser.css rr-avatar-logo.png rr-video-poster.jpg)
cd "$(dirname "$0")"

msg="${1:-update}"
# Stage only the files this repo serves, plus its own tooling. Never `git add -A`:
# this repo is shared with John, and -A sweeps in whatever else is in the tree.
git add -- "${FILES[@]}" deploy.sh README.md
if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  git commit -q -m "$msg"
fi
# Push unconditionally: a commit may already exist unpushed (e.g. after a rebase),
# in which case there is nothing to stage and the commit branch above is skipped.
git push -q origin main

# Poll until Pages serves the bytes we just pushed (build lag is ~30-90s).
fail=0
for f in "${FILES[@]}"; do
  want=$(md5 -q "$f")
  ok=0
  for _ in $(seq 1 30); do
    got=$(curl -fsS "$BASE/$f" | md5 -q) || { sleep 5; continue; }
    if [ "$got" = "$want" ]; then ok=1; break; fi
    sleep 5
  done
  if [ "$ok" = 1 ]; then echo "OK  $f  ($BASE/$f)"; else echo "STALE  $f  Pages != local (build lag?)"; fail=1; fi
done
exit $fail
