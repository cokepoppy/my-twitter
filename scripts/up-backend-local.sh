#!/usr/bin/env bash
set -euo pipefail

# Defaults
IMAGE="my-twitter-backend:local"
CONTAINER="twitter-backend"
PORT="8000"
NETWORK="my-twitter_twitter-network"
DB_URL="mysql://twitter_user:twitter_password@twitter-mysql:3306/twitter"
REDIS_URL="redis://twitter-redis:6379"
JWT_SECRET="dev-local-secret"
UPLOAD_HOST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)/backend/uploads"
FRONTEND_URL="http://localhost:3000"
GOOGLE_JSON=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""

usage() {
  cat <<USAGE
Usage: $(basename "$0") [options]

Options:
  --image <name>                Docker image (default: ${IMAGE})
  --container <name>            Container name (default: ${CONTAINER})
  --port <port>                 Host port for API (default: ${PORT})
  --network <name>              Docker network (default: ${NETWORK})
  --db-url <dsn>                DATABASE_URL (default: ${DB_URL})
  --redis-url <url>             REDIS_URL (default: ${REDIS_URL})
  --jwt-secret <secret>         JWT secret (default: ${JWT_SECRET})
  --frontend-url <url>          FRONTEND_URL (default: ${FRONTEND_URL})
  --google-json <path>          Google OAuth JSON (reads web.client_id/secret/redirect_uris[0]/javascript_origins[0])
  --google-client-id <id>       Google client id (overrides JSON)
  --google-client-secret <sec>  Google client secret (overrides JSON)
  --google-redirect-uri <uri>   Google redirect uri (overrides JSON)
  -h, --help                    Show this help

Examples:
  $(basename "$0") --google-json ./google-oauth.local.json
  $(basename "$0") --google-client-id xxx --google-client-secret yyy --google-redirect-uri http://localhost:8000/api/auth/google/callback
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image) IMAGE="$2"; shift 2;;
    --container) CONTAINER="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --network) NETWORK="$2"; shift 2;;
    --db-url) DB_URL="$2"; shift 2;;
    --redis-url) REDIS_URL="$2"; shift 2;;
    --jwt-secret) JWT_SECRET="$2"; shift 2;;
    --frontend-url) FRONTEND_URL="$2"; shift 2;;
    --google-json) GOOGLE_JSON="$2"; shift 2;;
    --google-client-id) GOOGLE_CLIENT_ID="$2"; shift 2;;
    --google-client-secret) GOOGLE_CLIENT_SECRET="$2"; shift 2;;
    --google-redirect-uri) GOOGLE_REDIRECT_URI="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1;;
  esac
done

# Extract from JSON if provided
if [[ -n "${GOOGLE_JSON}" ]]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required to parse --google-json. Install jq or provide client id/secret/redirect via flags." >&2
    exit 1
  fi
  if [[ ! -f "${GOOGLE_JSON}" ]]; then
    echo "Google JSON not found: ${GOOGLE_JSON}" >&2
    exit 1
  fi
  GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-$(jq -r '.web.client_id' "${GOOGLE_JSON}")}
  GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-$(jq -r '.web.client_secret' "${GOOGLE_JSON}")}
  GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI:-$(jq -r '.web.redirect_uris[0]' "${GOOGLE_JSON}")}
  # if frontend not overridden, try first origin from json
  ORIGIN=$(jq -r '.web.javascript_origins[0] // empty' "${GOOGLE_JSON}")
  if [[ -n "${ORIGIN}" ]]; then FRONTEND_URL=${FRONTEND_URL:-$ORIGIN}; fi
fi

if [[ -z "${GOOGLE_CLIENT_ID}" || -z "${GOOGLE_CLIENT_SECRET}" || -z "${GOOGLE_REDIRECT_URI}" ]]; then
  echo "Warning: Google OAuth not fully configured (missing id/secret/redirect). The login button will be hidden." >&2
fi

# Ensure uploads dir exists
mkdir -p "${UPLOAD_HOST_DIR}"

echo "[backend] Removing existing container if present…"
docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true

echo "[backend] Starting container ${CONTAINER} (image: ${IMAGE}) on network ${NETWORK}, port ${PORT}…"
docker run -d \
  --name "${CONTAINER}" \
  --network "${NETWORK}" \
  -p "${PORT}:8000" \
  -e NODE_ENV=production \
  -e PORT=8000 \
  -e DATABASE_URL="${DB_URL}" \
  -e REDIS_URL="${REDIS_URL}" \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e FRONTEND_URL="${FRONTEND_URL}" \
  -e GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}" \
  -e GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}" \
  -e GOOGLE_REDIRECT_URI="${GOOGLE_REDIRECT_URI}" \
  -e UPLOAD_DIR="/app/uploads" \
  -v "${UPLOAD_HOST_DIR}:/app/uploads" \
  "${IMAGE}" >/dev/null

echo "[backend] Waiting for /health …"
for i in {1..60}; do
  if curl -sf "http://localhost:${PORT}/health" >/dev/null; then
    echo "[backend] OK: http://localhost:${PORT}/health"
    break
  fi
  sleep 2
done

if ! curl -sf "http://localhost:${PORT}/health" >/dev/null; then
  echo "[backend] Health check failed, recent logs:" >&2
  docker logs --tail=200 "${CONTAINER}" >&2 || true
  exit 1
fi

echo "[backend] Auth config:"
curl -sf "http://localhost:${PORT}/api/auth/config" || true
echo

echo "[backend] Done. FRONTEND_URL=${FRONTEND_URL}"

