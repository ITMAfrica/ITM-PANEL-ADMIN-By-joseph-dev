#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CMD="${1:-}"
shift 2>/dev/null || true

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

restart_api() {
  echo "🔄 Redémarrage du conteneur API pour charger le nouveau client Prisma..."
  docker compose restart api
  until docker compose ps api --status running -q 2>/dev/null | grep -q .; do
    sleep 1
  done
  echo "✅ API redémarrée."
}

case "$CMD" in
  generate)
    prisma generate
    restart_api
    ;;
  push)
    prisma db push
    restart_api
    ;;
  migrate)
    prisma migrate dev "$@"
    restart_api
    ;;
  reset)
    prisma migrate reset
    restart_api
    ;;
  migrate:deploy)
    prisma migrate deploy
    restart_api
    ;;
  seed)
    prisma db seed
    ;;
  *)
    echo "Usage: bash scripts/db.sh {generate|push|migrate|reset|migrate:deploy|seed}"
    exit 1
    ;;
esac
