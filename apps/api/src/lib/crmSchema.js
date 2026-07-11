// GrowEasy CRM Fields

export const CRM_FIELDS = [
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
];

// Different CSV header names that should map
// to the same CRM field.

export const HEADER_ALIASES = {

  full_name: [
    "name",
    "full name",
    "customer name",
    "client name",
    "lead name",
    "person name",
    "contact name"
  ],

  email: [
    "email",
    "email address",
    "mail",
    "email id",
    "e-mail"
  ],

  mobile: [
    "mobile",
    "mobile number",
    "phone",
    "phone number",
    "contact",
    "contact number",
    "telephone",
    "whatsapp",
    "whatsapp number"
  ],

  city: [
    "city",
    "town"
  ],

  state: [
    "state",
    "province",
    "region"
  ],

  country: [
    "country",
    "nation"
  ],

  crm_status: [
    "status",
    "lead status",
    "crm status"
  ],

  lead_owner: [
    "owner",
    "lead owner",
    "assigned to",
    "sales rep"
  ],

  crm_note: [
    "note",
    "notes",
    "remark",
    "remarks",
    "comment",
    "comments"
  ],

  data_source: [
    "source",
    "lead source",
    "data source",
    "campaign"
  ],

  possession_time: [
    "possession",
    "possession time"
  ],

  description: [
    "description",
    "details",
    "message",
    "requirement"
  ]
};