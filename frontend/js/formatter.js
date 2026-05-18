/**
 * formatter.js — Number and currency formatting utilities
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_DECIMAL = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount) {
  return INR.format(amount);
}

export function formatINRDecimal(amount) {
  return INR_DECIMAL.format(amount);
}

/**
 * Convert raw number to lakh/crore shorthand
 * e.g. 1200000 → "12.00 L"
 */
export function toShorthand(amount) {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000)   return `${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000)     return `${(amount / 1000).toFixed(1)} K`;
  return amount.toFixed(0);
}

/**
 * Parse CTC input — supports "12L", "12 lakh", "1200000"
 */
export function parseCTC(raw) {
  const str = raw.toString().trim().toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "");

  if (str.includes("cr")) return parseFloat(str) * 10000000;
  if (str.includes("l"))  return parseFloat(str) * 100000;
  if (str.includes("k"))  return parseFloat(str) * 1000;
  return parseFloat(str);
}
