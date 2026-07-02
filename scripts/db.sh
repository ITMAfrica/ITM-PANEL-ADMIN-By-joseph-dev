#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CMD="${1:-}"

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker n'est pas installé ou introuvable dans le PATH."
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Lancez Docker Desktop puis réessayez."
    exit 1
  fi
}

ensure_services() {
  if ! docker compose ps api --status running -q 2>/dev/null | grep -q .; then
    echo "🐳 Démarrage des services Docker (postgres, api)..."
    docker compose up -d --build
  fi
  until docker compose exec -T postgres pg_isready -U itm -d itm_panel >/dev/null 2>&1; do
    sleep 1
  done
}

prisma() {
  ensure_docker
  ensure_services
  docker compose exec -T api npx prisma "$@"
}

case "$CMD" in
  generate)
    prisma generate
    ;;
  push)
    prisma db push
    ;;
  migrate)
    prisma migrate dev
    ;;
  reset)
    prisma migrate reset
    ;;
  migrate:deploy)
    prisma migrate deploy
    ;;
  *)
    echo "Usage: bash scripts/db.sh {generate|push|migrate|reset|migrate:deploy}"
    exit 1
    ;;
esac
