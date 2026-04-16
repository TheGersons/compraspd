/**
 * ============================================================
 * MIGRACIÓN: Reparar extensiones truncadas en archivos de chat
 * ============================================================
 *
 * Contexto:
 *   Un bug en uploadChatFile() truncaba el nombre completo del archivo
 *   (incluyendo extensión) a 50 caracteres. Ejemplo:
 *     "FR-LG-01_SOLICITUD_DE_SERVICIOS_-_Grua_Jamastran.xlsx" (53 chars)
 *     → subido como "FR-LG-01_SOLICITUD_DE_SERVICIOS_-_Grua_Jamastran.x" (50 chars)
 *
 * Estrategia:
 *   1. Obtener todos los Adjuntos de la DB con su nombreArchivo correcto
 *      y el chatId (via Mensaje).
 *   2. Reconstruir la ruta WebDAV del archivo (basePath/chats/year/month/CHAT-xxx/filename).
 *   3. Detectar archivos cuyo safeOriginal (parte tras el timestamp) tiene exactamente
 *      50 chars → candidatos a extensión truncada.
 *   4. Comparar extensión del archivo en Nextcloud vs extensión correcta en DB.
 *   5. Si difieren: renombrar en Nextcloud (WebDAV MOVE) y actualizar DB.
 *
 * Uso:
 *   # Solo mostrar qué se cambiaría (dry-run, por defecto):
 *   npx ts-node scripts/fix-chat-file-extensions.ts
 *
 *   # Aplicar cambios reales:
 *   npx ts-node scripts/fix-chat-file-extensions.ts --fix
 *
 * Notas:
 *   - Renombrar un archivo en Nextcloud NO invalida sus share links.
 *   - Los share links siguen funcionando por file-ID, no por ruta.
 *   - El campo direccionArchivo en DB (share link) NO necesita actualizarse.
 *   - Si direccionArchivo es una URL WebDAV directa (fallback), sí se actualiza.
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const WEBDAV_URL   = process.env.NEXTCLOUD_WEBDAV_URL   || '';
const USERNAME     = process.env.NEXTCLOUD_USERNAME      || '';
const PASSWORD     = process.env.NEXTCLOUD_PASSWORD      || '';
const BASE_PATH    = process.env.NEXTCLOUD_BASE_PATH     || '';
const IS_DRY_RUN   = !process.argv.includes('--fix');

const AUTH_HEADER  = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extOf(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i > 0 ? filename.slice(i).toLowerCase() : '';
}

/**
 * Dado el nombre de archivo en Nextcloud (formato: {timestamp}_{safeOriginal}),
 * devuelve la longitud del safeOriginal.
 * El timestamp es un número de 13 dígitos seguido de "_".
 */
function safeOriginalLength(filename: string): number {
  const match = filename.match(/^\d{13}_(.+)$/);
  return match ? match[1].length : -1;
}

/**
 * Verifica si un archivo existe en Nextcloud via HEAD.
 */
