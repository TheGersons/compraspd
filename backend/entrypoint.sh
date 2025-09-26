#!/bin/sh
set -e

corepack enable

echo "Esperando DB..."
until nc -z db 5432; do sleep 1; done

echo "Prisma generate + migrate"
pnpm prisma generate
pnpm prisma migrate deploy

echo "Arrancando Nest..."
exec pnpm start:dev
