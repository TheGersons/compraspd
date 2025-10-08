import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaService();

async function upsertCurrencies() {
  await prisma.currency.upsert({
    where: { code: 'HNL' },
    update: { isBase: true, name: 'Lempira' },
    create: { code: 'HNL', name: 'Lempira', isBase: true },
  });
  await prisma.currency.upsert({
    where: { code: 'USD' },
    update: { isBase: false, name: 'US Dollar' },
    create: { code: 'USD', name: 'US Dollar', isBase: false },
  });
}

const RESOURCES = [
  'project','location','supplier','product',
  'purchaseRequest','quote','purchaseOrder','shipment'
] as const;
const ACTIONS = ['read','create','update','delete','approve','assign','receive'] as const;

//clasificar, ordenar, limpiar, estandarizar y mantener
async function upsertPermissions() {
  for (const r of RESOURCES) {
    for (const a of ACTIONS) {
      await prisma.permission.upsert({
        where: { resource_action: { resource: r, action: a } },
        update: {},
        create: { resource: r, action: a },
      });
    }
  }
}

async function role(name: string, description?: string) {
  return prisma.role.upsert({
    where: { name },
    update: { description },
    create: { name, description },
  });
}

async function mapRolePerms() {
  const perms = await prisma.permission.findMany();
  const by = (res: string, acts: string[]) =>
    perms.filter(p => p.resource === res && acts.includes(p.action)).map(p => p.id);

  // CLIENTE: CRUD limitado a lo propio + lectura relacionada + receive
  const clientePerms = [
    ...by('purchaseRequest', ['read','create','update']),
    ...by('quote', ['read']),
    ...by('purchaseOrder', ['read']),
    ...by('shipment', ['read','receive']),
    ...by('product', ['read']),
    ...by('supplier', ['read']),
  ];

  // SUPERVISOR: lectura total + aprobar/asignar/actualizar
  const supervisorPerms = [
    ...RESOURCES.flatMap(r => by(r, ['read'])),
    ...by('purchaseRequest', ['update','approve','assign','delete']),
    ...by('quote', ['update','approve','delete']),
    ...by('purchaseOrder', ['create','update','approve','delete']),
    ...by('shipment', ['create','update','receive']),
    ...by('product', ['create','update']),
    ...by('supplier', ['create','update']),
  ];

  // ADMIN: todo
  const adminPerms = perms.map(p => p.id);

  const cliente = await role('CLIENTE', 'Usuarios solicitantes internos');
  const supervisor = await role('SUPERVISOR', 'Revisan, aprueban y gestionan');
  const admin = await role('ADMIN', 'Administración del sistema');

  // Limpia mapas existentes
  await prisma.rolePermission.deleteMany({ where: { roleId: { in: [cliente.id, supervisor.id, admin.id] } } });

  await prisma.rolePermission.createMany({
    data: clientePerms.map(pid => ({ roleId: cliente.id, permissionId: pid })),
    skipDuplicates: true,
  });
  await prisma.rolePermission.createMany({
    data: supervisorPerms.map(pid => ({ roleId: supervisor.id, permissionId: pid })),
    skipDuplicates: true,
  });
  await prisma.rolePermission.createMany({
    data: adminPerms.map(pid => ({ roleId: admin.id, permissionId: pid })),
    skipDuplicates: true,
  });

  return { cliente, supervisor, admin };
}

async function adminUser(adminRoleId: string) {
  const email = 'admin@empresa.local';
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    const hash = await bcrypt.hash('Admin1234', 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        fullName: 'Administrador del Sistema',
        roleId: adminRoleId,
        departmentId: null,
        isActive: true,
      },
    });
  }
}

async function main() {
  await upsertCurrencies();
  await upsertPermissions();
  const { admin } = await mapRolePerms();
  await adminUser(admin.id);
  console.log('Seed completado.');
}

main().finally(async () => prisma.$disconnect());
