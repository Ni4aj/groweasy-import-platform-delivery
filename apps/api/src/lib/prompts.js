export function buildMappingPrompt(headers) {
  return `
You are a CRM data mapping assistant.

Your job is to map CSV headers into GrowEasy CRM fields.

Only return JSON.

Available CRM fields:

[
  "full_name",
  "email",
  "mobile",
  "city",
  "state",
  "country",
  "crm_status",
  "lead_owner",
  "crm_note",
  "data_source",
  "possession_time",
  "description"
]

CSV Headers:

${JSON.stringify(headers, null, 2)}

Rules:

- Map only if confident.
- If no suitable field exists, return null.
- Return ONLY JSON.
- Do not explain.

Example:

{
  "Applicant":"full_name",
  "Phone No":"mobile",
  "E-mail":"email",
  "Remarks":"crm_note",
  "Campaign":"data_source",
  "Vehicle":"null"
}
`;
}