import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export const ODOO_MODELS = {
  LEAD:       'crm.lead',
  ATTACHMENT: 'ir.attachment',
  MESSAGE:    'mail.message',
} as const;

export const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export interface OdooAttachment {
  id: number;
  name: string;
  mimetype: string;
  file_size: number;
  res_id: number;
  res_model: string;
  create_date: string;
  write_date: string;
}

export interface OdooLead {
  id: number;
  name: string;
  type: string;
  partner_id: [number, string] | false;
  stage_id: [number, string] | false;
  user_id: [number, string] | false;
  responsable_id: [number, string] | false;
  create_date: string;
  write_date: string;
  date_deadline: string | false;
  planned_revenue: number;
  probability: number;
  description: string | false;
  email_from: string | false;
  phone: string | false;
}

export interface OdooMessage {
  id: number;
  body: string;
  author_id: [number, string] | false;
  date: string;
  message_type: string;
  subtype_id: [number, string] | false;
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
    this.baseUrl  = this.config.getOrThrow('ODOO_BASE_URL');
    this.db       = this.config.getOrThrow('ODOO_DB');
    this.login    = this.config.getOrThrow('ODOO_LOGIN');
    this.password = this.config.getOrThrow('ODOO_PASSWORD');

    this.http = axios.create({ baseURL: this.baseUrl, timeout: 30_000 });
  }

  async onModuleInit() {
    try {
      await this.authenticate();
      this.logger.log(`✅ Odoo conectado (uid=${this.uid})`);
    } catch (err) {
      this.logger.warn(`⚠️  Odoo no disponible al iniciar: ${err.message}`);
    }
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async authenticate(): Promise<void> {
    const res = await this.http.post(
      '/web/session/authenticate',
      { jsonrpc: '2.0', method: 'call', params: { db: this.db, login: this.login, password: this.password } },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const uid = res.data?.result?.uid;
    if (!uid) throw new Error(`Auth Odoo fallida: ${JSON.stringify(res.data?.error ?? {})}`);
    this.uid = uid;

    const raw = res.headers['set-cookie'] as string | string[] | undefined;
    if (raw) {
      this.sessionCookie = Array.isArray(raw)
        ? raw.map((c: string) => c.split(';')[0]).join('; ')
        : raw.split(';')[0];
    }
  }

  private async ensureAuth(): Promise<void> {
    if (!this.uid) await this.authenticate();
  }

  // ─── RPC ──────────────────────────────────────────────────────────────────

  async searchRead<T = Record<string, any>>(
    model: string,
    domain: any[],
    fields: string[],
    limit = 0,
    offset = 0,
    order = '',
  ): Promise<T[]> {
    await this.ensureAuth();

    const res = await this.http.post(
      '/web/dataset/call_kw',
      {
        jsonrpc: '2.0', method: 'call',
        params: {
          model, method: 'search_read',
          args: [domain],
          kwargs: { fields, limit, offset, ...(order ? { order } : {}) },
        },
      },
      { headers: { 'Content-Type': 'application/json', Cookie: this.sessionCookie ?? '' } },
    );

    if (res.data?.error) throw new Error(`Odoo RPC error: ${JSON.stringify(res.data.error)}`);
    return res.data?.result ?? [];
  }

  async searchCount(model: string, domain: any[]): Promise<number> {
    await this.ensureAuth();
    const res = await this.http.post(
      '/web/dataset/call_kw',
      {
        jsonrpc: '2.0', method: 'call',
        params: { model, method: 'search_count', args: [domain], kwargs: {} },
      },
      { headers: { 'Content-Type': 'application/json', Cookie: this.sessionCookie ?? '' } },
    );
    if (res.data?.error) throw new Error(`Odoo RPC error: ${JSON.stringify(res.data.error)}`);
    return res.data?.result ?? 0;
  }

  // ─── Download ─────────────────────────────────────────────────────────────

  async downloadAttachment(attachmentId: number): Promise<{ data: Buffer; filename: string; mimetype: string }> {
    await this.ensureAuth();

    // Primero traer metadata del adjunto
    const [meta] = await this.searchRead<OdooAttachment>(
      ODOO_MODELS.ATTACHMENT,
      [['id', '=', attachmentId]],
      ['name', 'mimetype'],
      1,
    );

    const response = await this.http.get(
      `/web/content/${attachmentId}?download=true`,
      { responseType: 'arraybuffer', headers: { Cookie: this.sessionCookie ?? '' } },
    );

    return {
      data: Buffer.from(response.data),
      filename: meta?.name ?? `adjunto_${attachmentId}`,
      mimetype: meta?.mimetype ?? 'application/octet-stream',
    };
  }

  // ─── High-level queries ───────────────────────────────────────────────────

  async getLeads(opts: {
    limit?: number;
    offset?: number;
    desde?: string;
    hasta?: string;
    search?: string;
  } = {}): Promise<{ leads: OdooLead[]; total: number }> {
    const domain: any[] = [['type', '=', 'opportunity']];

    if (opts.desde) domain.push(['create_date', '>=', `${opts.desde} 00:00:00`]);
    if (opts.hasta) domain.push(['create_date', '<=', `${opts.hasta} 23:59:59`]);
    if (opts.search) domain.push(['name', 'ilike', opts.search]);

    const [leads, total] = await Promise.all([
      this.searchRead<OdooLead>(
        ODOO_MODELS.LEAD,
        domain,
        ['id', 'name', 'type', 'partner_id', 'stage_id', 'user_id', 'responsable_id',
         'create_date', 'write_date', 'date_deadline', 'planned_revenue',
         'probability', 'description', 'email_from', 'phone'],
        opts.limit ?? 20,
        opts.offset ?? 0,
        'create_date desc',
      ),
      this.searchCount(ODOO_MODELS.LEAD, domain),
    ]);

    return { leads, total };
  }

  async getAttachmentsForLeads(leadIds: number[]): Promise<OdooAttachment[]> {
    if (leadIds.length === 0) return [];
    return this.searchRead<OdooAttachment>(
      ODOO_MODELS.ATTACHMENT,
      [['res_model', '=', ODOO_MODELS.LEAD], ['res_id', 'in', leadIds]],
      ['id', 'name', 'mimetype', 'file_size', 'res_id', 'res_model', 'create_date'],
      0, 0, 'create_date desc',
    );
  }

  async getMessagesForLead(leadId: number): Promise<OdooMessage[]> {
    return this.searchRead<OdooMessage>(
      ODOO_MODELS.MESSAGE,
      [
        ['res_model', '=', ODOO_MODELS.LEAD],
        ['res_id', '=', leadId],
        ['message_type', 'in', ['comment', 'email']],
      ],
      ['id', 'body', 'author_id', 'date', 'message_type', 'subtype_id'],
      50, 0, 'date desc',
    );
  }

  async getExcelAttachmentsFromLeads(desde?: Date): Promise<OdooAttachment[]> {
    const domain: any[] = [
      ['res_model', '=', ODOO_MODELS.LEAD],
      ['mimetype', 'in', EXCEL_MIME_TYPES],
    ];
    if (desde) domain.push(['create_date', '>=', desde.toISOString().replace('T', ' ').slice(0, 19)]);
    return this.searchRead<OdooAttachment>(
      ODOO_MODELS.ATTACHMENT, domain,
      ['id', 'name', 'mimetype', 'res_id', 'res_model', 'create_date', 'write_date'],
    );
  }
}
