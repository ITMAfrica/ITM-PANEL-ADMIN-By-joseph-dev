#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_local() {
  export AUTH_SECRET="${AUTH_SECRET:-test-secret-minimum-32-characters-long}"
  export PUBLIC_API_KEY="${PUBLIC_API_KEY:-test-api-key}"
  export ALLOW_PUBLIC_REGISTER="${ALLOW_PUBLIC_REGISTER:-false}"
  export NODE_ENV="${NODE_ENV:-test}"
  npm run test
}

if [[ "${1:-}" == "--local" ]]; then
  run_local
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker introuvable — lancement local (npm run test)"
  run_local
  exit 0
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker n'est pas démarré — lancement local (npm run test)"
  run_local
  exit 0
fi

echo "Tests API dans Docker (profil test)..."
docker compose --profile test run --rm --build test
