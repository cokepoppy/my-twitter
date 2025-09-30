#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.frontend.yml"
VITE_API_URL_ARG="${VITE_API_URL:-http://localhost:8000}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--api <url>]
  --api <url>   Set VITE_API_URL for dev server (default: ${VITE_API_URL_ARG})
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api) VITE_API_URL_ARG="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1"; usage; exit 1;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required." >&2; exit 1;
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required (docker compose)." >&2; exit 1;
fi

# Ensure network exists for cross-container dev (backend/db)
if ! docker network inspect my-twitter_twitter-network >/dev/null 2>&1; then
  docker network create my-twitter_twitter-network >/dev/null
fi

echo "[frontend] Starting Vite dev server on :3000 (VITE_API_URL=${VITE_API_URL_ARG})…"
VITE_API_URL="${VITE_API_URL_ARG}" docker compose -p my-twitter-frontend -f "${COMPOSE_FILE}" up -d --remove-orphans

echo "[frontend] Waiting for http://localhost:3000 …"
for i in {1..60}; do
  if curl -sf http://localhost:3000 >/dev/null; then
    echo "[frontend] OK: http://localhost:3000"
    exit 0
  fi
  sleep 2
done

echo "[frontend] Dev server not responding yet, logs tail:" >&2
docker logs --tail=100 -f twitter-frontend-dev
