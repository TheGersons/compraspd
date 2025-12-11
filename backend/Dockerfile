# ============================
#  1️⃣ Etapa de dependencias (para caché)
# ============================
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# INSTALAR DEPENDENCIAS + FORZAR @nestjs/schedule
RUN pnpm install --frozen-lockfile && \
    pnpm add @nestjs/schedule --save-prod

# ============================
#  2️⃣ Etapa de build
# ============================
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# Copiar node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copiar TODO el código fuente
COPY . .

# Generate Prisma + Build
RUN pnpm db:generate && pnpm build


# ============================
#  3️⃣ Etapa final (runtime)
# ============================
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3001

# Copiamos solo lo necesario para correr la app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY prisma ./prisma

# Copiar el script SQL
COPY ./db /db

# Necesarios para entrypoint.sh
RUN apk add --no-cache postgresql-client netcat-openbsd

# Copiar y preparar entrypoint
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Usa el entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# CMD por defecto
CMD ["pnpm", "start:prod"]
