---
name: add-feature
description: À utiliser lors de l'ajout de toute nouvelle fonctionnalité dans ITM Panel Admin. Exige une phase d'audit complète de l'architecture environnante avant toute implémentation, et impose des points de recul réguliers pendant le développement pour éviter les régressions et la dette technique. Ne pas utiliser pour de simples corrections de bugs ou du refactoring mineur.
---

# Ajout de Fonctionnalité — ITM Panel Admin

## Règle Fondamentale

Tu opères sur **ITM Panel Admin** — un CMS SaaS multi-tenant (Next.js 16 App Router + Express 5 API + Prisma + PostgreSQL). Toute nouvelle fonctionnalité suit **deux phases obligatoires et distinctes**.

---

## PHASE 1 : AUDIT — Comprendre avant d'écrire

Avant la moindre ligne de code, tu **DOIS** réaliser un audit complet de l'architecture impactée. Cette phase ne produit **AUCUN code** — uniquement de la compréhension.

### 1.1 Cartographier la zone d'impact

Parcourt **systématiquement** les couches concernées en lisant les fichiers :

| Couche | Emplacement | Points à vérifier |
|--------|-------------|-------------------|
| **Schéma DB** | `prisma/schema.prisma` | Modèles, relations, enums. Nouveau modèle nécessaire ? Modification ? Migration ? |
| **Routes API** | `server/routes/` | Routes existantes, chaîne middleware (`requireAuth` → `requireTenantQuery`/`requireTenantBody` → `requireTenantRole`/`requireRole`) |
| **Controllers** | `server/controllers/` | Pattern standard : `parseBody(schema, req, res)` pour validation Zod, `req.authorizedTenantId!` pour le tenant, `getAuthorizedContent`/`getAuthorizedContentWithRole` pour l'autorisation |
| **Services** | `server/services/` | Logique métier via `db` (Prisma singleton), interfaces d'entrée/sortie, mappers dans `server/services/mappers/` |
| **Schémas Zod** | `server/lib/schemas.ts` | Validation existante, nouveau schéma à ajouter |
| **Middlewares** | `server/middleware/` | `auth.ts` (JWT session), `tenant.ts` (isolation multi-tenant), `rbac.ts` (contrôle d'accès par rôle), `api-key.ts`, `upload.ts`, `error.ts` |
| **Hooks React Query** | `src/hooks/` | Pattern : `useQuery`/`useMutation` + `apiFetch` + `queryClient.invalidateQueries` |
| **Store Zustand** | `src/lib/store.ts` | ⚠️ **Ne pas y ajouter d'état** — le README indique P2 : découpage du store monolithique. Utiliser React Query pour les données serveur, `useState` local pour l'état UI |
| **Types** | `src/lib/types.ts` | Types frontend partagés : `ContentItem`, `MediaItem`, `Campaign`, `Subscriber`, `CMSUser`, etc. |
| **Composants** | `src/components/` | Vues dans `src/components/views/`, layout standard via `ViewShell` → `ViewSubNav` → `ViewTabPanel`, `ViewContentSurface`, `ViewDataTable`, shadcn/ui dans `src/components/ui/` |
| **Navigation** | `src/lib/navigation.ts`, `src/lib/app-routes.ts` | `PageId`, `SECTION_ITEMS`, `ROUTABLE_PAGES`, `viewMap` dans `src/components/main-app.tsx` |
| **i18n** | `src/lib/i18n/` | **Traductions FR + EN obligatoires** pour tout texte visible. Le type `TranslationKey = typeof translations.fr` garantit la sécurité au compile-time |
| **Design** | `src/lib/editorial-design.ts`, `src/components/view-layout.tsx` | Tokens : `brandColors` (`#1D141F`, `#E2F343`), `editorialClasses`, `viewPageClasses`, blue primaire `oklch(0.55_0.18_250)` |

### 1.2 Tracer le flux de données complet

Identifie le chemin complet de la feature :

```
Frontend (Hook React Query)
  → apiFetch (src/lib/api-client.ts, credentials: 'include')
    → Route Express (server/routes/*.ts)
      → Middleware (auth → tenant → rbac)
        → Controller (server/controllers/*.ts)
          → parseBody(schema, req, res) → validation Zod
          → getAuthorizedContent / getAuthorizedContentWithRole → autorisation
          → Service (server/services/*.ts)
            → db (server/lib/prisma.ts) → Prisma → PostgreSQL
          ← Données brutes
        ← Mappers (server/services/mappers/*.ts)
      ← JSON response (status + body)
    ← Response
  ← Données typées
→ Composant React (useTranslation, useAppStore, cn(), motion.div, framer-motion)
```

### 1.3 Livrable de l'audit

**Avant de coder, tu résumes à l'utilisateur :**
- Quels fichiers seront modifiés et créés
- Le flux de données complet
- Les patterns existants réutilisés
- Les risques identifiés

**Ne commence l'implémentation qu'une fois l'audit présenté.**

---

## PHASE 2 : IMPLÉMENTATION — Avec recul continu

Pendant le développement, tu **DOIS** vérifier ton travail à chaque étape clé pour éviter régressions et dette technique.

### 2.1 Points de recul obligatoires

| Moment | Vérification |
|--------|-------------|
| **Après chaque fichier créé ou modifié** | Imports corrects, types cohérents, style respecte les conventions du projet |
| **Après la couche backend complète** (route + controller + service + schema) | Chaîne middleware correcte, validation Zod en place, codes HTTP appropriés, réponse alignée avec les types frontend |
| **Après la couche frontend complète** (hook + composant + i18n) | States loading/error/empty/success tous gérés, traductions FR+EN présentes, layout utilisant les composants standard (`ViewShell`, `ViewSubNav`, `ViewTabPanel`, `ViewContentSurface`, `ViewDataTable`) |
| **Avant de déclarer la tâche terminée** | Checklist finale complète |

### 2.2 Checklist finale anti-régression

- [ ] Aucune fonctionnalité existante cassée
- [ ] Pas de code mort, pas de duplication
- [ ] Pas de `any` introduit (sauf absolue nécessité documentée)
- [ ] Types cohérents entre frontend (`src/lib/types.ts`) et backend
- [ ] Schémas Zod (`server/lib/schemas.ts`) alignés avec les modèles Prisma
- [ ] Traductions FR + EN présentes et correctes (compact-check via `TranslationKey`)
- [ ] Gestion d'erreur : `console.error` + `res.status(500).json({ error: '...' })` côté serveur
- [ ] Codes HTTP appropriés : 200 (succès), 201 (création), 400 (validation), 401 (non auth), 403 (non autorisé), 404 (non trouvé), 409 (conflit), 500 (erreur serveur)
- [ ] Le code suit les patterns existants (ne pas inventer de nouveaux patterns sans raison valable)
- [ ] La vue est enregistrée dans le `viewMap` de `main-app.tsx` si c'est une nouvelle page

### 2.3 Dette technique à NE PAS aggraver

Le projet (maturité 3/5, README.md) a des priorités **P2 documentées** :

1. **Store Zustand monolithique** (`src/lib/store.ts`) : Ne **PAS** ajouter de nouvel état dans ce store. Utiliser React Query pour les données serveur, ou `useState`/`useReducer` local pour l'état UI transitoire. Si un nouveau store est vraiment nécessaire, le créer séparément dans `src/lib/`.

2. **Modèles Prisma orphelins** : Avant d'ajouter un nouveau modèle, vérifier qu'il est vraiment nécessaire. Ne pas créer de tables inutilisées.

3. **Analytics synthétiques** : Les analytics actuels utilisent des données mockées — ne pas continuer à ajouter des métriques sans les connecter à des données réelles.

4. **Couverture de tests faible (35/100)** : Idéalement, ajouter un test smoke pour chaque nouvelle route API (dans `server/tests/`).

---

## Patterns de code — Référence rapide

### Route Express (`server/routes/x.ts`)

```typescript
import { Router } from 'express';
import * as controller from '../controllers/x.controller';
import { requireAuth } from '../middleware/auth';
import { requireTenantQuery, requireTenantBody } from '../middleware/tenant';
import { requireTenantRole } from '../middleware/rbac';

const router = Router();
const canWrite = requireTenantRole('editor');

router.get('/', requireAuth, requireTenantQuery, controller.list);
router.post('/', requireAuth, requireTenantBody, canWrite, controller.create);
router.patch('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
```

### Controller (`server/controllers/x.controller.ts`)

```typescript
import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import { parseBody } from '../lib/validate';
import { monSchema } from '../lib/schemas';
import * as monService from '../services/mon-service';

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await monService.list(tenantId);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/x:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = parseBody(monSchema, req, res);
    if (!body) return; // parseBody already sent 400
    const tenantId = req.authorizedTenantId!;
    const row = await monService.create(tenantId, body);
    res.status(201).json(row);
  } catch (error) {
    console.error('POST /api/x:', error);
    res.status(500).json({ error: 'Failed to create' });
  }
}
```

### Service (`server/services/mon-service.ts`)

```typescript
import { db } from '../lib/prisma';

export async function list(tenantId: string) {
  return db.monModele.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(tenantId: string, data: { name: string }) {
  return db.monModele.create({
    data: { ...data, tenantId },
  });
}
```

### Schéma Zod (`server/lib/schemas.ts`)

```typescript
import { z } from 'zod';

export const monSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});
```

### Hook React Query (`src/hooks/use-x.ts`)

```typescript
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export function useX(tenantId: string) {
  return useQuery({
    queryKey: ['x', tenantId],
    queryFn: async () => {
      const res = await apiFetch(`/x?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!tenantId,
  });
}

