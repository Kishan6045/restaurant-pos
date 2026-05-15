/**
 * Restaurant "business day" for order # sequence — **Asia/Kolkata** (IST).
 * Midnight IST par naya din → counter phir se 1 se.
 * @param {Date} [d]
 * @returns {string} `YYYY-MM-DD`
 */
function businessDayKey(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !day) return new Date().toISOString().slice(0, 10);
  return `${y}-${m}-${day}`;
}

module.exports = { businessDayKey };
