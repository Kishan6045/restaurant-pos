import { Clock, Trash2, Minus, Plus, CheckCircle } from "lucide-react";

// Desktop cart sidebar component
const CartSidebar = ({
  existingOrder,     // Existing open order for this table
  cart,              // Current cart items
  cartItemCount,     // Total number of items in cart
  onRemoveItem,      // Remove item from cart handler
  onChangeQty,       // Increase / decrease quantity handler
  subtotal,          // Cart subtotal amount
  tax,               // Tax amount
  // discount,          // Discount amount
  grandTotal,        // Final payable amount
  onSendToKitchen,   // Send order to kitchen handler
  sending,           // Loading state while sending order
  onBilling,         // Go to billing handler
  billingDisabled = false,
}) => {
  return (
    // Sidebar visible only on large screens
    <aside className="hidden lg:col-span-4 lg:block">

      {/* Sticky container */}
      <div className="sticky top-24 space-y-4">

        {/* Existing active order section */}
        {existingOrder && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">

            {/* Active order header */}
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Clock className="h-4 w-4" />
              Active Order
            </div>

            {/* Existing order items list */}
             <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
              {existingOrder.items.map((item, index) => (
                <div
                  key={item._id || index} // Fallback key if _id not present
                  className="flex items-center justify-between text-sm"
                >
                  {/* Item name and quantity */}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Item status */}
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                    {item.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current cart section */}
        <div className="rounded-lg border border-slate-200 bg-white">

          {/* Cart header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Current Order
            </h3>
            <span className="text-xs text-slate-500">
              {cartItemCount} items
            </span>
          </div>

          {/* Cart items list */}
          <div className="max-h-[40vh] overflow-y-auto p-4 pr-2">

            {/* Empty cart state */}
            {cart.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-3">

                {/* Cart items */}
                {cart.map((item) => (
                  <div
                    key={item._id} // Unique key
                    className="rounded-md border border-slate-200 p-3"
                  >
                    {/* Item name and remove button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹{item.price} each
                        </p>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => onRemoveItem(item._id)}
                        className="text-rose-500 hover:text-rose-600"
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
                          className="p-1 text-slate-600 hover:text-slate-900"
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
                          className="p-1 text-slate-600 hover:text-slate-900"
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

          {/* Cart summary and actions */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-4">

              {/* Price summary */}
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
               
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 space-y-2">

                {/* Send to kitchen button */}
                <button
                  onClick={onSendToKitchen}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  {sending ? "Sending..." : "Send to Kitchen"}
                </button>

                {/* Billing button */}
                <button
                  onClick={onBilling}
                  disabled={billingDisabled}
                  className={`w-full rounded-md border px-3 py-2.5 text-sm font-semibold ${
                    billingDisabled
                      ? "cursor-not-allowed border-slate-200 text-slate-400"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                  }`}
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
