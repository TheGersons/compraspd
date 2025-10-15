// scripts/delete-failed-migration.js
// Ejecuta este script con: node scripts/delete-failed-migration.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando migración fallida...\n');

  // Ver la migración fallida
  const failedMigration = await prisma.$queryRaw`
    SELECT * FROM "_prisma_migrations" 
    WHERE migration_name = '20251014232008_add'
  `;
  
  if (failedMigration.length === 0) {
    console.log('✅ No hay migración fallida. Ya puedes aplicar nuevas migraciones.\n');
    return;
  }

  console.log('⚠️  Migración fallida encontrada:');
  console.table(failedMigration);

  // Eliminar la migración fallida
  console.log('\n🗑️  Eliminando migración fallida de la tabla _prisma_migrations...');
  
  const deleted = await prisma.$executeRaw`
    DELETE FROM "_prisma_migrations" 
    WHERE migration_name = '20251014232008_add'
  `;
  
  console.log(`✅ Eliminada correctamente (${deleted} fila eliminada)\n`);

  console.log('✨ Ahora puedes aplicar la migración con:');
  console.log('   npx prisma migrate dev --name fix_duplicates_final\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });