#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

echo "[db] Stopping MySQL and Redis..."
docker compose -p my-twitter-db -f "${ROOT_DIR}/docker-compose.db.yml" down
echo "[db] Done."
