import { useEffect, useState } from "react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";


const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
};
const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ADMIN API (NOT kitchen)
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.orders || [];

      // 🔥 sirf LIVE items filter (same as kitchen)
      const liveOnly = data.filter(
        (o) =>
          ACTIVE_ORDER_STATUSES.has(o.orderStatus) &&
          o.items?.some((i) =>
            ["pending", "preparing"].includes(i.status)
          )
      );

      setOrders(liveOnly);
    } catch (err) {
      console.error("Admin live orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 5000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return <Loader label="Loading live orders..." containerClassName="p-6" />;
  } if (orders.length === 0)
    return <div className="p-6">No live orders</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Live Orders
        </h1>

      </div>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white border rounded-xl shadow-sm overflow-hidden"
        >
          {/* ORDER HEADER */}
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
            <div className="font-semibold text-gray-800">
              Table T-{order.tableId?.tableNumber || "-"}
              <span className="ml-2 text-xs text-gray-500">
                {order.items.filter(i =>
                  ["pending", "preparing"].includes(i.status)
                ).length} items
              </span>
            </div>

            <span className="text-xs text-gray-400">
              OPEN
            </span>
          </div>

          {/* ITEMS LIST (SCROLLABLE) */}
          <div className="max-h-64 overflow-y-auto divide-y">
            {order.items
              .filter((i) =>
                ["pending", "preparing"].includes(i.status)
              )
              .map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {item.productId?.name || item.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold
                    ${STATUS_COLOR[item.status]}
                  `}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveOrders;
