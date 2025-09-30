#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

echo "[frontend] Stopping dev container…"
docker rm -f twitter-frontend-dev >/dev/null 2>&1 || true
echo "[frontend] Done."

