import { ChevronLeft, ShoppingBag, Clock } from "lucide-react";

const OrderHeader = ({
  tableId,
  existingOrder,
  cartItemCount,
  onBack,
  onBilling,
  onOpenCart,
  children,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Tables</span>
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Table
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Table {tableId}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {existingOrder && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <Clock className="h-4 w-4" />
                Active order
              </div>
            )}
            <button
              onClick={onBilling}
              className="hidden md:inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Billing
            </button>
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 md:hidden"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartItemCount > 0 && (
                <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {children}
      </div>
    </header>
  );
};

export default OrderHeader;
