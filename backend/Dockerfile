# ============================
#  1️⃣ Etapa de dependencias (para caché)
# ============================
# Esta etapa solo copia los archivos de manifiesto para aprovechar la caché de Docker
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ============================
#  2️⃣ Etapa de build
# ============================
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# Copiamos TODOS los archivos, incluyendo los node_modules de la etapa anterior
COPY --from=deps /app ./

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
COPY prisma ./prisma

# 🔹 Copiar el script SQL (asegúrate de tenerlo en /db/post_migrate.sql dentro del repo)
COPY ./db /db

# Necesarios para entrypoint.sh
RUN apk add --no-cache postgresql-client netcat-openbsd

# 🔹 Copiar y preparar entrypoint
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


# 🔹 Usa el entrypoint (espera DB, corre migraciones, ejecuta post_migrate, arranca Nest)
ENTRYPOINT ["/entrypoint.sh"]

# 🔹 Este CMD será sobrescrito por el entrypoint
CMD ["pnpm", "start:prod"]

