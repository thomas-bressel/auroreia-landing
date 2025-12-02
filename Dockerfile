# Dockerfile pour la production (Nuxt 3)
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code et build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier l'application buildée
COPY --from=builder /app/.output ./.output

# Créer le répertoire pour la base de données SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

# Exposer le port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Utiliser l'utilisateur non-root
USER node

# Démarrer l'application
CMD ["node", ".output/server/index.mjs"]
