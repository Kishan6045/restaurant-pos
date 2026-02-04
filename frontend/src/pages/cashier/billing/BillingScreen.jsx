
// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../../utils/axios";
// import Loader from "../../../components/Loader";

// const TAX_RATE = 0.05;
// const FINAL_ORDER_STATUSES = new Set(["completed", "closed"]);

// const BillingScreen = () => {
//   const { tableId } = useParams();
//   const navigate = useNavigate();

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [paymentMethod, setPaymentMethod] = useState("cash");
//   const [paying, setPaying] = useState(false);

//   const loadOrder = async () => {
//     try {
//       const res = await api.get("/api/orders");
//       const openOrder = (res.data || []).find(
//         (o) =>
//           o.tableId?._id === tableId &&
//           !FINAL_ORDER_STATUSES.has(o.orderStatus)  
//       );

//       setOrder(openOrder || null);
//     } catch (err) {
//       alert("Failed to load order");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadOrder();
//   }, []);

//   const items = order?.items || [];

//   const subtotal = useMemo(() => {
//     return items.reduce(
//       (sum, item) => sum + Number(item.price || 0) * item.quantity,
//       0
//     );
//   }, [items]);

//   const tax = subtotal * TAX_RATE;
//   const computedTotal = subtotal + tax;
//   const totalAmount =
//     typeof order?.totalAmount === "number" ? order.totalAmount : computedTotal;

//   const itemCount = useMemo(
//     () => items.reduce((sum, item) => sum + item.quantity, 0),
//     [items]
//   );

//   const isPaid = order?.paymentStatus === "paid";

//   useEffect(() => {
//     if (order?.paymentMethod) {
//       setPaymentMethod(order.paymentMethod);
//     }
//   }, [order?.paymentMethod]);

//   const formatMoney = (value) =>
//     new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 2,
//     }).format(value || 0);

//   const handlePayment = async () => {
//     if (!order) return;
//     if (order.paymentStatus === "paid") {
//       alert("Payment already completed");
//       return;
//     }
//     try {
//       setPaying(true);
//       await api.post("/api/payments", {
//         orderId: order._id,
//         method: paymentMethod,
//       });
//       alert("Payment successful");
//       setOrder((prev) =>
//         prev
//           ? {
//               ...prev,
//               paymentStatus: "paid",
//               paymentMethod,
//             }
//           : prev
//       );
//     } catch (err) {
//       alert("Payment failed");
//     } finally {
//       setPaying(false);
//     }
//   };

//   if (loading) {
//     return <Loader label="Loading bill..." containerClassName="p-6" />;
//   }

//   if (!order) {
//     return (
//       <div className="p-6">
//         <h2 className="mb-2 text-xl font-bold">No open order found</h2>
//         <button
//           onClick={() => navigate("/cashier/tables")}
//           className="rounded bg-black px-4 py-2 text-white"
//         >
//           Back to Tables
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="mx-auto w-full max-w-5xl px-4 py-6">
//         <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
//           <button
//             onClick={() => navigate(`/cashier/table/${tableId}`)}
//             className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
//           >
//             Back to Tables
//           </button>
//           <div className="min-w-[200px] text-center">
//             <p className="text-xs uppercase tracking-wide text-slate-400">
//               Billing
//             </p>
//             <h1 className="text-lg font-semibold text-slate-900">
//               Table T-{order.tableId?.tableNumber || tableId}
//             </h1>
//           </div>
//           <div
//             className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
//               isPaid
//                 ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//                 : "border-amber-200 bg-amber-50 text-amber-700"
//             }`}
//           >
//             {itemCount} items • {isPaid ? "Paid" : "Open"}
//           </div>
//         </header>

//         {isPaid && (
//           <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
//             Payment received
//             {order.paymentMethod
//               ? ` via ${order.paymentMethod.toUpperCase()}.`
//               : "."}
//           </div>
//         )}

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <section className="lg:col-span-2">
//             <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//               <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
//                 <h2 className="text-sm font-semibold text-slate-900">
//                   Order Items
//                 </h2>
//                 <span className="text-xs text-slate-500">
//                   {items.length} lines
//                 </span>
//               </div>

