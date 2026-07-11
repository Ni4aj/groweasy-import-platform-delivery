import { HEADER_ALIASES } from "./crmSchema.js";

/**
 * Convert header into a standard format.
 * Example:
 * "Full Name" -> "full name"
 * "PHONE_NUMBER" -> "phone number"
 */
export function normalizeHeader(header) {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Maps one CSV header to a CRM field.
 */
export function mapHeader(header) {

  const normalized = normalizeHeader(header);

  for (const [crmField, aliases] of Object.entries(HEADER_ALIASES)) {

    if (aliases.includes(normalized)) {
      return crmField;
    }

  }

  return null;
}

/**
 * Maps all CSV headers.
 */
export function mapHeaders(headers) {

  const mapping = {};

  for (const header of headers) {

    mapping[header] = mapHeader(header);

  }

  return mapping;
}