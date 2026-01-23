import { useEffect, useMemo, useState } from "react";
import ProfileDropdown from "../../components/ProfileDropdown";
import api from "../../utils/axios";

const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);
const ACTIVE_ITEM_STATUSES = new Set(["pending", "preparing"]);
const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-orange-100 text-orange-700",
};

const KitchenScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get("/api/kitchen/orders");
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];

      const normalized = data
        .filter((order) => ACTIVE_ORDER_STATUSES.has(order.orderStatus))
        .map((order) => {
          const items = (order.items || [])
            .filter((item) => ACTIVE_ITEM_STATUSES.has(item.status))
            .map((item) => ({
              ...item,
              name: item.productId?.name || item.name || "Unknown item",
            }));

          return {
            ...order,
            items,
          };
        })
        .filter((order) => order.items.length > 0)
        .sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return aTime - bTime;
        });

      setOrders(normalized);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Kitchen live fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateStatus = async (orderId, itemId, nextStatus) => {
    setOrders((prev) =>
      prev
        .map((order) => {
          if (order._id !== orderId) return order;
          const nextItems = order.items
            .map((item) =>
              item._id === itemId ? { ...item, status: nextStatus } : item
            )
            .filter((item) => item.status !== "ready");
          return {
            ...order,
            items: nextItems,
          };
        })
        .filter((order) => order.items.length > 0)
    );

    try {
      await api.patch(`/api/orders/${orderId}/items/${itemId}`, {
        status: nextStatus,
      });
    } catch {
      fetchOrders();
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const summary = useMemo(() => {
    const tableSet = new Set();
    let totalQty = 0;
    let pendingQty = 0;
    let preparingQty = 0;

    orders.forEach((order) => {
      tableSet.add(order.tableId?.tableNumber || "-");
      order.items.forEach((item) => {
        const qty = Number(item.quantity || 0);
        totalQty += qty;
        if (item.status === "pending") {
          pendingQty += qty;
        } else if (item.status === "preparing") {
          preparingQty += qty;
        }
      });
    });

    return {
      totalOrders: orders.length,
      totalQty,
      pendingQty,
      preparingQty,
      uniqueTables: tableSet.size,
    };
  }, [orders]);

  const formatTime = (value) => {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="flex h-14 items-center justify-between px-6">
          <h2 className="font-semibold text-slate-700">Kitchen Panel</h2>
          <ProfileDropdown role="kitchen" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Live Orders
            </h3>
            <p className="text-xs text-slate-500">
              Updated {formatTime(lastUpdated)}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Orders" value={summary.totalOrders} />
          <Stat label="Pending Qty" value={summary.pendingQty} color="amber" />
          <Stat
            label="Preparing Qty"
            value={summary.preparingQty}
            color="orange"
          />
          <Stat
            label="Active Tables"
            value={summary.uniqueTables}
            color="emerald"
          />
        </div>

        <div className="rounded-xl border bg-white">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No pending or preparing items
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b px-4 py-3">
                      <p className="text-xs text-slate-500">ORDER ID</p>
                      <p className="break-all text-sm font-semibold text-slate-900">
                        {order._id}
                      </p>
                      <div className="mt-1 text-xs text-slate-500">
                        Table T-{order.tableId?.tableNumber || "-"} •{" "}
                        {order.items.length} items
                      </div>
                    </div>

                    <div className="divide-y">
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Qty {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                STATUS_STYLES[item.status] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                            {item.status === "pending" && (
                              <button
                                onClick={() =>
                                  updateStatus(order._id, item._id, "preparing")
                                }
                                className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
                              >
                                Start
                              </button>
                            )}
                            {item.status === "preparing" && (
                              <button
                                onClick={() =>
                                  updateStatus(order._id, item._id, "ready")
                                }
                                className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Ready
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, color = "slate" }) => (
  <div className="rounded-xl border bg-white p-4">
    <p className={`text-xs uppercase text-${color}-500`}>{label}</p>
    <p className={`mt-1 text-2xl font-semibold text-${color}-700`}>
      {value}
    </p>
  </div>
);

export default KitchenScreen;
