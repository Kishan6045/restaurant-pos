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

export function orderTableNumber(order) {
  const t = order?.tableId ?? order?.table;
  if (t && typeof t === "object" && t.tableNumber != null) return Number(t.tableNumber);
  if (order?.tableNumber != null) return Number(order.tableNumber);
  return null;
}

/** Per-table running order number for kitchen (e.g. Order 2 on Table 1). */
export function tableOrderSequence(order) {
  const n = order?.tableOrderNumber;
  if (n != null && Number.isFinite(Number(n)) && Number(n) >= 1) {
    return Number(n);
  }
  return null;
}

/** Compact label: "Order 2" (per-table sequence). */
export function tableOrderLabel(order) {
  const n = tableOrderSequence(order);
  if (n != null) return `Order ${n}`;
  const daily = orderTicketLabel(order);
  if (daily !== "—") return `Ticket #${daily}`;
  return "—";
}

/** Kitchen header: "Table 1 - Order 2" */
export function kitchenOrderLabel(order) {
  const tableNum = orderTableNumber(order);
  const orderNum = tableOrderSequence(order);
  if (tableNum != null && orderNum != null) {
    return `Table ${tableNum} - Order ${orderNum}`;
  }
  if (orderNum != null) return `Order ${orderNum}`;
  return orderTicketLabel(order);
}

/** Daily ticket # (IST day) — fallback when table sequence is unavailable. */
export function orderTicketLabel(order) {
  const n = order?.displayOrderNumber;
  if (n != null && Number.isFinite(Number(n)) && Number(n) >= 1) {
    return String(Number(n));
  }
  return "—";
}
