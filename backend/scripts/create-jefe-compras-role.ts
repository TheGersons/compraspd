/**
 * ============================================================
 * MIGRACIÓN: Crear rol JEFE_COMPRAS en la base de datos
 * ============================================================
 * Crea el rol "JEFE_COMPRAS" si no existe.
 *
 * Ejecutar con:
 *   npx ts-node scripts/create-jefe-compras-role.ts
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.rol.findFirst({
    where: { nombre: 'JEFE_COMPRAS' },
  });

  if (existing) {
    console.log('✅ Rol JEFE_COMPRAS ya existe:', existing.id);
    return;
  }

  const rol = await prisma.rol.create({
    data: {
      nombre: 'JEFE_COMPRAS',
      descripcion: 'Jefe de Compras — acceso equivalente a Supervisor con permisos de asignación y gestión completa',
      activo: true,
    },
  });

  console.log('✅ Rol JEFE_COMPRAS creado:', rol.id);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
