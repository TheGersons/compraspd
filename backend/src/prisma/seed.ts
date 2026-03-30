// ============================================================================
// SEED - DATOS ESENCIALES PARA PRODUCCIÓN
// ============================================================================
// Ubicación: backend/src/prisma/seed.ts
// Ejecutar: npx prisma db seed
// ============================================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  // ==========================================================================
  // 1. ROLES
  // ==========================================================================
  console.log('📋 Creando roles...');

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: {
      nombre: 'ADMIN',
      descripcion: 'Administrador del sistema con acceso completo',
      activo: true,
    },
  });

  const rolSupervisor = await prisma.rol.upsert({
    where: { nombre: 'SUPERVISOR' },
    update: {},
    create: {
      nombre: 'SUPERVISOR',
      descripcion: 'Supervisor de cotizaciones y compras',
      activo: true,
    },
  });

  const rolUsuario = await prisma.rol.upsert({
    where: { nombre: 'USUARIO' },
    update: {},
    create: {
      nombre: 'USUARIO',
      descripcion: 'Usuario estándar del sistema',
      activo: true,
    },
  });

  await prisma.rol.upsert({
    where: { nombre: 'COMERCIAL' },
    update: {},
    create: {
      nombre: 'COMERCIAL',
      descripcion: 'Jefe Comercial: seguimiento de compras de licitaciones y ofertas comerciales',
      activo: true,
    },
  });

  console.log('✅ Roles creados\n');

  // ==========================================================================
  // 2. PERMISOS
  // ==========================================================================
  console.log('🔐 Creando permisos...');

  const permisos = [
    // Cotizaciones
    { modulo: 'cotizaciones', accion: 'crear', descripcion: 'Crear cotizaciones' },
    { modulo: 'cotizaciones', accion: 'ver', descripcion: 'Ver cotizaciones' },
    { modulo: 'cotizaciones', accion: 'editar', descripcion: 'Editar cotizaciones' },
    { modulo: 'cotizaciones', accion: 'eliminar', descripcion: 'Eliminar cotizaciones' },
    { modulo: 'cotizaciones', accion: 'aprobar', descripcion: 'Aprobar cotizaciones' },

    // Compras
    { modulo: 'compras', accion: 'crear', descripcion: 'Crear órdenes de compra' },
    { modulo: 'compras', accion: 'ver', descripcion: 'Ver órdenes de compra' },
    { modulo: 'compras', accion: 'editar', descripcion: 'Editar órdenes de compra' },

    // Usuarios
    { modulo: 'usuarios', accion: 'crear', descripcion: 'Crear usuarios' },
    { modulo: 'usuarios', accion: 'ver', descripcion: 'Ver usuarios' },
    { modulo: 'usuarios', accion: 'editar', descripcion: 'Editar usuarios' },
    { modulo: 'usuarios', accion: 'eliminar', descripcion: 'Eliminar usuarios' },

    // Catálogos
    { modulo: 'catalogos', accion: 'crear', descripcion: 'Crear catálogos' },
    { modulo: 'catalogos', accion: 'ver', descripcion: 'Ver catálogos' },
    { modulo: 'catalogos', accion: 'editar', descripcion: 'Editar catálogos' },

    // Reportes
    { modulo: 'reportes', accion: 'ver', descripcion: 'Ver reportes' },
    { modulo: 'reportes', accion: 'exportar', descripcion: 'Exportar reportes' },
  ];

  for (const permiso of permisos) {
    await prisma.permisos.upsert({
      where: {
        modulo_accion: {
          modulo: permiso.modulo,
          accion: permiso.accion,
        },
      },
      update: {},
      create: permiso,
    });
  }

  console.log('✅ Permisos creados\n');

  // ==========================================================================
  // 3. ASIGNAR PERMISOS A ROLES
  // ==========================================================================
  console.log('🔗 Asignando permisos a roles...');

  // Admin: TODOS los permisos
  const todosPermisos = await prisma.permisos.findMany();
  for (const permiso of todosPermisos) {
    await prisma.rolPermisos.upsert({
      where: {
        rolId_permisoId: {
          rolId: rolAdmin.id,
          permisoId: permiso.id,
        },
      },
      update: {},
      create: {
        rolId: rolAdmin.id,
        permisoId: permiso.id,
      },
    });
  }

  // Supervisor: Permisos de cotizaciones y compras
  const permisosSupervisor = await prisma.permisos.findMany({
    where: {
      OR: [
        { modulo: 'cotizaciones' },
        { modulo: 'compras' },
        { modulo: 'reportes' },
        { modulo: 'catalogos', accion: 'ver' },
      ],
    },
  });
  for (const permiso of permisosSupervisor) {
    await prisma.rolPermisos.upsert({
      where: {
        rolId_permisoId: {
          rolId: rolSupervisor.id,
          permisoId: permiso.id,
        },
      },
      update: {},
      create: {
        rolId: rolSupervisor.id,
        permisoId: permiso.id,
      },
    });
  }

  // Usuario: Permisos básicos
  const permisosUsuario = await prisma.permisos.findMany({
    where: {
      OR: [
        { modulo: 'cotizaciones', accion: 'crear' },
        { modulo: 'cotizaciones', accion: 'ver' },
        { modulo: 'catalogos', accion: 'ver' },
      ],
    },
  });
  for (const permiso of permisosUsuario) {
    await prisma.rolPermisos.upsert({
      where: {
        rolId_permisoId: {
          rolId: rolUsuario.id,
          permisoId: permiso.id,
        },
      },
      update: {},
      create: {
        rolId: rolUsuario.id,
        permisoId: permiso.id,
      },
    });
  }

  console.log('✅ Permisos asignados a roles\n');

  // ==========================================================================
  // 4. DEPARTAMENTOS
  // ==========================================================================
  console.log('🏢 Creando departamentos...');

  const departamentos = [
    'Administración',
    'Compras',
    'Operaciones',
    'Tecnología',
    'Finanzas',
    'Proyectos',
  ];

  const deptCreados: { id: string; nombre: string }[] = [];

  for (const nombre of departamentos) {
    const existente = await prisma.departamento.findFirst({
      where: { nombre }
    });

    if (existente) {
      deptCreados.push(existente);
    } else {
      const dept = await prisma.departamento.create({
        data: { nombre }
      });
      deptCreados.push(dept);
    }
  }

  console.log('✅ Departamentos creados\n');

  // ==========================================================================
  // 5. USUARIO ADMIN
  // ==========================================================================
  console.log('👤 Creando usuario administrador...');

  const passwordHash = await bcrypt.hash('Bykronox845', 10);

  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@sistema.com',
      passwordHash: passwordHash,
      rolId: rolAdmin.id,
      departamentoId: deptCreados[0].id, // Administración
      activo: true,
    },
  });

  console.log('✅ Usuario admin creado');
  console.log('   📧 Email: admin@sistema.com');
  console.log('   🔑 Password: Bykronox845\n');

  // ==========================================================================
  // 6. ÁREAS Y TIPOS
  // ==========================================================================
  console.log('📂 Creando áreas y tipos...');

  const areas = [
    {
      nombreArea: 'Tecnología',
      tipo: 'tecnica',
      icono: '💻',
      tipos: ['Hardware', 'Software', 'Telecomunicaciones', 'Soporte Técnico'],
    },
    {
      nombreArea: 'Oficina',
      tipo: 'operativa',
      icono: '🏢',
      tipos: ['Papelería', 'Mobiliario', 'Equipos de Oficina', 'Limpieza'],
    },
    {
      nombreArea: 'Proyectos',
      tipo: 'proyectos',
      icono: '🏗️',
      tipos: ['Construcción', 'Infraestructura', 'Equipamiento', 'Servicios'],
    },
    {
      nombreArea: 'Comercial',
      tipo: 'comercial',
      icono: '💼',
      tipos: ['Marketing', 'Ventas', 'Distribución', 'Logística'],
    },
  ];

  for (const areaData of areas) {
    const { tipos, ...areaInfo } = areaData;

    // Buscar si el área ya existe
    let area = await prisma.area.findFirst({
      where: { nombreArea: areaInfo.nombreArea }
    });

    if (!area) {
      area = await prisma.area.create({
        data: areaInfo,
      });
    }

    // Crear tipos para esta área
    for (const tipoNombre of tipos) {
      const tipoExistente = await prisma.tipo.findFirst({
        where: {
          areaId: area.id,
          nombre: tipoNombre
        }
      });

      if (!tipoExistente) {
        await prisma.tipo.create({
          data: {
            nombre: tipoNombre,
            areaId: area.id,
          },
        });
      }
    }
  }

  console.log('✅ Áreas y tipos creados\n');

  // ==========================================================================
  // 7. PAÍSES
  // ==========================================================================
  console.log('🌍 Creando países...');

  const paises = [
    { nombre: 'Honduras', codigo: 'HN', activo: true },
    { nombre: 'Estados Unidos', codigo: 'US', activo: true },
    { nombre: 'México', codigo: 'MX', activo: true },
    { nombre: 'China', codigo: 'CN', activo: true },
    { nombre: 'Guatemala', codigo: 'GT', activo: true },
    { nombre: 'El Salvador', codigo: 'SV', activo: true },
    { nombre: 'Costa Rica', codigo: 'CR', activo: true },
    { nombre: 'Panamá', codigo: 'PA', activo: true },
    { nombre: 'Colombia', codigo: 'CO', activo: true },
    { nombre: 'España', codigo: 'ES', activo: true },
  ];

  for (const pais of paises) {
    const existente = await prisma.pais.findFirst({
      where: { codigo: pais.codigo }
    });

    if (!existente) {
      await prisma.pais.create({
        data: pais,
      });
    }
  }

  console.log('✅ Países creados\n');

  // ==========================================================================
  // 8. PROVEEDORES DE EJEMPLO
  // ==========================================================================
  console.log('🏪 Creando proveedores de ejemplo...');

  const proveedores = [
    {
      nombre: 'TechSupply Honduras',
      rtn: '08011234567890',
      email: 'ventas@techsupply.hn',
      telefono: '+504 2234-5678',
      direccion: 'Col. Tepeyac, Tegucigalpa',
      activo: true,
    },
    {
      nombre: 'Oficinas y Más',
      rtn: '08019876543210',
      email: 'info@oficinasymas.hn',
      telefono: '+504 2234-8888',
      direccion: 'Blvd. Morazán, Tegucigalpa',
      activo: true,
    },
    {
      nombre: 'Importadora Global',
      rtn: '08015555555555',
      email: 'compras@importadoraglobal.com',
      telefono: '+504 2234-9999',
      direccion: 'Zona Industrial, San Pedro Sula',
      activo: true,
    },
  ];

  for (const proveedor of proveedores) {
    const existente = await prisma.proveedor.findFirst({
      where: { nombre: proveedor.nombre }
    });

    if (!existente) {
      await prisma.proveedor.create({
        data: proveedor,
      });
    }
  }

  console.log('✅ Proveedores creados\n');

  // ==========================================================================
  // 9. PROYECTO INICIAL
  // ==========================================================================
  console.log('📁 Creando proyecto inicial...');

  const proyectoExistente = await prisma.proyecto.findFirst({
    where: { nombre: 'Proyecto General' }
  });

  if (!proyectoExistente) {
    await prisma.proyecto.create({
      data: {
        nombre: 'Proyecto General',
        descripcion: 'Proyecto por defecto para cotizaciones generales',
        criticidad: 5,
        estado: true,
      },
    });
  }

  console.log('✅ Proyecto inicial creado\n');

  // ==========================================================================
  // FIN
  // ==========================================================================
  console.log('✨ Seed completado exitosamente!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 CREDENCIALES DE ACCESO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Email:    admin@sistema.com');
  console.log('   Password: Bykronox845');
  console.log('   Rol:      ADMIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });