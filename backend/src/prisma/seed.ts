// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear rol admin
  const adminRole = await prisma.rol.create({
    data: {
      nombre: 'ADMIN',
      descripcion: 'Administrador del sistema',
      activo: true,
    },
  });

  // 2. Crear departamento
  const dept = await prisma.departamento.create({
    data: {
      nombre: 'Sistemas',
    },
  });

  // 3. Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      nombre: 'Super Admin',
      email: 'admin@empresa.com',
      passwordHash: hashedPassword,
      rolId: adminRole.id,
      departamentoId: dept.id,
      activo: true,
    },
  });

  // 4. Permisos básicos
  const permisos = [
    { modulo: 'cotizaciones', accion: 'create' },
    { modulo: 'cotizaciones', accion: 'read' },
    { modulo: 'cotizaciones', accion: 'update' },
    { modulo: 'cotizaciones', accion: 'delete' },
    { modulo: 'usuarios', accion: 'create' },
    { modulo: 'usuarios', accion: 'read' },
  ];

  for (const perm of permisos) {
    const permiso = await prisma.permisos.create({
      data: perm,
    });

    // Asignar todos los permisos al rol ADMIN
    await prisma.rolPermisos.create({
      data: {
        rolId: adminRole.id,
        permisoId: permiso.id,
      },
    });
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });