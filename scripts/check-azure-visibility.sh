#!/usr/bin/env bash
# Vérifie qu'une URL d'image Azure est publiquement accessible (anonyme).
# Usage : bash scripts/check-azure-visibility.sh "<url-azure>"
set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Usage : bash scripts/check-azure-visibility.sh \"https://itmpanelmedia.blob.core.windows.net/media/.../image.png\""
  exit 1
fi

echo "🔎 Test de visibilité : $URL"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")

case "$HTTP_CODE" in
  200) echo "✅ Accessible (200) — l'image s'affichera dans les emails." ;;
  403) echo "❌ 403 Forbidden — le container Azure n'est pas en accès 'Blob' (anonyme)." ;;
  404) echo "❌ 404 Not Found — l'image n'existe pas (mauvais chemin ou upload échoué)." ;;
  000) echo "❌ Impossible de joindre l'URL (réseau / URL invalide)." ;;
  *) echo "⚠️  Code HTTP inattendu : $HTTP_CODE" ;;
esac
