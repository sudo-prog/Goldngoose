#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")" && pwd)"
cd "$repo_root"

# Require clean working tree except intentional changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Staging all changes..."
  git add -A
else
  echo "No changes, nothing to do."
  exit 0
fi

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" != "main" ]]; then
  echo "Auto-push is allowed only on main branch (current: $branch)."
  exit 1
fi

if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

msg="auto-sync: update from agent run $(date -u +%FT%TZ)"
git commit -m "$msg"

# Pull first to avoid outdated branch
git pull --rebase origin main

git push origin main

echo "Auto-push complete"
