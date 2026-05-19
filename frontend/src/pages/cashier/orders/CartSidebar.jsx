import { Trash2, Minus, Plus, CheckCircle, Receipt, ChefHat } from "lucide-react";
import { docId } from "../../../helpers/docId";
import { kitchenOrderLabel } from "../../../helpers/ordersResponse";
import { kitchenStatusLabel } from "../../../helpers/orderKitchen";
import { POS, posLineImageSrc } from "../../../components/cashier/posListTheme";

const statusChip = (status) => {
  const s = String(status || "pending").toLowerCase();
  if (s === "ready" || s === "served") return "bg-emerald-100 text-emerald-800";
  if (s === "preparing") return "bg-sky-100 text-sky-900";
  return "bg-indigo-100/80 text-indigo-800";
};

const CartSidebar = ({
  existingOrder,
  kitchenReady = false,
  kitchenStats = { total: 0, done: 0, pending: 0 },
  cart,
  cartItemCount,
  onRemoveItem,
  onChangeQty,
  subtotal,
  tax,
  grandTotal,
  onSendToKitchen,
  sending,
  onBilling,
  billingDisabled = false,
}) => {
  return (
    <aside className="hidden min-w-0 md:col-span-4 md:block">
      <div className="sticky top-36 flex max-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden rounded-2xl border border-indigo-100/85 bg-white/95 shadow-[0_8px_28px_rgba(67,56,202,0.1)] ring-1 ring-indigo-950/[0.05] md:top-44 md:max-h-[calc(100dvh-9rem)] lg:top-44 lg:max-h-[calc(100dvh-8rem)]">
        {existingOrder?.items?.length > 0 && (
          <div className="shrink-0 space-y-1.5 border-b border-indigo-100/70 bg-indigo-50/35 p-2.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1">
                <ChefHat className="h-3 w-3" />
                Kitchen · {kitchenOrderLabel(existingOrder)}
              </span>
              <span className={kitchenReady ? "text-emerald-700" : "text-sky-800"}>
                {kitchenStats.done}/{kitchenStats.total}
              </span>
            </div>
            <div className={`${POS.list} max-h-28 overflow-y-auto rounded-xl border border-indigo-100/70 bg-white/90 p-1`}>
              {existingOrder.items.map((item, i) => (
                <div key={item.id ?? item._id ?? i} className={POS.rowStatic}>
                  <img
                    src={posLineImageSrc(item)}
                    alt=""
                    className={POS.thumb}
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={POS.title}>{item?.name}</p>
                    <p className={POS.sub}>×{item?.quantity}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-semibold ${statusChip(item?.status)}`}>
                    {kitchenStatusLabel(item?.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-indigo-100/60 bg-white px-2.5 py-2">
            <span className="text-[11px] font-semibold text-slate-900">Cart</span>
            <span className="text-[10px] font-medium text-indigo-600/90">{cartItemCount}</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {cart.length === 0 ? (
              <p className="py-6 text-center text-[11px] text-slate-400">Empty</p>
            ) : (
              <div className={POS.list}>
                {cart.map((item, i) => {
                  const key = docId(item) || String(i);
                  const price = Number(item?.price ?? 0);
                  const qty = item?.qty ?? 1;
                  const src = posLineImageSrc(item);
                  return (
                    <div key={key} className={POS.rowStatic}>
                      <img
                        src={src}
                        alt=""
                        className={POS.thumb}
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={POS.title}>{item?.name}</p>
                        <p className={POS.sub}>
                          ₹{price.toFixed(0)} × {qty}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <div className="flex items-center overflow-hidden rounded-xl border border-indigo-100/90 bg-indigo-50/40 shadow-sm">
                          <button type="button" onClick={() => onChangeQty(key, -1)} className="px-2 py-1.5 transition hover:bg-white">
                            <Minus className="h-3.5 w-3.5 text-slate-600" />
                          </button>
                          <span className="min-w-[1.25rem] px-0.5 text-center text-[10px] font-semibold tabular-nums">{qty}</span>
                          <button type="button" onClick={() => onChangeQty(key, 1)} className="px-2 py-1.5 transition hover:bg-white">
                            <Plus className="h-3.5 w-3.5 text-slate-600" />
                          </button>
                        </div>
                        <span className={POS.priceSm}>₹{(price * qty).toFixed(0)}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(key)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 rounded-t-none border-t border-indigo-100/70 bg-gradient-to-b from-indigo-50/50 to-white p-2.5">
            <div className="space-y-1 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>Sub</span>
                <span>₹{Number(subtotal || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{Number(tax || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-indigo-100/50 pt-0.5 text-[11px] font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{Number(grandTotal || 0).toFixed(0)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onBilling}
                disabled={billingDisabled}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold shadow-sm transition ${
                  billingDisabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : "border border-indigo-100/90 bg-white text-slate-800 hover:bg-indigo-50/50 hover:shadow-md"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                Bill
              </button>
              <button
                type="button"
                onClick={onSendToKitchen}
                disabled={sending || cart.length === 0}
                className="flex items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2 text-[11px] font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-40"
              >
                {sending ? "…" : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CartSidebar;
