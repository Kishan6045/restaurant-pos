export const TAX_RATE = 0.05;

export function computeBillTotals(items = []) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}
