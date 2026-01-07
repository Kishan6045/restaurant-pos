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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow border p-3 sm:p-4 space-y-3">

  {/* ===== HEADER ===== */}
  <div className="flex justify-between items-center border-b pb-2">
    <h2 className="text-sm sm:text-base font-semibold">
      Bill · T-{order.tableId.tableNumber}
    </h2>
    <span className="text-xs text-gray-500">
      {order.items.length} items
    </span>
  </div>

  {/* ===== ITEMS (SCROLLABLE) ===== */}
  <div className="border rounded-lg divide-y text-xs max-h-48 sm:max-h-56 overflow-y-auto">
    {order.items.map((i) => (
      <div
        key={i._id}
        className="flex justify-between px-2 py-1.5"
      >
        <span className="truncate max-w-[65%]">
          {i.name} × {i.quantity}
        </span>
        <span className="font-medium">
          ₹{i.price * i.quantity}
        </span>
      </div>
    ))}
  </div>

  {/* ===== TOTAL ===== */}
  <div className="flex justify-between items-center bg-gray-50 border rounded-lg px-3 py-2 text-sm font-semibold">
    <span>Total</span>
    <span className="text-green-600">
      ₹{order.totalAmount}
    </span>
  </div>

  {/* ===== PAYMENT MODE ===== */}
  <div className="grid grid-cols-3 gap-1">
    {["cash", "upi", "card"].map((m) => (
      <button
        key={m}
        onClick={() => setPaymentMethod(m)}
        className={`py-1.5 rounded-lg border text-xs font-semibold
          ${paymentMethod === m
            ? "bg-black text-white"
            : "bg-white"
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
    className={`w-full py-2 rounded-lg text-sm font-bold
      ${paying
        ? "bg-gray-400"
        : "bg-green-600 hover:bg-green-700"
      } text-white`}
  >
    {paying ? "Processing..." : "PAY & CLOSE"}
  </button>

</div>

  );
};

export default BillingScreen;
