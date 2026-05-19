const TAX_RATE = 0.05;

function lineSubtotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

/** Subtotal, tax (5%), and grand total from order line items. */
function computeOrderTotals(items = []) {
  const subtotal = items.reduce((sum, item) => sum + lineSubtotal(item), 0);
  const tax = subtotal * TAX_RATE;
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

module.exports = { TAX_RATE, computeOrderTotals };
