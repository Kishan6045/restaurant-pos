/** GET /api/orders & /api/kitchen/orders return a JSON array from Express. */
export function ordersListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.orders)) return data.orders;
  return [];
}

/** Normalize populated or raw tableId for URL param comparison. */
export function orderTableId(order) {
  const t = order?.tableId ?? order?.table;
  if (t && typeof t === "object" && t._id != null) return String(t._id);
  return String(t ?? "");
}

/** Kitchen / receipt: daily sequence 1, 2… (IST day). No hex fallback. */
export function orderTicketLabel(order) {
  const n = order?.displayOrderNumber;
  if (n != null && Number.isFinite(Number(n)) && Number(n) >= 1) {
    return String(Number(n));
  }
  return "—";
}
