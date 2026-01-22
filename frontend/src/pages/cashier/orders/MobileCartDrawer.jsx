// Icons import
import { X, Trash2, Minus, Plus } from "lucide-react";

// Mobile cart drawer component (shown only on mobile)
const MobileCartDrawer = ({
  onClose,          // Close drawer handler
  cart,             // Cart items list
  onRemoveItem,     // Remove item from cart
  onChangeQty,      // Increase / decrease quantity
  subtotal,         // Subtotal amount
  tax,              // Tax amount
  // discount,         // Discount amount
  grandTotal,       // Final total amount
  onSendToKitchen,  // Confirm order handler
  sending,          // Loading state while sending order
}) => {
  return (
    // Full screen overlay
    <div className="fixed inset-0 z-50 lg:hidden">

      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose} // Close drawer when clicking outside
      />

      {/* Bottom drawer container */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-white shadow-lg">

        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-base font-semibold text-slate-900">
            Current Order
          </h3>

          {/* Close button */}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart items section */}
        <div className="max-h-[50vh] overflow-y-auto p-4">

          {/* Empty cart state */}
          {cart.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Your cart is empty.
            </div>
          ) : (
            <div className="space-y-3">

              {/* Cart items list */}
              {cart.map((item) => (
                <div
                  key={item._id} // Unique key
                  className="rounded-md border border-slate-200 p-3"
                >
                  {/* Item details and remove button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        ₹{item.price} each
                      </p>
                    </div>

                    {/* Remove item */}
                    <button
                      onClick={() => onRemoveItem(item._id)}
                      className="text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity controls and item total */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border border-slate-200 px-1">

                      {/* Decrease quantity */}
                      <button
                        onClick={() => onChangeQty(item._id, -1)}
                        className="p-1 text-slate-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      {/* Quantity value */}
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.qty}
                      </span>

                      {/* Increase quantity */}
                      <button
                        onClick={() => onChangeQty(item._id, 1)}
                        className="p-1 text-slate-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Item total price */}
                    <span className="text-xs font-semibold text-slate-700">
                      ₹{(Number(item.price || 0) * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order summary and confirm button */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-4">

            {/* Price breakdown */}
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {/* <div className="flex justify-between">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div> */}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm order button */}
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
