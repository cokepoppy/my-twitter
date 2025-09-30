#!/usr/bin/env bash
set -euo pipefail

# Orchestrate production deploy:
# - SSH to Aliyun, upload repo, start API stack (backend + MySQL + Redis)
# - Deploy frontend to Vercel

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
cd "$ROOT_DIR"

# Defaults (overridable by flags or env)
HOST=${HOST:-""}
USER=${USER:-"root"}
KEY=${KEY:-"/tmp/deploy-key.pem"}
REMOTE_DIR=${REMOTE_DIR:-"/opt/my-twitter"}

FRONTEND_URL=${FRONTEND_URL:-"https://your-frontend.vercel.app"}
API_URL=${API_URL:-"https://api.your-domain.com"}

PORT=${PORT:-8000}
JWT_SECRET=${JWT_SECRET:-"change-me-in-prod"}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-"password"}
MYSQL_DATABASE=${MYSQL_DATABASE:-"twitter"}
MYSQL_USER=${MYSQL_USER:-"twitter_user"}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-"twitter_password"}
REDIS_URL=${REDIS_URL:-"redis://redis:6379"}

VERCEL_TOKEN_ARG=${VERCEL_TOKEN:-""}
SCOPE=${SCOPE:-""}
PROJECT=${PROJECT:-""}

SKIP_BACKEND=${SKIP_BACKEND:-""}
SKIP_FRONTEND=${SKIP_FRONTEND:-""}

usage() {
  cat <<USAGE
Usage: $(basename "$0") --host <IP/Domain> [options]

SSH / Remote options:
  --host <host>                Aliyun host/IP (required)
  --user <user>                SSH user (default: root)
  --key <path>                 SSH key path (default: /tmp/deploy-key.pem)
  --remote-dir <dir>           Target directory on server (default: /opt/my-twitter)

Backend/API options:
  --frontend-url <url>         FRONTEND_URL for backend CORS (Vercel domain)
  --api-url <url>              Public API base URL (for Vercel VITE_API_URL)
  --port <port>                Backend port (default: ${PORT})
  --jwt-secret <secret>        JWT secret
  --mysql-root <pwd>           MySQL root password
  --mysql-db <name>            MySQL database name
  --mysql-user <user>          MySQL app user
  --mysql-pass <pwd>           MySQL user password
  --redis-url <url>            Redis URL (default: ${REDIS_URL})

Frontend/Vercel options:
  --vercel-token <token>       Vercel token (or set VERCEL_TOKEN env)
  --scope <org>                Vercel org/team scope (optional)
  --project <name>             Vercel project name (optional)

Control flags:
  --skip-backend               Skip backend deploy (only Vercel)
  --skip-frontend              Skip Vercel deploy (only backend)
  -h, --help                   Show help

Example:
  $(basename "$0") \
    --host 120.79.174.9 --key /tmp/deploy-key.pem \
    --frontend-url https://your-frontend.vercel.app \
    --api-url https://api.your-domain.com \
    --jwt-secret 'prod-secret' \
    --mysql-root 'root-pass' --mysql-db twitter --mysql-user twitter_user --mysql-pass twitter_password \
    --vercel-token $VERCEL_TOKEN --scope your-team --project my-twitter-frontend
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2;;
    --user) USER="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    --remote-dir) REMOTE_DIR="$2"; shift 2;;
    --frontend-url) FRONTEND_URL="$2"; shift 2;;
    --api-url) API_URL="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --jwt-secret) JWT_SECRET="$2"; shift 2;;
    --mysql-root) MYSQL_ROOT_PASSWORD="$2"; shift 2;;
    --mysql-db) MYSQL_DATABASE="$2"; shift 2;;
    --mysql-user) MYSQL_USER="$2"; shift 2;;
    --mysql-pass) MYSQL_PASSWORD="$2"; shift 2;;
    --redis-url) REDIS_URL="$2"; shift 2;;
    --vercel-token) VERCEL_TOKEN_ARG="$2"; shift 2;;
    --scope) SCOPE="$2"; shift 2;;
    --project) PROJECT="$2"; shift 2;;
    --skip-backend) SKIP_BACKEND=1; shift 1;;
    --skip-frontend) SKIP_FRONTEND=1; shift 1;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if [[ -z "$HOST" ]]; then
  echo "--host is required" >&2
  usage; exit 1
