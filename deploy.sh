#!/usr/bin/env bash
# Deploy custom.css/custom.js/browser.css via GitHub Pages: commit -> push -> verify.
# Pages rebuilds ~30-90s after push and serves the latest commit (Cache-Control: max-age=600).
# Usage: ./deploy.sh "short message"
set -euo pipefail

BASE="https://kern-me.github.io/retireright-webflow-frontend"
FILES=(custom.css custom.js browser.css rr-lp.css rr-script.js rr-lp-browser.css)
cd "$(dirname "$0")"

msg="${1:-update}"
git add -A
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
