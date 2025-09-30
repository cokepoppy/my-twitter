#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

echo "[all] Stopping frontend…"
"${ROOT_DIR}/scripts/down-frontend.sh" || true

echo "[all] Stopping backend…"
"${ROOT_DIR}/scripts/down-backend.sh" || true

echo "[all] Stopping DB (MySQL + Redis)…"
"${ROOT_DIR}/scripts/down-db.sh" || true

echo "[all] Done."

