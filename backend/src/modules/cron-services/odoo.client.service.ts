import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Modelos de Odoo relevantes para la integración
 */
export const ODOO_MODELS = {
  LEAD: 'crm.lead',       // Oportunidades
  ATTACHMENT: 'ir.attachment', // Adjuntos
} as const;

/**
 * Tipos MIME aceptados como Excel
 */
const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
];

export interface OdooAttachment {
  id: number;
  name: string;
  mimetype: string;
  res_id: number;       // ID de la oportunidad (crm.lead)
  res_model: string;
  create_date: string;
  write_date: string;
}

export interface OdooLead {
  id: number;
  name: string;
  partner_id: [number, string] | false;
  stage_id: [number, string] | false;
  create_date: string;
}

@Injectable()
export class OdooClientService implements OnModuleInit {
  private readonly logger = new Logger(OdooClientService.name);

  private readonly baseUrl: string;
  private readonly db: string;
  private readonly login: string;
  private readonly password: string;

  private http: AxiosInstance;
  private sessionCookie: string | null = null;
  private uid: number | null = null;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.getOrThrow('ODOO_BASE_URL');
    this.db      = this.config.getOrThrow('ODOO_DB');
    this.login   = this.config.getOrThrow('ODOO_LOGIN');
    this.password = this.config.getOrThrow('ODOO_PASSWORD');

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30_000,
    });
  }

  async onModuleInit() {
    // Verificar conectividad al arrancar (no fatal si falla)
    try {
      await this.authenticate();
      this.logger.log(`✅ Odoo conectado (uid=${this.uid})`);
    } catch (err) {
      this.logger.warn(`⚠️  Odoo no disponible al iniciar: ${err.message}`);
    }
  }

  // ─── Autenticación ────────────────────────────────────────────────────────

  async authenticate(): Promise<void> {
    const res = await this.http.post(
      '/web/session/authenticate',
      {
        jsonrpc: '2.0',
        method: 'call',
        params: { db: this.db, login: this.login, password: this.password },
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const uid = res.data?.result?.uid;
    if (!uid) {
      throw new Error(
        `Autenticación Odoo fallida: ${JSON.stringify(res.data?.error ?? res.data)}`,
      );
    }

    this.uid = uid;

    // Guardar cookie de sesión para descargas binarias
    const setCookie: string | string[] | undefined = res.headers['set-cookie'];
    if (setCookie) {
      this.sessionCookie = Array.isArray(setCookie)
        ? setCookie.map((c: string) => c.split(';')[0]).join('; ')
        : (setCookie as string).split(';')[0];
    }
  }

  /** Re-autentica si la sesión expiró */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.uid) await this.authenticate();
  }

  // ─── JSON-RPC helpers ─────────────────────────────────────────────────────

  /**
   * Llama a model.search_read en Odoo.
   * @param model  Nombre del modelo (ej. 'ir.attachment')
   * @param domain Dominio de filtro en formato Odoo [[campo, op, valor], ...]
   * @param fields Campos a retornar
   * @param limit  Máx registros (0 = sin límite)
   */
  async searchRead<T = Record<string, any>>(
    model: string,
    domain: any[],
    fields: string[],
    limit = 0,
  ): Promise<T[]> {
    await this.ensureAuthenticated();

    const res = await this.http.post(
      '/web/dataset/call_kw',
      {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model,
          method: 'search_read',
          args: [domain],
          kwargs: { fields, limit },
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (res.data?.error) {
      throw new Error(`Odoo RPC error: ${JSON.stringify(res.data.error)}`);
    }

    return res.data?.result ?? [];
  }

  // ─── Descarga de adjuntos ─────────────────────────────────────────────────

  /**
   * Descarga el contenido binario de un adjunto por su ID.
   * Retorna un Buffer listo para parsear con ExcelJS.
   */
  async downloadAttachment(attachmentId: number): Promise<Buffer> {
    await this.ensureAuthenticated();

    const response = await this.http.get(
      `/web/content/${attachmentId}?download=true`,
      {
        responseType: 'arraybuffer',
        headers: {
          Cookie: this.sessionCookie ?? '',
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(
        `Error descargando adjunto ${attachmentId}: HTTP ${response.status}`,
      );
    }

    return Buffer.from(response.data);
  }

  // ─── Queries de alto nivel ────────────────────────────────────────────────

  /**
   * Devuelve todos los adjuntos Excel colgados de oportunidades (crm.lead),
   * opcionalmente filtrados por fecha de creación >= desde.
   */
  async getExcelAttachmentsFromLeads(
    desde?: Date,
  ): Promise<OdooAttachment[]> {
    const domain: any[] = [
      ['res_model', '=', ODOO_MODELS.LEAD],
      ['mimetype', 'in', EXCEL_MIME_TYPES],
    ];

    // Si no viene fecha explícita (primera ejecución tras reinicio),
    // limitar a los últimos 5 días para no traer todo el historial de Odoo.
    const fechaBase = desde ?? (() => {
      const d = new Date();
      d.setDate(d.getDate() - 5);
      return d;
    })();
    // Odoo acepta fechas en formato 'YYYY-MM-DD HH:mm:ss'
    domain.push(['create_date', '>=', fechaBase.toISOString().replace('T', ' ').slice(0, 19)]);

    return this.searchRead<OdooAttachment>(
      ODOO_MODELS.ATTACHMENT,
      domain,
      ['id', 'name', 'mimetype', 'res_id', 'res_model', 'create_date', 'write_date'],
    );
  }

  /**
   * Obtiene la oportunidad (crm.lead) por ID.
   */
  async getLeadById(leadId: number): Promise<OdooLead | null> {
    const results = await this.searchRead<OdooLead>(
      ODOO_MODELS.LEAD,
      [['id', '=', leadId]],
      ['id', 'name', 'partner_id', 'stage_id', 'create_date'],
      1,
    );
    return results[0] ?? null;
  }
}
