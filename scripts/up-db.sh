#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

echo "[db] Using compose file: ${ROOT_DIR}/docker-compose.db.yml"
if ! command -v docker &>/dev/null; then
  echo "Docker is required but not found. Please install Docker." >&2
  exit 1
fi
if ! docker compose version &>/dev/null; then
  echo "Docker Compose v2 is required (docker compose)." >&2
  exit 1
fi

echo "[db] Starting MySQL and Redis..."
docker compose -p my-twitter-db -f "${ROOT_DIR}/docker-compose.db.yml" up -d --remove-orphans

echo "[db] Waiting for MySQL to accept connections (this can take ~10-20s)..."
# Simple wait loop using container health by attempting a TCP connect
for i in {1..30}; do
  if nc -z localhost 3306 2>/dev/null; then
    echo "[db] MySQL is up"
    break
  fi
  sleep 2
done

echo "[db] Redis status:"
docker exec -it twitter-redis redis-cli ping || true

echo "[db] Containers:"
docker compose -p my-twitter-db -f "${ROOT_DIR}/docker-compose.db.yml" ps

echo "[db] Done. MySQL: localhost:3306 | Redis: localhost:6379"
