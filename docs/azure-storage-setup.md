# Azure Blob Storage — Configuration des clés

Ce document explique comment obtenir les identifiants nécessaires au stockage des médias (images des newsletters incluses) dans Azure Blob Storage.

## Ce dont tu as besoin

- Un compte Azure (avec abonnement actif).
- Un **Storage Account** (compte de stockage).
- Un **container** nommé `media` (créé automatiquement par l'app en accès public `blob`, ou à créer manuellement).

## Étape 1 — Créer le Storage Account (si pas encore fait)

1. Portail Azure → **Storage accounts** → **Create**.
2. Renseigne abonnement, groupe de ressources, nom (ex. `itmpanelmedia`), région (même région que ton service pour limiter la latence).
3. **Performance** : Standard. **Redundancy** : LRS ou GRS selon ton budget.
4. Crée le compte, puis attends le déploiement.

## Étape 2 — Récupérer la chaîne de connexion (méthode privilégiée)

1. Ouvre le Storage Account → menu **Security + networking** → **Access keys**.
2. Clique sur **Show** pour la clé `key1`, puis copie la **Connection string**.
3. Colle-la dans `.env` :

```bash
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=itmpanelmedia;AccountKey=...;EndpointSuffix=core.windows.net"
```

L'app accepte aussi l'alternative compte + clé séparés :

```bash
AZURE_STORAGE_ACCOUNT="itmpanelmedia"
AZURE_STORAGE_ACCESS_KEY="<clé key1>"
```

## Étape 3 — Rendre le container public (accès "blob")

Les images de newsletter doivent être accessibles publiquement (sans token) pour être lisibles indéfiniment par les destinataires.

1. Storage Account → **Data storage** → **Containers**.
2. Crée (ou sélectionne) le container `media`.
3. Dans les propriétés du container, règle **Public access level** sur **Blob (anonymous read access for blobs only)**.

> L'app crée le container automatiquement avec ce niveau d'accès si tu ne l'as pas fait. À vérifier une fois après le premier upload.

## Étape 4 (optionnel) — Mettre en place un CDN

Pour de meilleures performances et une URL propre (ex. `cdn.tondomaine.com`) :

1. Azure → **Front Door and CDN profiles** (ou **Azure CDN**) → crée un profil pointant vers `https://<compte>.blob.core.windows.net`.
2. Une fois le CDN actif, renseigne :

```bash
AZURE_STORAGE_CDN_URL="https://cdn.tondomaine.com"
```

## Récapitulatif des variables `.env`

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Oui* | Chaîne de connexion complète (méthode recommandée). |
| `AZURE_STORAGE_ACCOUNT` | Oui* | Nom du compte (si pas de chaîne de connexion). |
| `AZURE_STORAGE_ACCESS_KEY` | Oui* | Clé `key1` (si pas de chaîne de connexion). |
| `AZURE_STORAGE_CONTAINER` | Non | Nom du container (défaut `media`). |
| `AZURE_STORAGE_CDN_URL` | Non | URL CDN custom (sinon URL Azure utilisée). |
| `MAX_UPLOAD_SIZE_MB` | Non | Taille max par fichier (défaut 10). |

\* Au moins la chaîne de connexion **ou** le couple compte+clé. Sans cela, le serveur refuse de démarrer.

## Vérification

Après avoir rempli les variables et redémarré le serveur, un upload dans la bibliothèque média doit retourner une URL du type `https://<compte>.blob.core.windows.net/media/<tenant>/<uuid>-<nom>`. Cette URL est directement utilisable dans les newsletters (aucun token, lecture permanente).