//               <div className="max-h-[55vh] overflow-y-auto p-4 pr-2">
//                 {items.length === 0 ? (
//                   <div className="py-10 text-center text-sm text-slate-500">
//                     No items in this order.
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {items.map((item) => (
//                       <div
//                         key={item._id}
//                         className="rounded-xl border border-slate-200 px-3 py-2"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="min-w-0">
//                             <p className="truncate text-sm font-semibold text-slate-900">
//                               {item.name}
//                             </p>
//                             <p className="text-xs text-slate-500">
//                               Qty: {item.quantity} • Each:{" "}
//                               {formatMoney(item.price)}
//                             </p>
//                           </div>
//                           <span className="text-sm font-semibold text-slate-900">
//                             {formatMoney(
//                               Number(item.price || 0) * item.quantity
//                             )}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           <aside className="space-y-4 lg:col-span-1">
//             <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
//               <div className="mt-4 space-y-2 text-sm text-slate-600">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span>{formatMoney(subtotal)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Tax (5%)</span>
//                   <span>{formatMoney(tax)}</span>
//                 </div>
//                 <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
//                   <span>Total</span>
//                   <span>{formatMoney(totalAmount)}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-900">
//                 Payment Status
//               </h3>
//               <div className="mt-3 flex items-center justify-between text-sm">
//                 <span className="text-slate-600">Status</span>
//                 <span
//                   className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                     isPaid
//                       ? "bg-emerald-100 text-emerald-700"
//                       : "bg-amber-100 text-amber-700"
//                   }`}
//                 >
//                   {isPaid ? "Paid" : "Pending"}
//                 </span>
//               </div>
//               <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
//                 <span>Method</span>
//                 <span className="font-semibold text-slate-900">
//                   {(order.paymentMethod || paymentMethod || "—").toUpperCase()}
//                 </span>
//               </div>
//             </div>

//             <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-900">
//                 Payment Method
//               </h3>
//               <div className="mt-3 grid grid-cols-3 gap-2">
//                 {["cash", "upi", "card"].map((method) => (
//                   <button
//                     key={method}
//                     onClick={() => setPaymentMethod(method)}
//                     disabled={isPaid || paying}
//                     className={`rounded-lg border px-2 py-2 text-xs font-semibold uppercase transition ${
//                       paymentMethod === method
//                         ? "border-slate-900 bg-slate-900 text-white"
//                         : "border-slate-200 text-slate-600 hover:bg-slate-50"
//                     } ${isPaid || paying ? "cursor-not-allowed opacity-60" : ""}`}
//                   >
//                     {method}
//                   </button>
//                 ))}
//               </div>
//               <button
//                 onClick={handlePayment}
//                 disabled={paying || isPaid}
//                 className={`mt-4 w-full rounded-xl py-3 text-sm font-bold text-white transition ${
//                   paying || isPaid
//                     ? "bg-slate-300"
//                     : "bg-emerald-600 hover:bg-emerald-700"
//                 }`}
//               >
//                 {isPaid ? "Paid" : paying ? "Processing..." : "Pay & Close"}
//               </button>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingScreen;




import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axios";
import Loader from "../../../components/Loader";

const TAX_RATE = 0.05;
const FINAL_ORDER_STATUSES = new Set(["completed", "closed"]);

const BillingScreen = () => {
  const { tableId, orderId } = useParams(); // 🔥 BOTH
  const navigate = useNavigate();

  const isViewMode = Boolean(orderId); // 🔥 orderId = VIEW PAID BILL

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  const loadOrder = async () => {
    try {
      // 🔵 VIEW MODE → ONLY PAID BILL BY ORDER ID
      if (isViewMode) {
        const res = await api.get(`/api/cashier/billing/${orderId}`);
        setOrder(res.data);
        return;
      }

      // 🟢 PAY MODE → OPEN ORDER BY TABLE
      const res = await api.get("/api/orders");
      const openOrder = (res.data || []).find(
        (o) =>
          o.tableId?._id === tableId &&
          !FINAL_ORDER_STATUSES.has(o.orderStatus)
      );

      setOrder(openOrder || null);
    } catch (err) {
      alert("Failed to load bill");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [tableId, orderId]);

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
    typeof order?.totalAmount === "number"
      ? order.totalAmount
      : computedTotal;

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const isPaid = order?.paymentStatus === "paid";

  useEffect(() => {
    if (order?.paymentMethod) {
      setPaymentMethod(order.paymentMethod);
    }
  }, [order?.paymentMethod]);

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handlePayment = async () => {
    if (!order || isViewMode) return;

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
      navigate(`/cashier/billing/order/${order._id}`);

    } catch {
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
        <h2 className="mb-2 text-xl font-bold">
          {isViewMode ? "Paid bill not found" : "No open order found"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-slate-50">
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* HEADER */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          Back
        </button>

        <div className="min-w-[200px] text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Billing
          </p>
          <h1 className="text-lg font-semibold text-slate-900">
            {isViewMode
              ? `Bill #${order.orderId || order._id}`
              : `Table T-${order.tableId?.tableNumber || tableId}`}
          </h1>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
            isPaid
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {itemCount} items • {isPaid ? "Paid" : "Open"}
        </div>
      </header>

      {/* PAID INFO */}
      {isPaid && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Payment received
          {order.paymentMethod
            ? ` via ${order.paymentMethod.toUpperCase()}.`
            : "."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ITEMS */}
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
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200 px-3 py-2 mb-2"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} • {formatMoney(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <aside className="space-y-4 lg:col-span-1">
          {/* SUMMARY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatMoney(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* PAYMENT (ONLY PAY MODE) */}
          {!isViewMode && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold">Payment</h3>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {["cash", "upi", "card"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    disabled={isPaid || paying}
                    className={`rounded px-2 py-2 text-xs font-semibold ${
                      paymentMethod === m
                        ? "bg-black text-white"
                        : "border"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePayment}
                disabled={isPaid || paying}
                className="mt-4 w-full rounded bg-emerald-600 py-3 font-bold text-white"
              >
                {isPaid ? "Paid" : paying ? "Processing..." : "Pay & Close"}
              </button>

              {/* ✅ VIEW BILL BUTTON */}
              {isPaid && (
                <button
                  onClick={() =>
                    navigate(`/cashier/billing/order/${order._id}`)
                  }
                  className="mt-3 w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View Bill
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
