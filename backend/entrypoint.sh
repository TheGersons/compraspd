#!/bin/sh
set -e

corepack enable

echo "Esperando DB..."
until nc -z db 5432; do sleep 1; done

echo "Prisma generate + migrate"
pnpm prisma generate
pnpm prisma migrate deploy

PSQL_URL="${DATABASE_URL_PSQL:-${DATABASE_URL%%\?*}}"

echo "⚙️ Ejecutando script post_migrate.sql..."
if [ -f "/db/post_migrate.sql" ]; then
  psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f /db/post_migrate.sql
  echo "✅ Script post_migrate.sql ejecutado correctamente"
else
  echo "⚠️ Archivo /db/post_migrate.sql no encontrado, omitiendo..."
fi


echo "Arrancando Nest..."
exec pnpm start:dev
