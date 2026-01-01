import { CheckCircle, ChefHat, Clock, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../utils/axios";

const STATUS_META = {
  pending: {
    color: "border-yellow-400",
    label: "PENDING",
    bg: "bg-yellow-50",
  },
  preparing: {
    color: "border-orange-400",
    label: "PREPARING",
    bg: "bg-orange-50",
  },
  ready: {
    color: "border-green-500",
    label: "READY",
    bg: "bg-green-50",
  },
};

const KitchenScreen = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const res = await api.get("/api/orders");
    setOrders(res.data || []);
  };

  useEffect(() => {
    loadOrders();
    const t = setInterval(loadOrders, 5000);
    return () => clearInterval(t);
  }, []);

  const updateItemStatus = async (orderId, itemId, status) => {
    await api.patch(`/api/orders/${orderId}/items/${itemId}`, { status });
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 🔥 HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center gap-2 shadow-sm">
        <ChefHat className="text-orange-500" />
        <h1 className="text-xl md:text-2xl font-bold">
          Kitchen Orders
        </h1>
      </div>

      {/* 🔥 CONTENT */}
      <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-white rounded-lg shadow flex flex-col"
          >
            {/* ORDER HEADER */}
            <div className="p-3 border-b flex justify-between items-center">
              <div>
                <div className="font-bold text-lg">
                  Table {o.tableId?.tableNumber}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(o.createdAt).toLocaleTimeString()}
                </div>
              </div>

              <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                {o.items.length} items
              </span>
            </div>

            {/* ITEMS */}
            <div className="p-3 space-y-2 overflow-y-auto max-h-[60vh]">
              {o.items.map((i) => {
                const meta = STATUS_META[i.status];

                return (
                  <div
                    key={i._id}
                    className={`border-l-4 ${meta.color} ${meta.bg} rounded p-2`}
                  >
                    <div className="flex justify-between items-start text-sm font-medium">
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span className="text-gray-700">
                        ₹{i.price * i.quantity}
                      </span>
                    </div>

                    <div className="mt-2">
                      {i.status === "pending" && (
                        <button
                          onClick={() =>
                            updateItemStatus(o._id, i._id, "preparing")
                          }
                          className="w-full flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded text-sm"
                        >
                          <Flame size={14} /> Start Cooking
                        </button>
                      )}

                      {i.status === "preparing" && (
                        <button
                          onClick={() =>
                            updateItemStatus(o._id, i._id, "ready")
                          }
                          className="w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm"
                        >
                          <CheckCircle size={14} /> Mark Ready
                        </button>
                      )}

                      {i.status === "ready" && (
                        <div className="text-center text-green-700 font-bold text-sm">
                          ✔ READY
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenScreen;
