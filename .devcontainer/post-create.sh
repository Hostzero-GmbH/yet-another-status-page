#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
fi

for _ in $(seq 1 30); do
  if pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'hostzero_status'" | grep -q 1; then
  psql -U postgres -d postgres -c "CREATE DATABASE hostzero_status"
fi

npm install
npx payload migrate
