import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const BillingScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  // ================= FETCH OPEN ORDER =================
  const loadOrder = async () => {
    try {
      const res = await api.get("/api/orders");

      const openOrder = res.data.find(
        (o) =>
          o.tableId?._id === tableId &&
          o.orderStatus === "open"
      );

      setOrder(openOrder || null);
    } catch (err) {
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  // ================= PAYMENT =================
  const handlePayment = async () => {
    if (!order) return;

    try {
      setPaying(true);

      await api.post("/api/payments", {
        orderId: order._id,
        method: paymentMethod
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
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">
          No open order found
        </h2>
        <button
          onClick={() => navigate("/cashier/tables")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Back to Tables
        </button>
      </div>
    );
  }

  return (
    // <div className="max-w-xl mx-auto bg-white shadow rounded p-6 space-y-4">

    //   {/* HEADER */}
    //   <div className="flex justify-between items-center">
    //     <h2 className="text-xl font-bold">
    //       Billing – Table {order.tableId.tableNumber}
    //     </h2>
    //     <span className="text-sm text-gray-500">
    //       {order.items.length} Items
    //     </span>
    //   </div>

    //   {/* ITEMS */}
    //   <div className="border rounded divide-y">
    //     {order.items.map((i) => (
    //       <div
    //         key={i._id}
    //         className="flex justify-between p-2 text-sm"
    //       >
    //         <span>
    //           {i.name} × {i.quantity}
    //         </span>
    //         <span>
    //           ₹{i.price * i.quantity}
    //         </span>
    //       </div>
    //     ))}
    //   </div>

    //   {/* TOTAL */}
    //   <div className="flex justify-between font-bold text-lg">
    //     <span>Total</span>
    //     <span>₹{order.totalAmount}</span>
    //   </div>

    //   {/* PAYMENT MODE */}
    //   <div className="space-y-2">
    //     <div className="font-medium">Payment Method</div>

    //     <div className="flex gap-2">
    //       {["cash", "upi", "card"].map((m) => (
    //         <button
    //           key={m}
    //           onClick={() => setPaymentMethod(m)}
    //           className={`flex-1 py-2 rounded border font-medium
    //             ${paymentMethod === m
    //               ? "bg-black text-white"
    //               : "bg-white"
    //             }`}
    //         >
    //           {m.toUpperCase()}
    //         </button>
    //       ))}
    //     </div>
    //   </div>

    //   {/* PAY BUTTON */}
    //   <button
    //     onClick={handlePayment}
    //     disabled={paying}
    //     className="w-full bg-green-600 text-white py-3 rounded font-bold"
    //   >
    //     {paying ? "Processing..." : "PAY & CLOSE"}
    //   </button>

    // </div>
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-400">
                Billing
              </p>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Table T-{order.tableId.tableNumber}
              </h2>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-500">
              {order.items.length} items
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* ===== ITEMS (SCROLLABLE) ===== */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 divide-y text-[11px] sm:text-xs max-h-44 sm:max-h-60 overflow-y-auto">
            {order.items.map((i) => (
              <div
                key={i._id}
                className="flex justify-between px-3 py-2"
              >
                <span className="truncate max-w-[65%] text-slate-700">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-semibold text-slate-900">
                  ₹{i.price * i.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* ===== TOTAL ===== */}
          <div className="flex justify-between items-center rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white px-4 py-3 text-sm font-semibold">
            <span className="text-slate-700">Total Amount</span>
            <span className="text-emerald-600 text-base sm:text-lg">
              ₹{order.totalAmount}
            </span>
          </div>

          {/* ===== PAYMENT MODE ===== */}
          <div className="grid grid-cols-3 gap-2">
            {["cash", "upi", "card"].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all
                  ${paymentMethod === m
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ===== PAY BUTTON ===== */}
          <button
            onClick={handlePayment}
            disabled={paying}
            className={`w-full py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-bold transition-all
              ${paying
                ? "bg-slate-300"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              } text-white`}
          >
            {paying ? "Processing..." : "PAY & CLOSE"}
          </button>
        </div>
      </div>
    </div>

  );
};

export default BillingScreen;