export function useCreateX() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiFetch('/x', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['x'] }),
  });
}
```

### Vue (`src/components/views/ma-vue.tsx`)

```typescript
'use client';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { ViewShell, ViewSubNav, ViewTabPanel, ViewContentSurface } from '@/components/view-layout';
import { useX } from '@/hooks/use-x';
import { motion } from 'framer-motion';

export function MaVue() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data, isLoading, error } = useX(activeTenantId);

  return (
    <ViewShell>
      <ViewTabPanel>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t.common.loading}...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{t.common.errorLoading}</p>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">{t.common.noResults}</p>
        ) : (
          data.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ViewContentSurface>{item.name}</ViewContentSurface>
            </motion.div>
          ))
        )}
      </ViewTabPanel>
    </ViewShell>
  );
}
```

### Enregistrement de la vue dans `main-app.tsx`

```typescript
// Dans src/components/main-app.tsx
import { MaVue } from '@/components/views/ma-vue';

const viewMap: Record<string, React.ComponentType> = {
  // ... views existantes
  'ma-page': MaVue,
};
```

---

## Conventions rapides

- **Icônes** : `lucide-react` uniquement (ex. `import { Plus, Search } from 'lucide-react'`)
- **Couleur primaire** : `oklch(0.55_0.18_250)` (bleu ITM)
- **Couleurs brand** : `#1D141F` (dark), `#E2F343` (yellow)
- **État global** : `useAppStore((s) => s.activeTenantId)` — accès au store Zustand
- **Navigation** : `setActivePage(pageId)` depuis le store
- **i18n** : `const { t, locale } = useTranslation()` → `t.monNamespace.maClef`
- **Dates** : `toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {...})`
- **Motion** : `motion.div` de framer-motion, toujours avec `initial={{ opacity: 0, y: 8 }}`
- **Bordures** : `rounded-xl` pour cartes, `rounded-lg` pour inputs/boutons
- **Espacement** : `space-y-5` entre sections, `gap-3` entre éléments
- **Classes CSS** : `cn()` de `@/lib/utils` (clsx + tailwind-merge)
- **Validation** : `parseBody(schema, req, res)` côté serveur — renvoie `null` si invalide (le 400 est déjà envoyé)
- **Auth middleware chain** : `requireAuth` → `requireTenantQuery` → `requireTenantRole('editor')`
- **Type i18n** : `TranslationKey = typeof translations.fr` (typescript vérifie les clés au compile-time)
- **Fichiers hook** : Toujours commencer par `'use client'`
- **Fichiers composant** : Toujours commencer par `'use client'`
