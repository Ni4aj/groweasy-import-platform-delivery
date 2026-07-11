// apps/api/src/lib/validators.js

/**
 * Check whether an email is valid.
 */
export function isValidEmail(email) {

  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );

}

/**
 * Check whether a phone number is valid.
 */
export function isValidMobile(mobile) {

  if (!mobile) return false;

  const digits = String(mobile)
    .replace(/\D/g, "");

  return digits.length >= 10;
}

/**
 * A lead is valid if it has
 * either a valid email
 * OR
 * a valid mobile number.
 */
export function isValidLead(lead) {

  return (
    isValidEmail(lead.email) ||
    isValidMobile(lead.mobile)
  );

}