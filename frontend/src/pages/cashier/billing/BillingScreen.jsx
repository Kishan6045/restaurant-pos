import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ChefHat, RefreshCw } from "lucide-react";
import api from "../../../utils/axios";
import Loader from "../../../components/Loader";
import { ordersListFromResponse, orderTableId, orderTicketLabel } from "../../../helpers/ordersResponse";
import {
  allLineItemsKitchenReady,
  kitchenLineStats,
  kitchenStatusLabel,
} from "../../../helpers/orderKitchen";
import { POS, posLineImageSrc } from "../../../components/cashier/posListTheme";

const TAX_RATE = 0.05;
const FINAL_ORDER_STATUSES = new Set(["completed", "closed"]);

const statusRowClass = (status) => {
  const s = String(status || "pending").toLowerCase();
  if (s === "ready" || s === "served") return "text-emerald-800 bg-emerald-50 border-emerald-200";
  if (s === "preparing") return "text-sky-900 bg-sky-50 border-sky-200";
  return "text-zinc-600 bg-zinc-100 border-zinc-200";
};

const BillingScreen = () => {
  const { tableId, orderId } = useParams();
  const navigate = useNavigate();
  const isViewMode = Boolean(orderId);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  const loadOrder = useCallback(
    async (opts = { silent: false }) => {
      const silent = opts.silent === true;
      if (!silent) setLoading(true);
      try {
        if (isViewMode) {
          const res = await api.get(`/api/cashier/billing/${orderId}`);
          setOrder(res.data);
          return;
        }
        const res = await api.get("/api/orders", { params: { tableId } });
        const list = ordersListFromResponse(res.data);
        const openOrder = list.find(
          (o) =>
            orderTableId(o) === String(tableId) &&
            !FINAL_ORDER_STATUSES.has(o.orderStatus)
        );
        setOrder(openOrder || null);
      } catch {
        setOrder(null);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tableId, orderId, isViewMode]
  );

  useEffect(() => {
    loadOrder({ silent: false });
  }, [loadOrder]);

  useEffect(() => {
    if (isViewMode || !tableId) return;
    const id = setInterval(() => loadOrder({ silent: true }), 6000);
    return () => clearInterval(id);
  }, [isViewMode, tableId, loadOrder]);

  const items = order?.items || [];
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0),
    [items]
  );
  const tax = subtotal * TAX_RATE;
  const computedTotal = subtotal + tax;
  const totalAmount = typeof order?.totalAmount === "number" ? order.totalAmount : computedTotal;
  const itemCount = useMemo(() => items.reduce((s, i) => s + Number(i.quantity || 0), 0), [items]);
  const isPaid = order?.paymentStatus === "paid";

  const kitchenReady = allLineItemsKitchenReady(order);
  const kStats = useMemo(() => kitchenLineStats(order), [order]);
  const canTakePayment = !isViewMode && !isPaid && kitchenReady && items.length > 0;

  useEffect(() => {
    if (order?.paymentMethod) setPaymentMethod(order.paymentMethod);
  }, [order?.paymentMethod]);

  const formatMoney = (v) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(v || 0);

  const handlePayment = async () => {
    if (!order || isViewMode) return;
    if (order.paymentStatus === "paid") {
      toast.info("Already paid");
      return;
    }
    if (!kitchenReady) {
      toast.warning("Wait for kitchen to mark all items Ready before taking payment.");
      return;
    }
    try {
      setPaying(true);
      await api.post("/api/payments", { orderId: order._id ?? order.id, method: paymentMethod });
      toast.success("Payment completed · table cleared");
      navigate(`/cashier/billing/order/${order._id ?? order.id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Loader
        label="Loading bill…"
        containerClassName="min-h-[40vh] p-6"
        spinnerClassName="text-indigo-600"
      />
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-card">
          <p className="text-sm font-semibold text-slate-900">
            {isViewMode ? "Bill not found" : "No open order"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {isViewMode
              ? "This receipt may have been removed or the link is invalid."
              : "Open an order from a table first."}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-100 pb-8 text-zinc-900">
      <div className="w-full px-0 py-3 sm:py-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-100"
          >
            Back
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Billing</p>
            <p className="truncate text-xs font-semibold text-zinc-900">
              {isViewMode
                ? "Receipt"
                : `Table ${order.tableId?.tableNumber != null ? order.tableId.tableNumber : tableId}`}
            </p>
            <p className="mt-0.5 text-[11px] font-bold tabular-nums text-indigo-800">{orderTicketLabel(order)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!isViewMode && !isPaid && (
              <button
                type="button"
                onClick={() => loadOrder({ silent: true })}
                className="inline-flex rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-50"
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <div
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                isPaid ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-sky-200 bg-sky-50 text-sky-900"
              }`}
            >
              {itemCount} · {isPaid ? "Paid" : "Open"}
            </div>
          </div>
        </header>

        {isPaid && (
          <div className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
            Paid{order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
          </div>
        )}

        {!isViewMode && !isPaid && items.length > 0 && (
          <div
            className={`mb-2 flex flex-col gap-1 rounded-xl border px-3 py-2 ${
              kitchenReady ? "border-emerald-200 bg-emerald-50/80" : "border-sky-200 bg-sky-50/80"
            }`}
          >
            <div className="flex items-start gap-2">
              <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
              <div>
                <p className="text-xs font-semibold text-zinc-900">
                  {kitchenReady ? "Kitchen done — take payment" : "Waiting on kitchen"}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-600">
                  {kitchenReady
                    ? "All lines Ready. Pick method, then Pay."
                    : `${kStats.done} / ${kStats.total} ready — payment locked until all Ready.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-100 px-2 py-1.5">
              <h2 className="text-[11px] font-semibold text-zinc-700">Lines</h2>
              <span className="text-[10px] text-zinc-500">{items.length}</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-1 md:max-h-[min(60vh,560px)] md:p-2">
              <div className={POS.list}>
                {items.map((item) => {
                  const src = posLineImageSrc(item);
                  return (
                    <div key={item.id ?? item._id} className={POS.rowStatic}>
                      <img
                        src={src}
                        alt=""
                        className={POS.thumb}
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={POS.title}>{item.name}</p>
                        <p className={POS.sub}>
                          ×{item.quantity} · {formatMoney(item.price)} ea
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className={POS.priceSm}>{formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</span>
                        {!isViewMode && (
                          <span
                            className={`rounded-lg border px-1 py-px text-[9px] font-semibold uppercase ${statusRowClass(item.status)}`}
                          >
                            {kitchenStatusLabel(item.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-2 md:col-span-1 md:min-w-0">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <h3 className="mb-1.5 text-[11px] font-semibold text-zinc-700">Summary</h3>
              <div className="space-y-1 text-[11px] text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatMoney(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-1 text-sm font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>{formatMoney(totalAmount)}</span>
                </div>
              </div>
            </div>

            {!isViewMode && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                <h3 className="mb-1.5 text-[11px] font-semibold text-zinc-700">Payment</h3>
                <div className="mb-2 grid grid-cols-3 gap-1">
                  {["cash", "upi", "card"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      disabled={isPaid || paying}
                      className={`rounded-xl py-1.5 text-[10px] font-semibold uppercase ${
                        paymentMethod === m ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isPaid || paying || !canTakePayment}
                  className="w-full rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPaid ? "Paid" : paying ? "…" : kitchenReady ? "Pay & free table" : "Locked — kitchen"}
                </button>
                {isPaid && (
                  <button
                    type="button"
                    onClick={() => navigate(`/cashier/billing/order/${order._id ?? order.id}`)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-50"
                  >
                    View receipt
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BillingScreen;
