#!/bin/sh
set -e

echo "Applying database migrations (prisma migrate deploy)..."
# Use npx to run prisma CLI without bundling devDependencies
set +e
npx prisma migrate deploy
STATUS=$?
set -e
if [ $STATUS -ne 0 ]; then
  echo "migrate deploy failed (code $STATUS). Falling back to prisma db push for local/dev..."
  npx prisma db push --accept-data-loss
fi

echo "Starting application..."
exec "$@"
