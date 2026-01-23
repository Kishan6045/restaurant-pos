import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axios";
import Loader from "../../../components/Loader";

const TAX_RATE = 0.05;
const FINAL_ORDER_STATUSES = new Set(["completed", "closed"]);

const BillingScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await api.get("/api/orders");
      const openOrder = (res.data || []).find(
        (o) =>
          o.tableId?._id === tableId &&
          !FINAL_ORDER_STATUSES.has(o.orderStatus)
      );

      setOrder(openOrder || null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load order";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  const items = order?.items || [];

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price || 0) * item.quantity,
      0
    );
  }, [items]);

  const tax = subtotal * TAX_RATE;
  const computedTotal = subtotal + tax;
  const totalAmount =
    typeof order?.totalAmount === "number" ? order.totalAmount : computedTotal;

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handlePayment = async () => {
    if (!order) return;
    if (order.paymentStatus === "paid") {
      alert("Payment already completed");
      return;
    }
    try {
      setPaying(true);
      await api.post("/api/payments", {
        orderId: order._id,
        method: paymentMethod,
      });
      alert("Payment successful");
      navigate("/cashier/tables");
    } catch (err) {
      alert("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <Loader label="Loading bill..." containerClassName="p-6" />;
  }

  if (!order) {
    return (
      <div className="p-6">
        <h2 className="mb-2 text-xl font-bold">No open order found</h2>
        <button
          onClick={() => navigate("/cashier/tables")}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Back to Tables
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/cashier/table/${tableId}`)
            }
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            Back to Tables
          </button>
          <div className="min-w-[200px] text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Billing
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              Table T-{order.tableId?.tableNumber || tableId}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            {itemCount} items • Open
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Order Items
                </h2>
                <span className="text-xs text-slate-500">
                  {items.length} lines
                </span>
              </div>

              <div className="max-h-[55vh] overflow-y-auto p-4 pr-2">
                {items.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    No items in this order.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-xl border border-slate-200 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Qty: {item.quantity} • Each:{" "}
                              {formatMoney(item.price)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {formatMoney(
                              Number(item.price || 0) * item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>{formatMoney(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatMoney(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Payment Method
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["cash", "upi", "card"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold uppercase transition ${paymentMethod === method
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePayment}
                disabled={paying}
                className={`mt-4 w-full rounded-xl py-3 text-sm font-bold text-white transition ${paying
                  ? "bg-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
              >
                {paying ? "Processing..." : "Pay & Close"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BillingScreen;