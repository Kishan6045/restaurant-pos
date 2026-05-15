/** Line-item statuses that mean kitchen has finished the dish (cashier may collect payment). */
const KITCHEN_DONE = new Set(["ready", "served"]);

export function isLineKitchenDone(item) {
  return KITCHEN_DONE.has(item?.status);
}

export function allLineItemsKitchenReady(order) {
  const items = order?.items;
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every(isLineKitchenDone);
}

export function kitchenLineStats(order) {
  const items = order?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { total: 0, done: 0, pending: 0 };
  }
  let done = 0;
  for (const it of items) {
    if (isLineKitchenDone(it)) done += 1;
  }
  return { total: items.length, done, pending: items.length - done };
}

export function kitchenStatusLabel(status) {
  const s = String(status || "pending").toLowerCase();
  const map = {
    pending: "Queued",
    preparing: "Cooking",
    ready: "Ready",
    served: "Served",
  };
  return map[s] || s;
}
