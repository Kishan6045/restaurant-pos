import { useEffect, useState } from "react";
import ProfileDropdown from "../../components/ProfileDropdown";
import api from "../../utils/axios";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-emerald-100 text-emerald-700",
  served: "bg-slate-100 text-slate-600",
};

const KitchenScreen = () => {
  const [rows, setRows] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ================= FETCH & MERGE =================
  const fetchAndMerge = async () => {
    setIsRefreshing(true);
    setErrorMessage("");
    try {
      let res;
      try {
        res = await api.get("/api/kitchen/orders");
      } catch (err) {
        if (err.response?.status === 403) {
          res = await api.get("/api/orders");
        } else {
          throw err;
        }
      }

      const orders = Array.isArray(res.data)
        ? res.data
        : res.data.orders || [];

      const nextRows = [];

      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const status = item.status || "pending";
          const key = `${order._id}_${item._id}`;

          nextRows.push({
            key,
            orderId: order._id,
            itemId: item._id,
            floor: order.tableId?.floor || "Ground",
            table: order.tableId?.tableNumber || "-",
            name: item.productId?.name || item.product?.name || item.name,
            qty: item.quantity,
            status,
          });
        });
      });

      setRows(nextRows);

      setLastUpdated(new Date());
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to load kitchen orders"
      );
      console.error("Kitchen live fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (orderId, itemId, nextStatus) => {
    setRows((prev) =>
      prev.map((r) =>
        r.itemId === itemId ? { ...r, status: nextStatus } : r
      )
    );

    try {
      await api.patch(
        `/api/orders/${orderId}/items/${itemId}`,
        { status: nextStatus }
      );
    } catch {
      fetchAndMerge();
    }
  };

  // ================= LIVE POLLING =================
  useEffect(() => {
    fetchAndMerge();
    const interval = setInterval(fetchAndMerge, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeRows = rows.filter((r) =>
    ["pending", "preparing"].includes(r.status)
  );
  const pendingCount = activeRows.filter((r) => r.status === "pending").length;
  const preparingCount = activeRows.filter((r) => r.status === "preparing").length;
  const uniqueTables = new Set(
    activeRows.map((r) => `${r.floor}-${r.table}`)
  ).size;

  const formatTime = (value) => {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="h-14 px-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Kitchen Panel</h2>
          <ProfileDropdown role="kitchen" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ================= STATS ================= */}
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Total Items" value={rows.length} />
          <Stat label="Pending" value={pendingCount} color="amber" />
          <Stat label="Preparing" value={preparingCount} color="orange" />
          <Stat label="Active Tables" value={uniqueTables} color="emerald" />
        </div>

        {/* ================= TABLE ================= */}
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <p className="text-sm font-semibold">Orders</p>
              <p className="text-xs text-slate-500">
                Updated {formatTime(lastUpdated)}
              </p>
            </div>
            <button
              onClick={fetchAndMerge}
              disabled={isRefreshing}
              className="text-xs font-semibold px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 text-xs text-rose-700 bg-rose-50 border-b">
              {errorMessage}
            </div>
          )}

          {rows.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No orders yet
            </div>
          ) : (
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "480px" }} // ≈ 8 rows
            >
              <table className="min-w-full text-sm">

                <thead className="bg-slate-100 sticky top-0 z-10 text-xs uppercase text-slate-500">
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
                    <tr
                      key={r.key}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="p-3 font-medium">{r.floor}</td>
                      <td className="p-3">T-{r.table}</td>
                      <td className="p-3">{r.name}</td>
                      <td className="p-3 text-center font-semibold">
                        {r.qty}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] || STATUS_STYLES.served}`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {r.status === "pending" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                r.orderId,
                                r.itemId,
                                "preparing"
                              )
                            }
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600"
                          >
                            Start
                          </button>
                        )}
                        {r.status === "preparing" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                r.orderId,
                                r.itemId,
                                "ready"
                              )
                            }
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Ready
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================= SMALL STAT CARD =================
const Stat = ({ label, value, color = "slate" }) => (
  <div className="rounded-xl border bg-white p-4">
    <p className={`text-xs uppercase text-${color}-500`}>{label}</p>
    <p className={`mt-1 text-2xl font-semibold text-${color}-700`}>
      {value}
    </p>
  </div>
);

export default KitchenScreen;
