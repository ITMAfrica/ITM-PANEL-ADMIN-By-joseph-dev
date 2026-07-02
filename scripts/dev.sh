#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SETUP_DB=false
for arg in "$@"; do
  if [[ "$arg" == "--setup" ]]; then
    SETUP_DB=true
  fi
done

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker n'est pas installé ou introuvable dans le PATH."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker n'est pas démarré. Lancez Docker Desktop puis réessayez."
  exit 1
fi

echo "🐳 Démarrage des services Docker (postgres, api)..."
docker compose up -d --build

echo "⏳ Attente de PostgreSQL..."
until docker compose exec -T postgres pg_isready -U itm -d itm_panel >/dev/null 2>&1; do
  sleep 1
done

if [[ "$SETUP_DB" == true ]]; then
  echo "🗄️  Initialisation de la base (generate, push)..."
  bash scripts/db.sh generate
  bash scripts/db.sh push
fi

echo "⏳ Attente de l'API (http://localhost:3001)..."
ready=false
for _ in $(seq 1 60); do
  if curl -sf http://localhost:3001/api >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "$ready" != true ]]; then
  echo "❌ L'API ne répond pas sur le port 3001. Vérifiez les logs : docker compose logs api"
  exit 1
fi

echo ""
echo "✅ Services Docker prêts"
echo "   • API      → http://localhost:3001"
echo "   • Postgres → localhost:5432"
echo ""
echo "🚀 Démarrage du frontend Next.js sur http://localhost:3002"
echo "   (Ctrl+C arrête uniquement le frontend ; Docker reste actif)"
echo ""

exec npx next dev -H 0.0.0.0 -p 3002
