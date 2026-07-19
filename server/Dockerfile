# ============================================
# Dockerfile prod — API Express (déploiement)
# Build multi-stage : plus léger, deps de prod seules.
# ============================================
FROM node:22-slim AS deps

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

FROM node:22-slim AS runtime

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Code source et Prisma
COPY package.json package-lock.json ./
COPY server ./server
COPY prisma ./prisma

# Dépendances de production
COPY --from=deps /app/node_modules ./node_modules

# tsx est nécessaire au runtime (l'API démarre en TS via tsx).
# Version pinnée pour des builds reproductibles.
RUN npm install tsx@4.22.4 --legacy-peer-deps

# Client Prisma (requis au runtime)
RUN npx prisma generate

# Création du répertoire de données et bascule vers un utilisateur non-root.
# L'image officielle node fournit l'utilisateur `node` (uid 1000).
RUN mkdir -p /app/uploads && chown -R node:node /app
USER node

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server/index.ts"]
