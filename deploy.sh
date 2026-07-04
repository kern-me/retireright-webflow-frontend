#!/usr/bin/env bash
# Deploy custom.css/custom.js: commit -> push -> purge jsDelivr -> verify.
# Usage: ./deploy.sh "short message"
set -euo pipefail

REPO="kern-me/retireright-webflow-frontend"
BRANCH="main"
FILES=(custom.css custom.js browser.css)
cd "$(dirname "$0")"

msg="${1:-update}"
git add -A
if git diff --cached --quiet; then
  echo "No changes to commit; re-purging anyway."
else
  git commit -q -m "$msg"
  git push -q origin "$BRANCH"
fi

fail=0
for f in "${FILES[@]}"; do
  url="https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/${f}"
  curl -fsS "https://purge.jsdelivr.net/gh/${REPO}@${BRANCH}/${f}" >/dev/null || true
  want=$(md5 -q "$f")
  # Poll the CDN until it serves the bytes we just pushed (jsDelivr purge is near-instant).
  ok=0
  for _ in $(seq 1 15); do
    got=$(curl -fsS "$url" | md5 -q) || { sleep 2; continue; }
    if [ "$got" = "$want" ]; then ok=1; break; fi
    sleep 2
  done
  if [ "$ok" = 1 ]; then echo "OK  $f  ($url)"; else echo "STALE  $f  CDN != local"; fail=1; fi
done
exit $fail
