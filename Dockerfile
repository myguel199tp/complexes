# Etapa base
FROM node:20-alpine AS base

RUN npm install -g npm && apk add --no-cache libc6-compat

# Etapa para dependencias
FROM base AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Etapa de build
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa final: imagen liviana para producción
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["npm", "start"]
