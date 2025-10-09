#!/usr/bin/env bash
set -euo pipefail

# Configure Docker daemon registry mirrors (for faster image pulls in CN),
# optional DNS, then restart Docker.
# Run this on the server with root privileges.

MIRRORS=${MIRRORS:-"https://docker.nju.edu.cn https://mirror.baidubce.com https://dockerproxy.com https://docker.m.daocloud.io"}
SET_DNS=${SET_DNS:-1}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--mirrors "<url1> <url2> ..."] [--no-dns]

Defaults:
  MIRRORS: $MIRRORS
  DNS: 223.5.5.5, 223.6.6.6 (Aliyun public DNS) (can be disabled with --no-dns)

This writes /etc/docker/daemon.json and restarts docker.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mirrors) MIRRORS="$2"; shift 2;;
    --no-dns) SET_DNS=0; shift 1;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

echo "[mirror] Configuring Docker registry mirrors…"
mkdir -p /etc/docker

TMP_JSON=$(mktemp)
{
  echo '{'
  echo '  "registry-mirrors": ['
  first=1
  for m in $MIRRORS; do
    if [[ $first -eq 0 ]]; then echo ','; fi
    printf '    "%s"' "$m"
    first=0
  done
  echo ''
  echo '  ]'
  if [[ "$SET_DNS" -eq 1 ]]; then
    echo '  ,"dns": ["223.5.5.5", "223.6.6.6"]'
  fi
  echo '}'
} > "$TMP_JSON"

install -m 0644 "$TMP_JSON" /etc/docker/daemon.json
rm -f "$TMP_JSON"

echo "[mirror] Restarting Docker…"
systemctl daemon-reload || true
systemctl restart docker

echo "[mirror] Docker info (mirrors):"
docker info 2>/dev/null | sed -n '/Registry Mirrors/,+5p' || true

echo "[mirror] Testing image pull (hello-world)…"
set +e
docker pull hello-world:latest >/dev/null 2>&1
RC=$?
set -e
if [[ $RC -ne 0 ]]; then
  echo "[mirror] Test pull failed. Try again or adjust mirror list."
  exit 1
else
  echo "[mirror] Test pull OK."
fi

echo "[mirror] Done."

