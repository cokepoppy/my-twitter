#!/usr/bin/env bash
set -euo pipefail

# One-click deploy of API stack (backend + MySQL + Redis) on the server.
# Run this script on your Aliyun server in the repo root.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
cd "$ROOT_DIR"

# Defaults (can be overridden by flags)
FRONTEND_URL=${FRONTEND_URL:-"https://your-frontend-domain"}
PORT=${PORT:-8000}
JWT_SECRET=${JWT_SECRET:-"change-me-in-prod"}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-"password"}
MYSQL_DATABASE=${MYSQL_DATABASE:-"twitter"}
MYSQL_USER=${MYSQL_USER:-"twitter_user"}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-"twitter_password"}
REDIS_URL=${REDIS_URL:-"redis://redis:6379"}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [options]

Options (or set as env before running):
  --frontend-url <url>        CORS origin for backend (e.g., https://your-frontend-domain)
  --port <port>               Backend port (default: ${PORT})
  --jwt-secret <secret>       JWT secret
  --mysql-root <pwd>          MySQL root password
  --mysql-db <name>           MySQL database name
  --mysql-user <user>         MySQL app user
  --mysql-pass <pwd>          MySQL app user password
  --redis-url <url>           Redis URL (default: ${REDIS_URL})
  -h, --help                  Show help

This will write a .env file for Compose and run:
  docker compose -f docker-compose.api.yml up -d --build

Ensure Docker & Compose v2 are installed.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend-url) FRONTEND_URL="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --jwt-secret) JWT_SECRET="$2"; shift 2;;
    --mysql-root) MYSQL_ROOT_PASSWORD="$2"; shift 2;;
    --mysql-db) MYSQL_DATABASE="$2"; shift 2;;
    --mysql-user) MYSQL_USER="$2"; shift 2;;
    --mysql-pass) MYSQL_PASSWORD="$2"; shift 2;;
    --redis-url) REDIS_URL="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker then re-run." >&2; exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required (docker compose)." >&2; exit 1
fi

echo "[prod] Writing .env for Compose…"
cat > .env <<ENV
PORT=${PORT}
FRONTEND_URL=${FRONTEND_URL}
JWT_SECRET=${JWT_SECRET}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
REDIS_URL=${REDIS_URL}
ENV

echo "[prod] Starting API stack…"
docker compose -f docker-compose.api.yml up -d --build

echo "[prod] Waiting for health on :${PORT}…"
for i in {1..60}; do
  if curl -sf "http://localhost:${PORT}/health" >/dev/null; then
    echo "[prod] OK: http://localhost:${PORT}/health"
    break
  fi
  sleep 2
done

if ! curl -sf "http://localhost:${PORT}/health" >/dev/null; then
  echo "[prod] Health check failed, showing backend logs:" >&2
  docker logs --tail=200 twitter-backend || true
  exit 1
fi

echo "[prod] Done. API is up on :${PORT} (exposed in compose)."

