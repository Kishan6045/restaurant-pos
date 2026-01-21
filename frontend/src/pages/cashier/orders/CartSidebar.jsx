import { Clock, Trash2, Minus, Plus, CheckCircle } from "lucide-react";

const CartSidebar = ({
  existingOrder,
  cart,
  cartItemCount,
  onRemoveItem,
  onChangeQty,
  subtotal,
  tax,
  discount,
  grandTotal,
  onSendToKitchen,
  sending,
  onBilling,
}) => {
  return (
    <aside className="hidden lg:col-span-4 lg:block">
      <div className="sticky top-24 space-y-4">
        {existingOrder && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Clock className="h-4 w-4" />
              Active Order
            </div>
            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
              {existingOrder.items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                    {item.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Current Order
            </h3>
            <span className="text-xs text-slate-500">{cartItemCount} items</span>
          </div>
          <div className="max-h-[40vh] overflow-y-auto p-4 pr-2">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-md border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹{item.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item._id)}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-md border border-slate-200 px-1">
                        <button
                          onClick={() => onChangeQty(item._id, -1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onChangeQty(item._id, 1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        ₹{(Number(item.price || 0) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-4">
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={onSendToKitchen}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  {sending ? "Sending..." : "Send to Kitchen"}
                </button>
                <button
                  onClick={onBilling}
                  className="w-full rounded-md border border-blue-600 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Billing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CartSidebar;
