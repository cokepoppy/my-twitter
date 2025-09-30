#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

GOOGLE_JSON=""
VITE_API_URL_ARG="${VITE_API_URL:-http://localhost:8000}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [options]

Options:
  --google-json <path>   Google OAuth JSON (web.client_id/secret/redirect_uris used for backend)
  --api <url>            Frontend VITE_API_URL (default: ${VITE_API_URL_ARG})
  -h, --help             Show help

This script will:
  1) Start MySQL + Redis via scripts/up-db.sh
  2) Start backend container with Google OAuth (if provided) via scripts/up-backend-local.sh
  3) Start frontend dev container (Vite) via scripts/up-frontend-dev.sh
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --google-json) GOOGLE_JSON="$2"; shift 2;;
    --api) VITE_API_URL_ARG="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required." >&2; exit 1;
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required (docker compose)." >&2; exit 1;
fi

echo "[all] 1/3 Start DB (MySQL + Redis)…"
"${ROOT_DIR}/scripts/up-db.sh"

echo "[all] 2/3 Start backend container…"
if [[ -n "${GOOGLE_JSON}" ]]; then
  "${ROOT_DIR}/scripts/up-backend-local.sh" --google-json "${GOOGLE_JSON}"
else
  "${ROOT_DIR}/scripts/up-backend-local.sh"
fi

echo "[all] 3/3 Start frontend dev…"
"${ROOT_DIR}/scripts/up-frontend-dev.sh" --api "${VITE_API_URL_ARG}"

echo
echo "[all] All services are up:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000 (health: /health)"
echo "  DB:       MySQL: localhost:3306 | Redis: localhost:6379"
echo
echo "Use scripts/down-local-all.sh to stop everything."

