export const TARGET_FIELDS = [
  'created_at', 'name', 'email', 'country_code', 'mobile_without_country_code',
  'company', 'city', 'state', 'country', 'lead_owner', 'crm_status', 'crm_note',
  'data_source', 'possession_time', 'description'
];

const aliases = {
  created_at: ['created at', 'created_at', 'created', 'date created', 'timestamp'],
  name: ['name', 'full name', 'contact name', 'lead name', 'customer name'],
  email: ['email', 'email address', 'e-mail'],
  country_code: ['country code', 'country_code', 'dial code', 'isd code'],
  mobile_without_country_code: ['mobile', 'mobile number', 'phone', 'phone number', 'contact number', 'whatsapp'],
  company: ['company', 'company name', 'organization', 'organisation'],
  city: ['city', 'town'], state: ['state', 'province', 'region'], country: ['country'],
  lead_owner: ['lead owner', 'owner', 'assigned to', 'sales rep'],
  crm_status: ['crm status', 'status', 'lead status'],
  crm_note: ['remarks', 'remark', 'notes', 'note', 'follow up', 'comments'],
  data_source: ['data source', 'source', 'lead source'],
  possession_time: ['possession time', 'possession'], description: ['description', 'details', 'message']
};

export const cleanHeader = (value) => String(value || '').trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();

export function deterministicMapping(headers) {
  return Object.fromEntries(headers.map((header) => {
    const normalized = cleanHeader(header);
    const match = Object.entries(aliases).find(([, names]) => names.includes(normalized))?.[0]
      || (/email/.test(normalized) ? 'email' : /(mobile|phone|contact|whatsapp)/.test(normalized) ? 'mobile_without_country_code' : /name/.test(normalized) ? 'name' : null);
    return [header, match];
  }));
}

export async function mapHeaders(headers) {
  const fallback = deterministicMapping(headers);
  if (!process.env.OPENAI_API_KEY) return { provider: 'deterministic', mapping: fallback };
  try {
    const prompt = `Map these CSV headers to this exact CRM schema: ${TARGET_FIELDS.join(', ')}. Return JSON only, shaped as {"mapping":{"input header":"target_field or null"}}. Do not map a header unless the meaning is clear. Headers: ${JSON.stringify(headers)}`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', input: prompt, text: { format: { type: 'json_object' } } })
    });
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const body = await response.json(); const candidate = JSON.parse(body.output_text || '{}').mapping || {};
    const mapping = Object.fromEntries(headers.map((header) => [header, TARGET_FIELDS.includes(candidate[header]) ? candidate[header] : fallback[header]]));
    return { provider: 'openai', mapping };
  } catch (error) {
    console.warn(`AI mapping fallback: ${error.message}`);
    return { provider: 'deterministic-fallback', mapping: fallback };
  }
}

export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]; const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

const validStatuses = new Set(['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE']);
const validSources = new Set(['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots']);
const contactParts = (value, email) => String(value || '').split(/[\s,;|/]+/).map((item) => item.trim()).filter((item) => email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item) : /\d{6,}/.test(item.replace(/\D/g, '')));
const toDate = (value) => { const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return null; const pad = (n) => String(n).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`; };

export function normalizeRows(headers, rows, mapping) {
  let skipped = 0; const seen = new Set(); let duplicates = 0;
  const leads = rows.flatMap((row) => {
    const value = (field) => { const index = headers.findIndex((header) => mapping[header] === field); return index >= 0 ? String(row[index] || '').trim() : ''; };
    const emails = headers.flatMap((header, index) => mapping[header] === 'email' ? contactParts(row[index], true) : []);
    const mobiles = headers.flatMap((header, index) => mapping[header] === 'mobile_without_country_code' ? contactParts(row[index], false) : []);
    if (!emails.length && !mobiles.length) { skipped += 1; return []; }
    const primaryMobile = String(mobiles[0] || '').replace(/\D/g, ''); const identity = (emails[0] || primaryMobile).toLowerCase();
    if (seen.has(identity)) duplicates += 1; seen.add(identity);
    const status = value('crm_status').toUpperCase().replace(/[\s-]+/g, '_'); const source = value('data_source').toLowerCase().replace(/[\s-]+/g, '_');
    const extras = headers.filter((header, index) => !mapping[header] && String(row[index] || '').trim()).map((header, index) => `${header}: ${row[index]}`);
    return [{
      created_at: toDate(value('created_at')), name: value('name') || null, email: emails[0] || null,
      country_code: value('country_code') || null, mobile_without_country_code: primaryMobile || null,
      company: value('company') || null, city: value('city') || null, state: value('state') || null, country: value('country') || null,
      lead_owner: value('lead_owner') || null, crm_status: validStatuses.has(status) ? status : null,
      crm_note: [value('crm_note'), ...emails.slice(1).map((item) => `Additional email: ${item}`), ...mobiles.slice(1).map((item) => `Additional mobile: ${item}`), ...extras].filter(Boolean).join(' | ') || null,
      data_source: validSources.has(source) ? source : '', possession_time: value('possession_time') || null, description: value('description') || null
    }];
  });
  return { leads, skipped, duplicates };
}
