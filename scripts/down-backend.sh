#!/usr/bin/env bash
set -euo pipefail

CONTAINER=${1:-twitter-backend}
echo "[backend] Stopping container ${CONTAINER}…"
docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
echo "[backend] Done."

