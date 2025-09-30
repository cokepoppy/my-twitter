#!/usr/bin/env bash
set -euo pipefail

# One-click deploy of the frontend to Vercel using CLI.
# Requires: Node/npm and Vercel CLI (npx vercel), VERCEL_TOKEN env or --token flag.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

API_URL=""
VERCEL_TOKEN_ARG="${VERCEL_TOKEN:-}"
SCOPE=""      # optional org/team scope
PROJECT=""    # optional project name

usage() {
  cat <<USAGE
Usage: $(basename "$0") --api <https://api.domain.com> [--token <VERCEL_TOKEN>] [--scope <org>] [--project <name>]

Options:
  --api <url>          Backend API base URL for build (sets VITE_API_URL)
  --token <token>      Vercel token (or set VERCEL_TOKEN env)
  --scope <org>        Vercel scope (team/org), optional
  --project <name>     Vercel project name to link/use, optional
  -h, --help           Show help

This runs:
  npx vercel --cwd frontend --prod --confirm \\
    --build-env VITE_API_URL=<url> [--token] [--scope] [--project]

Make sure 'frontend/' is a Vercel project or allow the script to link interactively.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api) API_URL="$2"; shift 2;;
    --token) VERCEL_TOKEN_ARG="$2"; shift 2;;
    --scope) SCOPE="$2"; shift 2;;
    --project) PROJECT="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if [[ -z "$API_URL" ]]; then
  echo "--api <url> is required (e.g. https://api.your-domain.com)" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "Node/npm is required to run Vercel CLI via npx." >&2
  exit 1
fi

CMD=(npx vercel --cwd "$FRONTEND_DIR" --prod --confirm --build-env "VITE_API_URL=$API_URL")
[[ -n "$VERCEL_TOKEN_ARG" ]] && CMD+=(--token "$VERCEL_TOKEN_ARG")
[[ -n "$SCOPE" ]] && CMD+=(--scope "$SCOPE")
[[ -n "$PROJECT" ]] && CMD+=(--project "$PROJECT")

echo "[vercel] Deploying frontend with VITE_API_URL=$API_URL …"
"${CMD[@]}"

echo "[vercel] Done. Above output includes the deployed URL."