async function fileExists(webdavPath: string): Promise<boolean> {
  try {
    const res = await fetch(`${WEBDAV_URL}/${webdavPath}`, {
      method: 'HEAD',
      headers: { Authorization: AUTH_HEADER },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Lista archivos en una carpeta de Nextcloud via PROPFIND.
 * Devuelve los nombres de archivo (solo el basename) encontrados.
 */
async function listFolder(folderPath: string): Promise<string[]> {
  try {
    const res = await fetch(`${WEBDAV_URL}/${folderPath}`, {
      method: 'PROPFIND',
      headers: {
        Authorization: AUTH_HEADER,
        Depth: '1',
        'Content-Type': 'application/xml',
      },
      body: `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:">
  <d:prop><d:displayname/></d:prop>
</d:propfind>`,
    });

    if (!res.ok) return [];

    const xml = await res.text();
    // Extraer hrefs del XML de respuesta WebDAV
    const hrefRe = /<d:href>([^<]+)<\/d:href>/g;
    const names: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = hrefRe.exec(xml)) !== null) {
      const href = decodeURIComponent(m[1]);
      const basename = href.split('/').filter(Boolean).pop() || '';
      // Excluir la carpeta misma
      if (basename && !folderPath.endsWith(basename)) {
        names.push(basename);
      }
    }
    return names;
  } catch {
    return [];
  }
}

/**
 * Renombra un archivo en Nextcloud usando WebDAV MOVE.
 */
async function renameFile(oldPath: string, newPath: string): Promise<boolean> {
  const destination = `${WEBDAV_URL}/${newPath}`;
  try {
    const res = await fetch(`${WEBDAV_URL}/${oldPath}`, {
      method: 'MOVE',
      headers: {
        Authorization: AUTH_HEADER,
        Destination: destination,
        Overwrite: 'F',
      },
    });
    return res.ok || res.status === 201;
  } catch (err) {
    console.error(`  ✗ Error al renombrar: ${(err as Error).message}`);
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log(' fix-chat-file-extensions.ts');
  console.log(IS_DRY_RUN
    ? ' MODO: dry-run (sin cambios) — usa --fix para aplicar'
    : ' MODO: FIX (aplicando cambios reales)');
  console.log('══════════════════════════════════════════════════');
  console.log('');

  if (!WEBDAV_URL || !USERNAME || !PASSWORD || !BASE_PATH) {
    console.error('ERROR: Variables de entorno de Nextcloud no configuradas.');
    console.error('  Necesarias: NEXTCLOUD_WEBDAV_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_PASSWORD, NEXTCLOUD_BASE_PATH');
    process.exit(1);
  }

  // ── 1. Obtener todos los adjuntos con datos de mensaje ─────────────────────
  console.log('Cargando adjuntos desde la base de datos...');
  const adjuntos = await prisma.adjuntos.findMany({
    where: {
      nombreArchivo: { not: null },
    },
    include: {
      mensaje: {
        select: { chatId: true, creado: true },
      },
    },
    orderBy: { creado: 'asc' },
  });

  console.log(`  → ${adjuntos.length} adjuntos con nombreArchivo encontrados.\n`);

  let candidatos = 0;
  let reparados  = 0;
  let fallidos   = 0;
  let yaCorrectos = 0;

  for (const adj of adjuntos) {
    const nombreCorrecto = adj.nombreArchivo!;
    const chatId         = adj.mensaje.chatId;
    const fechaCreacion  = adj.mensaje.creado;

    const year  = fechaCreacion.getFullYear();
    const month = String(fechaCreacion.getMonth() + 1).padStart(2, '0');
    const chatFolder = `CHAT-${chatId.substring(0, 8)}`;

    // Reconstruir la ruta base del folder en Nextcloud
    const folderPath = `${BASE_PATH}/chats/${year}/${month}/${chatFolder}`;

    // El nombre del archivo en Nextcloud es {timestamp}_{safeOriginal}
    // Donde safeOriginal = nombreCorrecto.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 50)
    // (antes del fix, la extensión quedaba dentro de los 50 chars)
    const rawBase      = nombreCorrecto.slice(0, nombreCorrecto.lastIndexOf('.') > 0 ? nombreCorrecto.lastIndexOf('.') : undefined);
    const corrExt      = extOf(nombreCorrecto); // extensión correcta, ej: ".xlsx"

    // safeOriginal ANTES del fix (todo truncado a 50, incluyendo extensión)
    const safeOriginalBuggy = nombreCorrecto
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 50);

    // safeOriginal DESPUÉS del fix (base truncado a 50 + extensión completa)
    const safeBase    = rawBase.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 50);
    const safeOriginalFixed = `${safeBase}${corrExt}`;

    // Si ambos son iguales, el nombre nunca fue truncado → no es candidato
    if (safeOriginalBuggy === safeOriginalFixed) {
      continue;
    }

    // Si el safeOriginal buggy no tiene exactamente 50 chars, tampoco aplica
    if (safeOriginalBuggy.length !== 50) {
      continue;
    }

    candidatos++;

    // La extensión que quedó guardada (truncada)
    const truncExt = extOf(safeOriginalBuggy);

    console.log(`[${candidatos}] ${nombreCorrecto}`);
    console.log(`    Extension correcta : "${corrExt}"  |  Extension truncada: "${truncExt}"`);
    console.log(`    Folder             : ${folderPath}`);

    // El archivo en Nextcloud puede tener cualquier timestamp al frente.
    // Si direccionArchivo es URL WebDAV directa, extraemos el filename.
    // Si es share link opaco, hacemos PROPFIND al folder para encontrarlo.
    let cloudFilename: string | null = null;

    if (adj.direccionArchivo.includes(WEBDAV_URL)) {
      // URL WebDAV directa
      const urlPath = adj.direccionArchivo.replace(WEBDAV_URL + '/', '');
      cloudFilename = urlPath.split('/').pop() || null;
    } else {
      // Share link opaco — buscar en el folder via PROPFIND
      const filesInFolder = await listFolder(folderPath);
      // El archivo correcto es el que tiene exactamente 50 chars en su safeOriginal
      // Y cuyo prefijo coincide con el safeOriginalBuggy esperado
      const candidate = filesInFolder.find((name) => {
        const soLen = safeOriginalLength(name);
        if (soLen !== 50) return false;
        // Verificar que el safeOriginal del archivo coincide con el esperado
        const match = name.match(/^\d{13}_(.+)$/);
        if (!match) return false;
        return match[1] === safeOriginalBuggy;
      });

      if (candidate) {
        cloudFilename = candidate;
      } else {
        console.log(`    ⚠  Archivo no encontrado en Nextcloud (PROPFIND en ${folderPath}).`);
        console.log(`       Buscando: (timestamp)_${safeOriginalBuggy}`);
        const found50 = filesInFolder.filter(n => safeOriginalLength(n) === 50);
        if (found50.length > 0) {
          console.log(`       Archivos con 50 chars en la carpeta: ${found50.join(', ')}`);
        }
        fallidos++;
        console.log('');
        continue;
      }
    }

    // A este punto cloudFilename siempre tiene valor (los casos null hacen continue arriba)
    const resolvedFilename: string = cloudFilename!;

    // Verificar que el safeOriginal del cloud filename tiene 50 chars (confirmar que es el archivo buggy)
    const soLen = safeOriginalLength(resolvedFilename);
    if (soLen !== 50) {
      console.log(`    ✓  El archivo ya tiene nombre correcto (${resolvedFilename}), omitiendo.`);
      yaCorrectos++;
      console.log('');
      continue;
    }

    // Construir el nuevo nombre correcto
    const timestampMatch = resolvedFilename.match(/^(\d{13})_/);
    if (!timestampMatch) {
      console.log(`    ✗  No se pudo extraer timestamp del nombre "${resolvedFilename}".`);
      fallidos++;
      console.log('');
      continue;
    }

    const timestamp   = timestampMatch[1];
    const newFilename = `${timestamp}_${safeOriginalFixed}`;
    const oldFullPath = `${folderPath}/${resolvedFilename}`;
    const newFullPath = `${folderPath}/${newFilename}`;

    console.log(`    Renombrar: ${resolvedFilename}`);
    console.log(`          → : ${newFilename}`);

    if (IS_DRY_RUN) {
      console.log(`    [DRY-RUN] Se renombraría el archivo (usa --fix para aplicar).`);
      reparados++;
    } else {
      // Verificar que el archivo existe antes de renombrar
      const existe = await fileExists(oldFullPath);
      if (!existe) {
        console.log(`    ✗  Archivo no encontrado en Nextcloud: ${oldFullPath}`);
        fallidos++;
        console.log('');
        continue;
      }

      const ok = await renameFile(oldFullPath, newFullPath);
      if (ok) {
        console.log(`    ✓  Renombrado exitosamente.`);

        // Si la direccionArchivo era URL WebDAV directa, actualizar en DB también
        if (adj.direccionArchivo.includes(WEBDAV_URL)) {
          const newUrl = adj.direccionArchivo.replace(resolvedFilename, newFilename);
          await prisma.adjuntos.update({
            where: { id: adj.id },
            data: { direccionArchivo: newUrl },
          });
          console.log(`    ✓  URL en DB actualizada.`);
        }

        reparados++;
      } else {
        console.log(`    ✗  Falló el renombrado.`);
        fallidos++;
      }
    }

    console.log('');
  }

  // ── Resumen ────────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════');
  console.log(' RESUMEN');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Adjuntos en DB       : ${adjuntos.length}`);
  console.log(`  Candidatos a fix     : ${candidatos}`);
  console.log(`  Ya correctos         : ${yaCorrectos}`);
  if (IS_DRY_RUN) {
    console.log(`  Se renombrarían      : ${reparados}`);
    console.log(`  Sin path exacto      : ${candidatos - reparados - fallidos - yaCorrectos}`);
  } else {
    console.log(`  Reparados            : ${reparados}`);
    console.log(`  Fallidos             : ${fallidos}`);
  }
  console.log('');

  if (IS_DRY_RUN && candidatos > 0) {
    console.log('  → Ejecuta con --fix para aplicar los cambios.');
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error fatal:', err);
  prisma.$disconnect();
  process.exit(1);
});
