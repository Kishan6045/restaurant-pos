import { ChevronLeft, ChefHat } from "lucide-react";
import { orderTicketLabel } from "../../../helpers/ordersResponse";

const OrderHeader = ({
  tableMeta = {},
  existingOrder,
  kitchenReady = false,
  kitchenStats = { total: 0, done: 0, pending: 0 },
  cartItemCount,
  onBack,
  onBilling,
  onSendToKitchen,
  sending,
  children,
  billingDisabled = false,
}) => {
  const canSendToKitchen = cartItemCount > 0 && !sending;
  const label =
    tableMeta.tableNumber != null
      ? `T-${tableMeta.tableNumber}`
      : "Table";
  const floor = tableMeta.floor ? String(tableMeta.floor) : null;

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-transparent px-2 pb-1.5 pt-2 sm:px-3 sm:pb-2 sm:pt-2.5 md:px-4 md:pb-2 md:pt-3">
      <div className="w-full rounded-2xl border border-indigo-100/85 bg-gradient-to-br from-white via-white to-indigo-50/40 shadow-[0_8px_32px_rgba(67,56,202,0.09)] ring-1 ring-indigo-950/[0.05] backdrop-blur-md sm:rounded-3xl">
        <div className="space-y-2 px-2.5 py-2.5 sm:space-y-2.5 sm:px-3 sm:py-3 md:px-4 md:py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-2.5">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 shrink-0 items-center gap-0.5 rounded-full border border-indigo-100/90 bg-white px-3 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow md:h-10 md:px-4 md:text-xs"
              aria-label="Back to tables"
            >
              <ChevronLeft className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:inline pr-0.5">Back</span>
            </button>
            <div className="min-w-0 max-w-[min(100%,14rem)] rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-3 py-1.5 shadow-sm sm:max-w-[16rem] md:px-3.5 md:py-2">
              <span className="block text-[9px] font-semibold uppercase tracking-wide text-indigo-600/90 md:text-[10px]">{label}</span>
              <span className="block truncate text-xs font-semibold leading-tight text-slate-900 md:text-sm">{floor || "—"}</span>
            </div>
            {existingOrder ? (
              <div className="shrink-0 rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50 to-white px-3 py-1.5 shadow-sm ring-1 ring-indigo-900/[0.06] md:px-3.5 md:py-2">
                <span className="block text-[8px] font-semibold uppercase tracking-wide text-indigo-700">Order</span>
                <span className="block text-center text-sm font-black tabular-nums leading-none text-indigo-950 md:text-base">
                  {orderTicketLabel(existingOrder)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {existingOrder && kitchenStats.total > 0 && (
              <span
                className={`inline-flex h-9 items-center rounded-full border px-3 text-[10px] font-semibold shadow-sm md:h-10 md:px-3.5 md:text-[11px] ${
                  kitchenReady ? "border-emerald-200/90 bg-emerald-50 text-emerald-800" : "border-sky-200/90 bg-sky-50 text-sky-900"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <ChefHat className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                  {kitchenReady ? "Ready" : `${kitchenStats.done}/${kitchenStats.total}`}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={onSendToKitchen}
              disabled={!canSendToKitchen}
              className={`h-9 shrink-0 rounded-full px-4 text-[11px] font-semibold shadow-sm transition md:h-10 md:px-5 md:text-xs ${
                canSendToKitchen
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700"
                  : "cursor-not-allowed border border-slate-200/90 bg-slate-100 text-slate-400 shadow-none"
              }`}
            >
              Send
            </button>
            <button
              type="button"
              onClick={onBilling}
              disabled={billingDisabled}
              className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-semibold shadow-sm transition md:h-10 md:px-5 md:text-xs ${
                billingDisabled
                  ? "cursor-not-allowed border-slate-200/90 bg-slate-100 text-slate-400"
                  : "border-indigo-100/90 bg-white text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md"
              }`}
            >
              Bill
            </button>
          </div>
        </div>

        {children}
        </div>
      </div>
    </header>
  );
};

export default OrderHeader;
