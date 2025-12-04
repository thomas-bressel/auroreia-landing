# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Utiliser APP_ENV au lieu de NODE_ENV (défaut = staging pour cette branche)
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}
# NODE_ENV reste à production pour npm (c'est juste pour le build npm)
ENV NODE_ENV=production

RUN echo "🔧 Building with APP_ENV=${APP_ENV}"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:20-alpine

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY --from=builder /app/.output ./.output

RUN mkdir -p /app/data && chown -R node:node /app/data

EXPOSE 5000

USER node

CMD ["node", ".output/server/index.mjs"]