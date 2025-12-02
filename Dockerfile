# Dockerfile pour staging et production (Nuxt 3)
# Usage:
#   docker build --build-arg NODE_ENV=staging -t auroreia-landing:staging .
#   docker build --build-arg NODE_ENV=production -t auroreia-landing:prod .

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Argument pour définir l'environnement de build
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application (utilise NODE_ENV pour la config)
RUN npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:20-alpine

# Récupérer l'environnement depuis le build stage
ARG NODE_ENV=staging
# ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=5000

WORKDIR /app

# Copier l'application buildée
COPY --from=builder /app/.output ./.output

# Créer le répertoire pour la base de données SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

# Exposer le port
EXPOSE 5000

# Utiliser l'utilisateur non-root
USER node

# Démarrer l'application
CMD ["node", ".output/server/index.mjs"]