#!/usr/bin/env bash
# Usage: RENDER_API_KEY=<key> ./scripts/render-create-secret.sh <SERVICE_ID_OR_NAME> <SECRET_NAME> <SECRET_VALUE>
# If SERVICE_ID_OR_NAME is a name, script will try to resolve it to an id.

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: RENDER_API_KEY=<key> $0 <SERVICE_ID_OR_NAME> <SECRET_NAME> <SECRET_VALUE>"
  exit 1
fi

SERVICE_INPUT="$1"
SECRET_NAME="$2"
SECRET_VALUE="$3"

if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "ERROR: RENDER_API_KEY environment variable is required. Export it or prefix the command like: RENDER_API_KEY=... $0 ..."
  exit 1
fi

API_BASE="https://api.render.com/v1"

# If input looks like an ID (starts with svc_ or s-), use it; otherwise try to find by name
SERVICE_ID=""
if [[ "$SERVICE_INPUT" =~ ^svc_ || "$SERVICE_INPUT" =~ ^s- || "$SERVICE_INPUT" =~ ^[0-9a-fA-F]{24}$ ]]; then
  SERVICE_ID="$SERVICE_INPUT"
else
  echo "Resolving service name to id: $SERVICE_INPUT"
  resp=$(curl -sS -H "Authorization: Bearer ${RENDER_API_KEY}" "${API_BASE}/services")
  SERVICE_ID=$(echo "$resp" | jq -r --arg NAME "$SERVICE_INPUT" '.[] | select(.name == $NAME) | .id' | head -n1)
  if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    echo "Could not resolve service name to id. You can pass the service id directly. Available services:" >&2
    echo "$resp" | jq -r '.[] | "- " + .name + " (" + .id + ")"' >&2
    exit 1
  fi
fi

# Create the secret
echo "Creating secret ${SECRET_NAME} for service ${SERVICE_ID}..."
create_resp=$(curl -sS -X POST "${API_BASE}/services/${SERVICE_ID}/secrets" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${SECRET_NAME}\", \"value\": \"${SECRET_VALUE}\"}")

if echo "$create_resp" | jq -e '.id' >/dev/null 2>&1; then
  echo "Secret created successfully."
  echo "$create_resp" | jq -r '.id'
else
  echo "Failed to create secret:" >&2
  echo "$create_resp" | jq -r 'if .message then .message else tostring end' >&2
  exit 1
fi
