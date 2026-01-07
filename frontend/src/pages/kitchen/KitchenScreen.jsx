import { useEffect, useRef, useState } from "react";
import api from "../../utils/axios";

const KitchenScreen = () => {
  const [rows, setRows] = useState([]);
  const knownIds = useRef(new Set()); // 👈 already shown items

  // ================= FETCH & MERGE =================
  const fetchAndMerge = async () => {
    try {
      const res = await api.get("/api/kitchen/orders");

      const orders = Array.isArray(res.data)
        ? res.data
        : res.data.orders || [];

      const newRows = [];

      orders.forEach((order) => {
        order.items?.forEach((item) => {
          // sirf pending / preparing
          if (!["pending", "preparing"].includes(item.status)) return;

          // unique key
          const key = `${order._id}_${item._id}`;

          // agar pehle se dikha hua hai → skip
          if (knownIds.current.has(key)) return;

          knownIds.current.add(key);

          newRows.push({
            key,
            orderId: order._id,
            itemId: item._id,
            floor: order.tableId?.floor || "Ground",
            table: order.tableId?.tableNumber || "-",
            name: item.product?.name || item.name,
            qty: item.quantity,
            status: item.status,
          });
        });
      });

      // 🔥 sirf NEW rows add
      if (newRows.length) {
        setRows((prev) => [...newRows, ...prev]);
      }
    } catch (err) {
      console.error("Kitchen live fetch error:", err);
    }
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (orderId, itemId, nextStatus) => {
    // optimistic UI
    setRows((prev) =>
      prev
        .map((r) =>
          r.itemId === itemId ? { ...r, status: nextStatus } : r
        )
        .filter((r) => r.status !== "ready")
    );

    try {
      await api.patch(
        `/api/orders/${orderId}/items/${itemId}`,
        { status: nextStatus }
      );
    } catch {
      fetchAndMerge(); // fallback
    }
  };

  // ================= LIVE POLLING (NO JHATKA) =================
  useEffect(() => {
    fetchAndMerge(); // initial load

    const interval = setInterval(fetchAndMerge, 5000); // 👈 LIVE
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">
        🍳 Kitchen – Live Orders
      </h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Floor</th>
              <th className="p-3 text-left">Table</th>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t">
                <td className="p-3 font-semibold">{r.floor}</td>
                <td className="p-3 font-semibold">T-{r.table}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3 text-center">{r.qty}</td>

                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold
                      ${
                        r.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </td>

                <td className="p-3 text-center">
                  {r.status === "pending" && (
                    <button
                      onClick={() =>
                        updateStatus(r.orderId, r.itemId, "preparing")
                      }
                      className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Start
                    </button>
                  )}

                  {r.status === "preparing" && (
                    <button
                      onClick={() =>
                        updateStatus(r.orderId, r.itemId, "ready")
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Ready
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No pending or preparing items
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenScreen;