fi
if [[ ! -f "$KEY" ]]; then
  echo "SSH key not found: $KEY" >&2
  exit 1
fi

ssh_base=(ssh -i "$KEY" -o StrictHostKeyChecking=no "$USER@$HOST")
scp_base=(scp -i "$KEY" -o StrictHostKeyChecking=no)

echo "[orchestrator] Testing SSH…"
"${ssh_base[@]}" "echo 'SSH连接成功，开始部署'"

if [[ -z "$SKIP_BACKEND" ]]; then
  echo "[orchestrator] Uploading code to $USER@$HOST:$REMOTE_DIR …"
  # Create remote dir
  "${ssh_base[@]}" "mkdir -p '$REMOTE_DIR'"
  # TAR upload excluding bulky dirs
  TAR_EXCLUDES=(
    --exclude='.git' --exclude='node_modules' --exclude='frontend/node_modules' --exclude='backend/node_modules'
    --exclude='frontend/dist' --exclude='backend/dist' --exclude='logs' --exclude='*.log'
  )
  tar czf - "${TAR_EXCLUDES[@]}" -C "$ROOT_DIR" . | "${ssh_base[@]}" "tar xzf - -C '$REMOTE_DIR'"

  echo "[orchestrator] Ensuring Docker/Compose on server…"
  "${ssh_base[@]}" "bash -lc 'docker --version >/dev/null 2>&1 || (curl -fsSL https://get.docker.com | sh && systemctl enable --now docker); docker compose version >/dev/null 2>&1 || true'"

  echo "[orchestrator] Running API deploy on server…"
  REMOTE_CMD=(
    "cd '$REMOTE_DIR' && chmod +x scripts/prod/up-aliyun-api.sh && \
    FRONTEND_URL='$FRONTEND_URL' PORT='$PORT' JWT_SECRET='$JWT_SECRET' \
    MYSQL_ROOT_PASSWORD='$MYSQL_ROOT_PASSWORD' MYSQL_DATABASE='$MYSQL_DATABASE' \
    MYSQL_USER='$MYSQL_USER' MYSQL_PASSWORD='$MYSQL_PASSWORD' REDIS_URL='$REDIS_URL' \
    scripts/prod/up-aliyun-api.sh --frontend-url '$FRONTEND_URL' --port '$PORT' \
      --jwt-secret '$JWT_SECRET' --mysql-root '$MYSQL_ROOT_PASSWORD' --mysql-db '$MYSQL_DATABASE' \
      --mysql-user '$MYSQL_USER' --mysql-pass '$MYSQL_PASSWORD' --redis-url '$REDIS_URL'"
  )
  "${ssh_base[@]}" "bash -lc ${REMOTE_CMD@Q}"
fi

if [[ -z "$SKIP_FRONTEND" ]]; then
  echo "[orchestrator] Deploying frontend to Vercel…"
  chmod +x "$ROOT_DIR/scripts/prod/deploy-vercel.sh"
  CMD=("$ROOT_DIR/scripts/prod/deploy-vercel.sh" --api "$API_URL")
  [[ -n "$VERCEL_TOKEN_ARG" ]] && CMD+=(--token "$VERCEL_TOKEN_ARG")
  [[ -n "$SCOPE" ]] && CMD+=(--scope "$SCOPE")
  [[ -n "$PROJECT" ]] && CMD+=(--project "$PROJECT")
  "${CMD[@]}"
fi

echo "[orchestrator] Done. Backend on $HOST:$PORT; Frontend on Vercel."

