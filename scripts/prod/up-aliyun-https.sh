#!/usr/bin/env bash
set -euo pipefail

# Configure and start HTTPS reverse proxy (Caddy) for API domain on the server.
# Run this script on the Aliyun server in the repo root.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
cd "$ROOT_DIR"

API_DOMAIN=""
EMAIL=""

usage() {
  cat <<USAGE
Usage: $(basename "$0") --domain <api.domain.com> [--email <you@example.com>]

This will render docker/Caddyfile with your domain and run:
  docker compose -f docker-compose.api.yml -f docker-compose.api-https.yml up -d

Ensure ports 80 and 443 are open in the security group / firewall.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) API_DOMAIN="$2"; shift 2;;
    --email) EMAIL="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if [[ -z "$API_DOMAIN" ]]; then
  echo "--domain is required (e.g., api.example.com)" >&2
  usage; exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker then re-run." >&2; exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required (docker compose)." >&2; exit 1
fi

echo "[https] Rendering Caddyfile for domain $API_DOMAIN …"
# Use env substitution via Caddy (${API_DOMAIN}) style
sed -i.bak "s/{$API_DOMAIN}/${API_DOMAIN}/g" docker/Caddyfile || true

# For a clean render, rewrite file explicitly
cat > docker/Caddyfile <<CADDY
{$API_DOMAIN} {
  encode zstd gzip
  reverse_proxy backend:8000 {
    header_up Host {host}
    header_up X-Real-IP {remote}
    header_up X-Forwarded-For {remote}
    header_up X-Forwarded-Proto {scheme}
  }
}
CADDY

echo "[https] Starting Caddy reverse proxy (80/443)…"
docker compose -f docker-compose.api.yml -f docker-compose.api-https.yml up -d

echo "[https] Attempting HTTPS health check…"
set +e
for i in {1..60}; do
  if curl -skf "https://${API_DOMAIN}/health" >/dev/null; then
    echo "[https] OK: https://${API_DOMAIN}/health"
    exit 0
  fi
  sleep 2
done
set -e

echo "[https] Health check over HTTPS failed; check DNS/80/443/ACME logs:"
docker logs --tail=200 twitter-caddy || true
exit 1

