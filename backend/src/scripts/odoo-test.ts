/**
 * Script de prueba — Conexión Odoo
 * Corre con: npx ts-node src/scripts/odoo-test.ts
 *
 * Muestra:
 *   1. Login (uid)
 *   2. Oportunidades (crm.lead) con filtros opcionales
 *   3. Adjuntos Excel ligados a esas oportunidades
 */

import axios from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL  = 'https://energia-pd.grupoinnovahn.net';
const DB        = 'dbtest_f';
const LOGIN     = 'Analistadenegocios@energiapd.com';
const PASSWORD  = '12345';

/** Ajustar para filtrar oportunidades desde esta fecha (null = sin filtro) */
const DESDE_FECHA: string | null = null; // ej. '2025-01-01'

/** Cuántas oportunidades traer máximo (0 = sin límite) */
const LIMIT = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const http = axios.create({ baseURL: BASE_URL, timeout: 30_000 });
let sessionCookie = '';

async function authenticate(): Promise<number> {
  const res = await http.post('/web/session/authenticate', {
    jsonrpc: '2.0',
    method: 'call',
    params: { db: DB, login: LOGIN, password: PASSWORD },
  });

  const uid: number = res.data?.result?.uid;
  if (!uid) throw new Error(`Login fallido: ${JSON.stringify(res.data?.error ?? res.data)}`);

  const raw = res.headers['set-cookie'] as string | string[] | undefined;
  if (raw) {
    sessionCookie = Array.isArray(raw)
      ? raw.map((c: string) => c.split(';')[0]).join('; ')
      : raw.split(';')[0];
  }

  return uid;
}

function rpcHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(sessionCookie ? { Cookie: sessionCookie } : {}),
  };
}

async function rpcCall(model: string, method: string, args: any[], kwargs: any): Promise<any> {
  const res = await http.post(
    '/web/dataset/call_kw',
    { jsonrpc: '2.0', method: 'call', params: { model, method, args, kwargs } },
    { headers: rpcHeaders() },
  );
  if (res.data?.error) throw new Error(`RPC error (${model}.${method}): ${JSON.stringify(res.data.error)}`);
  return res.data?.result;
}

async function searchRead<T>(
  model: string,
  domain: any[],
  fields: string[],
  limit = 0,
): Promise<T[]> {
  const result = await rpcCall(model, 'search_read', [domain], { fields, limit });
  return result ?? [];
}

async function getFields(model: string): Promise<Record<string, { string: string; type: string }>> {
  const result = await rpcCall(model, 'fields_get', [], { attributes: ['string', 'type'] });
  return result ?? {};
}

function sep(title: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

// ─── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  // ── 1. Login ────────────────────────────────────────────────────────────────
  sep('1. AUTENTICACIÓN');
  const uid = await authenticate();
  console.log(`✅ Login exitoso — uid: ${uid}`);
  console.log(`   Cookie: ${sessionCookie.slice(0, 60)}…`);

  // ── 2. Todos los campos disponibles en crm.lead ──────────────────────────────
  sep('2. CAMPOS DISPONIBLES EN crm.lead');
  const allFieldsMap = await getFields('crm.lead');
  const allFields = Object.entries(allFieldsMap).map(([k, v]) => `${k} (${v.type})`);
  console.log(`Total de campos: ${allFields.length}`);
  console.log('Campos:\n  ' + allFields.join('\n  '));

  // ── 3. Oportunidades (crm.lead type=opportunity) ────────────────────────────
  sep('3. OPORTUNIDADES (crm.lead)');

  const domain: any[] = [
    ['type', '=', 'opportunity'],  // solo oportunidades, no leads crudos
  ];

  if (DESDE_FECHA) {
    domain.push(['create_date', '>=', DESDE_FECHA]);
    console.log(`Filtro fecha: desde ${DESDE_FECHA}`);
  }

  // Campos base — ampliar según lo que muestre el paso 2
  const leadFields = [
    'id', 'name', 'type', 'stage_id', 'partner_id',
    'user_id', 'create_date', 'write_date', 'probability',
    'planned_revenue', 'description',
  ];

  const leads = await searchRead<any>('crm.lead', domain, leadFields, LIMIT);
  console.log(`\nTotal oportunidades encontradas: ${leads.length} (limit=${LIMIT || 'sin límite'})`);

  leads.forEach((lead, i) => {
    console.log(`\n  [${i + 1}] id=${lead.id}`);
    console.log(`       nombre:      ${lead.name}`);
    console.log(`       etapa:       ${Array.isArray(lead.stage_id) ? lead.stage_id[1] : lead.stage_id}`);
    console.log(`       cliente:     ${Array.isArray(lead.partner_id) ? lead.partner_id[1] : lead.partner_id}`);
    console.log(`       responsable: ${Array.isArray(lead.user_id) ? lead.user_id[1] : lead.user_id}`);
    console.log(`       creado:      ${lead.create_date}`);
    console.log(`       modificado:  ${lead.write_date}`);
  });

  if (leads.length === 0) {
    console.log('  ⚠️  Sin oportunidades. Revisa el filtro de fechas o el dominio.');
    return;
  }

  // ── 4. Adjuntos de esas oportunidades ───────────────────────────────────────
  sep('4. ADJUNTOS (ir.attachment) DE LAS OPORTUNIDADES');

  const leadIds = leads.map((l) => l.id);

  const attachments = await searchRead<any>(
    'ir.attachment',
    [
      ['res_model', '=', 'crm.lead'],
      ['res_id', 'in', leadIds],
    ],
    ['id', 'name', 'mimetype', 'res_id', 'file_size', 'create_date', 'write_date'],
  );

  console.log(`\nTotal adjuntos encontrados: ${attachments.length}`);

  const excelMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream', // a veces Odoo reporta esto para xlsx
  ];

  attachments.forEach((att) => {
    const isExcel = excelMimes.includes(att.mimetype) || att.name?.match(/\.xlsx?$/i);
    const tag = isExcel ? '📊 EXCEL' : '📄 otro ';
    console.log(`\n  [${tag}] id=${att.id} — ${att.name}`);
    console.log(`          lead:      #${att.res_id}`);
    console.log(`          mimetype:  ${att.mimetype}`);
    console.log(`          tamaño:    ${att.file_size ? (att.file_size / 1024).toFixed(1) + ' KB' : '?'}`);
    console.log(`          creado:    ${att.create_date}`);
  });

  const excelCount = attachments.filter(
    (a) => excelMimes.includes(a.mimetype) || a.name?.match(/\.xlsx?$/i),
  ).length;
  console.log(`\n  → Adjuntos Excel detectados: ${excelCount} de ${attachments.length}`);

  // ── 5. Campos disponibles en ir.attachment ───────────────────────────────────
  sep('5. CAMPOS DISPONIBLES EN ir.attachment');
  const attFieldsMap = await getFields('ir.attachment');
  const attFieldsList = Object.entries(attFieldsMap).map(([k, v]) => `${k} (${v.type})`);
  console.log(`Total de campos: ${attFieldsList.length}`);
  console.log('Campos:\n  ' + attFieldsList.join('\n  '));

  sep('✅ PRUEBA COMPLETADA');
})().catch((err) => {
  console.error('\n❌ ERROR:', err.message);
  process.exit(1);
});
