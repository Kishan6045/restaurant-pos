import { X, Trash2, Minus, Plus, CheckCircle } from "lucide-react";
import { docId } from "../../../helpers/docId";
import { POS, posLineImageSrc } from "../../../components/cashier/posListTheme";

const MobileCartDrawer = ({
  onClose,
  cart,
  onRemoveItem,
  onChangeQty,
  subtotal,
  tax,
  grandTotal,
  onSendToKitchen,
  sending,
}) => {
  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Cart">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-3xl border border-indigo-100/90 bg-gradient-to-b from-white to-indigo-50/40 shadow-2xl shadow-indigo-950/20 ring-1 ring-indigo-950/[0.06]">
        <div className="flex items-center justify-between border-b border-indigo-100/70 px-3 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Cart</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-1.5 text-slate-500 transition hover:bg-indigo-50" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">Empty</p>
          ) : (
            <div className={POS.list}>
              {cart.map((item) => {
                const id = docId(item);
                const price = Number(item?.price ?? 0);
                const qty = item?.qty ?? 1;
                const src = posLineImageSrc(item);
                return (
                  <div key={id} className={POS.rowStatic}>
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
                        ₹{price.toFixed(0)} each
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={POS.priceSm}>₹{(price * qty).toFixed(0)}</span>
                      <div className="flex items-center gap-0.5">
                        <div className="flex items-center overflow-hidden rounded-xl border border-indigo-100/90 bg-indigo-50/40 shadow-sm">
                          <button type="button" onClick={() => onChangeQty(id, -1)} className="px-2 py-1.5 hover:bg-white">
                            <Minus className="h-3.5 w-3.5 text-slate-600" />
                          </button>
                          <span className="w-5 text-center text-[10px] font-semibold tabular-nums">{qty}</span>
                          <button type="button" onClick={() => onChangeQty(id, 1)} className="px-2 py-1.5 hover:bg-white">
                            <Plus className="h-3.5 w-3.5 text-slate-600" />
                          </button>
                        </div>
                        <button type="button" onClick={() => onRemoveItem(id)} className="p-1 text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="shrink-0 border-t border-indigo-100/70 bg-indigo-50/35 p-3">
            <div className="mb-1 flex justify-between text-[10px] text-slate-600">
              <span>Sub</span>
              <span>₹{Number(subtotal || 0).toFixed(0)}</span>
            </div>
            <div className="mb-1 flex justify-between text-[10px] text-slate-600">
              <span>Tax</span>
              <span>₹{Number(tax || 0).toFixed(0)}</span>
            </div>
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{Number(grandTotal || 0).toFixed(0)}</span>
            </div>
            <button
              type="button"
              onClick={onSendToKitchen}
              disabled={sending}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {sending ? "…" : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" /> Send to kitchen
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCartDrawer;
