import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { OdooClientService, OdooAttachment } from '../odoo/odoo-client.service';
import * as ExcelJS from 'exceljs';

// ─── Interfaces ────────────────────────────────────────────────────────────────

/**
 * Datos extraídos del Excel de Odoo.
 * TODO: Completar los campos cuando se defina el formato del Excel.
 */
interface ExcelCotizacionData {
  /** ID externo/único que viene en el Excel — se usa para evitar duplicados */
  externalId: string;

  // TODO: Agregar los demás campos que vengan en el formato del Excel
  // Ejemplos tentantivos (ajustar según el formato real):
  // nombreProducto: string;
  // cantidad: number;
  // proveedor: string;
  // fechaEntrega: Date;
  // ...
}

/**
 * Resultado del procesamiento de un adjunto
 */
interface ProcessResult {
  attachmentId: number;
  leadId: number;
  status: 'created' | 'duplicate' | 'invalid_format' | 'error';
  message: string;
}

// ─── Servicio ──────────────────────────────────────────────────────────────────

@Injectable()
export class OdooSyncService {
  private readonly logger = new Logger(OdooSyncService.name);

  /**
   * Fecha del último chequeo — se usa para no re-procesar adjuntos viejos.
   * Al reiniciar el servidor se vuelve a null y se procesa desde el inicio.
   * TODO: Persistir en base de datos si se quiere sobrevivir reinicios.
   */
  private lastCheckAt: Date | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly odoo: OdooClientService,
  ) {}

  // ─── Cron: cada 5 minutos ────────────────────────────────────────────────

  @Cron('*/5 * * * *')
  async syncOdooAttachments(): Promise<void> {
    this.logger.log('▶ [Odoo Sync] Iniciando revisión de adjuntos…');

    const checkFrom = this.lastCheckAt;
    this.lastCheckAt = new Date(); // marcar antes de la consulta para no perder eventos

    try {
      // 1. Obtener adjuntos Excel nuevos de oportunidades en Odoo
      const attachments = await this.odoo.getExcelAttachmentsFromLeads(checkFrom ?? undefined);

      if (attachments.length === 0) {
        this.logger.log('✅ [Odoo Sync] Sin adjuntos nuevos');
        return;
      }

      this.logger.log(`📎 [Odoo Sync] ${attachments.length} adjunto(s) encontrado(s)`);

      // 2. Procesar cada adjunto
      const results: ProcessResult[] = [];
      for (const attachment of attachments) {
        const result = await this.processAttachment(attachment);
        results.push(result);
      }

      // 3. Resumen
      const counts = results.reduce(
        (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
        {} as Record<string, number>,
      );
      this.logger.log(
        `✅ [Odoo Sync] Completado — ${JSON.stringify(counts)}`,
      );
    } catch (err) {
      // Si falla la conexión con Odoo, retroceder lastCheckAt para no perder el rango
      this.lastCheckAt = checkFrom;
      this.logger.error(`❌ [Odoo Sync] Error general: ${err.message}`, err.stack);
    }
  }

  // ─── Procesamiento individual ─────────────────────────────────────────────

  private async processAttachment(attachment: OdooAttachment): Promise<ProcessResult> {
    const base = { attachmentId: attachment.id, leadId: attachment.res_id };

    try {
      // ── Paso 1: Descargar el archivo ──────────────────────────────────────
      const { data: buffer } = await this.odoo.downloadAttachment(attachment.id);

      // ── Paso 2: Parsear el Excel ──────────────────────────────────────────
      const data = await this.parseExcel(buffer);

      if (!data) {
        this.logger.warn(
          `⚠️  Adjunto #${attachment.id} (lead #${attachment.res_id}): formato no reconocido`,
        );
        return { ...base, status: 'invalid_format', message: 'Formato de Excel no reconocido' };
      }

      // ── Paso 3: Verificar duplicado ───────────────────────────────────────
      const existe = await this.cotizacionExiste(data.externalId);
      if (existe) {
        this.logger.log(
          `⏭  Adjunto #${attachment.id}: cotización '${data.externalId}' ya existe, omitiendo`,
        );
        return { ...base, status: 'duplicate', message: `externalId=${data.externalId} ya registrado` };
      }

      // ── Paso 4: Crear cotización ──────────────────────────────────────────
      await this.crearCotizacion(data, attachment);

      this.logger.log(
        `✅ Adjunto #${attachment.id}: cotización '${data.externalId}' creada`,
      );
      return { ...base, status: 'created', message: `externalId=${data.externalId}` };

    } catch (err) {
      this.logger.error(
        `❌ Error procesando adjunto #${attachment.id}: ${err.message}`,
        err.stack,
      );
      return { ...base, status: 'error', message: err.message };
    }
  }

  // ─── Parseo del Excel ─────────────────────────────────────────────────────

  /**
   * Lee el buffer del Excel y extrae los datos necesarios.
   *
   * TODO: Implementar cuando se defina el formato exacto del Excel.
   *       Puntos a definir con el equipo:
   *
   *       1. ¿En qué hoja está la data? (nombre o índice)
   *       2. ¿En qué fila empieza la data? (¿hay cabeceras?)
   *       3. ¿Cuál columna contiene el ID único / external ID?
   *       4. ¿Qué otros campos se mapean y a qué columnas?
   *       5. ¿Hay alguna celda especial de "versión" para validar que es el formato correcto?
   *
   * @returns ExcelCotizacionData si el formato es válido, null si no es el esperado
   */
  private async parseExcel(buffer: Buffer): Promise<ExcelCotizacionData | null> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    // ── TODO: Reemplazar con la lógica real según el formato ─────────────────

    // Ejemplo de cómo acceder a la primera hoja:
    // const sheet = workbook.worksheets[0];
    // if (!sheet) return null;

    // Ejemplo de cómo leer una celda específica para validar el formato:
    // const formatMarker = sheet.getCell('A1').value;
    // if (formatMarker !== 'COTIZACION_COMPRAS_v1') return null;

    // Ejemplo de cómo leer filas:
    // const rows: ExcelCotizacionData[] = [];
    // sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    //   if (rowNumber === 1) return; // saltar cabecera
    //   const externalId = String(row.getCell(1).value ?? '').trim();
    //   if (!externalId) return;
    //   rows.push({ externalId, ...otrosCampos });
    // });

    // ── PLACEHOLDER — remover cuando se implemente ───────────────────────────
    this.logger.warn('[parseExcel] TODO: lógica pendiente — formato Excel no definido aún');
    return null;
  }

  // ─── Verificación de duplicados ───────────────────────────────────────────

  /**
   * Verifica si ya existe una cotización con el externalId dado.
   *
   * TODO: Ajustar el campo donde se guardará el externalId de Odoo.
   *       Opciones:
   *       a) Un campo nuevo en la tabla Quotation (ej. odooExternalId)
   *       b) Guardar en el nombre de la cotización con prefijo
   *       c) Una tabla aparte de registros sincronizados
   */
  private async cotizacionExiste(externalId: string): Promise<boolean> {
    // TODO: implementar consulta real. Ejemplo tentativo:
    // const existing = await this.prisma.quotation.findFirst({
    //   where: { odooExternalId: externalId },
    // });
    // return !!existing;

    this.logger.warn(`[cotizacionExiste] TODO: verificar externalId=${externalId}`);
    return false;
  }

  // ─── Creación de cotización ───────────────────────────────────────────────

  /**
   * Crea la cotización en la base de datos a partir de los datos del Excel.
   *
   * TODO: Implementar cuando se conozca:
   *       1. El mapeo completo de campos (Excel → Quotation)
   *       2. Valores por defecto (estado inicial, solicitante, etc.)
   *       3. Si se deben crear también QuotationDetails (productos)
   *       4. Si hay que notificar a alguien por email/socket al crear
   */
  private async crearCotizacion(
    data: ExcelCotizacionData,
    attachment: OdooAttachment,
  ): Promise<void> {
    // TODO: implementar. Ejemplo tentativo:
    // await this.prisma.quotation.create({
    //   data: {
    //     nombre:          data.nombreProducto,
    //     odooExternalId:  data.externalId,
    //     odooLeadId:      String(attachment.res_id),
    //     estado:          'PENDIENTE',
    //     fechaSolicitud:  new Date(),
    //     // ... resto de campos
    //   },
    // });

    this.logger.warn(
      `[crearCotizacion] TODO: crear cotización para externalId=${data.externalId}, lead=${attachment.res_id}`,
    );
  }
}
