#!/usr/bin/env bash
# Usage: RENDER_API_KEY=<key> ./scripts/render-list-services.sh
set -euo pipefail
if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "ERROR: RENDER_API_KEY environment variable is required. Export it or prefix the command like: RENDER_API_KEY=... $0"
  exit 1
fi

API_BASE="https://api.render.com/v1"
resp=$(curl -sS -H "Authorization: Bearer ${RENDER_API_KEY}" "${API_BASE}/services")
if echo "$resp" | jq -e . >/dev/null 2>&1; then
  echo "$resp" | jq -r '.[] | "Name: " + .name + "\n  ID:   " + .id + "\n  Type: " + .serviceDetails.type + "\n"'
else
  echo "Failed to fetch services: $resp" >&2
  exit 1
fi
