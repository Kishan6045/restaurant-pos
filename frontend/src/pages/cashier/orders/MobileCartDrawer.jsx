import { X, Trash2, Minus, Plus } from "lucide-react";

const MobileCartDrawer = ({
  onClose,
  cart,
  onRemoveItem,
  onChangeQty,
  subtotal,
  tax,
  discount,
  grandTotal,
  onSendToKitchen,
  sending,
}) => {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-base font-semibold text-slate-900">
            Current Order
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4">
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
                      className="text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border border-slate-200 px-1">
                      <button
                        onClick={() => onChangeQty(item._id, -1)}
                        className="p-1 text-slate-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onChangeQty(item._id, 1)}
                        className="p-1 text-slate-600"
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
            <button
              onClick={onSendToKitchen}
              disabled={sending}
              className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Confirm Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCartDrawer;
