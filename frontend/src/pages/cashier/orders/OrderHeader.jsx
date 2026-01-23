import { ChevronLeft, ShoppingBag, Clock } from "lucide-react"; 

// OrderHeader component
const OrderHeader = ({
  tableId,        // Current table ID
  existingOrder,  // Existing open order (if any)
  cartItemCount,  // Total items in cart
  onBack,         // Back button handler
  onBilling,      // Billing button handler
  onOpenCart,     // Open mobile cart drawer
  children,       // Search & category section
  billingDisabled = false,
}) => {
  return (
    // Sticky header at top
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-3">

        {/* Top row */}
        <div className="flex items-center justify-between gap-3">

          {/* Left side: Back button + Table info */}
          <div className="flex items-center gap-3">

            {/* Back to tables button */}
            <button
              onClick={onBack} // Navigate back to tables
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              {/* Left arrow icon */}
              <ChevronLeft className="h-4 w-4" />

              {/* Hide text on small screens */}
              <span className="hidden sm:inline">Tables</span>
            </button>

            {/* Table label and number */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Table
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Table {tableId}
              </h1>
            </div>
          </div>

          {/* Right side: Order status, Billing, Cart */}
          <div className="flex items-center gap-2">

            {/* Show active order badge only if order exists (desktop only) */}
            {existingOrder && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <Clock className="h-4 w-4" />
                Active order
              </div>
            )}

            {/* Billing button (desktop only) */}
            <button
              onClick={onBilling} // Go to billing page
              disabled={billingDisabled}
              className={`hidden md:inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold ${
                billingDisabled
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Billing
            </button>

            {/* Mobile cart button */}
            <button
              onClick={onOpenCart} // Open mobile cart drawer
              className="relative inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 md:hidden"
              aria-label="Open cart"
            >
              {/* Cart icon */}
              <ShoppingBag className="h-4 w-4" />

              {/* Cart item count badge */}
              {cartItemCount > 0 && (
                <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and categories (passed from parent) */}
        {children}
      </div>
    </header>
  );
};

export default OrderHeader;
