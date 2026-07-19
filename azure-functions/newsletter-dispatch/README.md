# Newsletter Dispatch — Azure Function

Timer Function qui déclenche l'envoi automatique des newsletters planifiées
sur l'API ITM, en appelant `POST /api/newsletters/dispatch`.

L'endpoint (`server/routes/newsletters.ts`) filtre les contenus `newsletter`
dont `scheduledAt <= now` et les envoie. Cette Function comble le maillon
manquant : rien ne déclenchait cet envoi à l'heure planifiée.

## Paramètres d'application (Azure)

| Nom | Description |
|-----|-------------|
| `API_BASE_URL` | URL publique de l'API, ex. `https://api.itm.example.com` (sans slash final) |
| `PUBLIC_API_KEY` | Valeur de `PUBLIC_API_KEY` de l'API (envoyée en `x-api-key`) |
| `DISPATCH_CRON` | NCRONTAB UTC, défaut `0 */15 * * * *` (toutes les 15 min) |

## Déploiement local (test)

```bash
npm install
cp local.settings.json local.settings.json  # éditer les valeurs
npm run build
func start
```

## Déploiement Azure (CLI)

```bash
az login
func azure functionapp publish <nom-de-la-function-app>
```

Puis définir les paramètres dans le portail (Configuration > Paramètres
d'application) ou via :

```bash
az functionapp config appsettings set \
  --name <nom> --resource-group <rg> \
  --settings "API_BASE_URL=https://api.itm.example.com" \
            "PUBLIC_API_KEY=<cle>" \
            "DISPATCH_CRON=0 */15 * * * *"
```

## Plan de tarification

Une Function sur un plan **Consumption** (ou Flex Consumption) suffit :
elle s'exécute quelques secondes toutes les 15 min, coût quasi nul.
