import { useEffect, useState } from "react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";

const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);
const ACTIVE_ITEM_STATUSES = new Set(["pending", "preparing"]);
const LIVE_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  idle: "bg-slate-100 text-slate-600",
};

const LiveOrders = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMenuLive = async () => {
    setIsRefreshing(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/api/orders"),
        api.get("/api/products"),
      ]);

      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data.orders || [];
      const products = productsRes.data?.products || [];

      const nameLookup = new Map(
        products
          .filter((product) => product.name)
          .map((product) => [product.name.toLowerCase(), product._id])
      );
      const liveSummaryById = new Map();

      orders
        .filter((order) => ACTIVE_ORDER_STATUSES.has(order.orderStatus))
        .forEach((order) => {
          const tableNumber =
            order.tableId?.tableNumber ?? order.tableId ?? "Unknown";
          const tableLabel = `T${tableNumber}`;

          (order.items || []).forEach((item) => {
            if (!ACTIVE_ITEM_STATUSES.has(item.status)) return;
            const productId =
              item.productId?._id ||
              item.productId ||
              (item.name ? nameLookup.get(item.name.toLowerCase()) : null);
            if (!productId) return;

            const qty = Number(item.quantity || 0);
            if (!liveSummaryById.has(productId)) {
              liveSummaryById.set(productId, {
                totalQty: 0,
                tables: new Map(),
              });
            }

            const summary = liveSummaryById.get(productId);
            summary.totalQty += qty;
            summary.tables.set(
              tableLabel,
              (summary.tables.get(tableLabel) || 0) + qty
            );
          });
        });

      const sortedMenu = [...products].sort((a, b) => {
        const categoryA = a.category?.name || "";
        const categoryB = b.category?.name || "";
        if (categoryA !== categoryB) {
          return categoryA.localeCompare(categoryB);
        }
        return (a.name || "").localeCompare(b.name || "");
      });

      const rows = sortedMenu.map((product) => {
        const summary = liveSummaryById.get(product._id) || {
          totalQty: 0,
          tables: new Map(),
        };
        const tableBreakdown = Array.from(summary.tables.entries())
          .map(([table, qty]) => ({
            table,
            qty,
          }))
          .sort((a, b) => a.table.localeCompare(b.table, undefined, {
            numeric: true,
          }));

        return {
          ...product,
          liveQty: summary.totalQty,
          tableBreakdown,
        };
      });

      setMenuItems(rows);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Admin live menu error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenuLive();
    const t = setInterval(fetchMenuLive, 5000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (value) => {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <Loader label="Loading menu..." containerClassName="p-6" />;
  }
  if (menuItems.length === 0) {
    return <div className="p-6">No menu items found</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Live Menu</h1>
          <p className="text-xs text-gray-500">
            All menu items with live order quantities.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Updated {formatTime(lastUpdated)}</span>
          <button
            onClick={fetchMenuLive}
            disabled={isRefreshing}
            className="rounded border px-3 py-1 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {menuItems.map((item) => {
          const isActive = (item.liveQty || 0) > 0;
          return (
            <div
              key={item._id}
              className={`rounded-xl border bg-white p-4 ${
                isActive ? "border-emerald-200 bg-emerald-50/40" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.category?.name || "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-emerald-600">🔥</span>
                  <span>{item.liveQty || 0} orders</span>
                </div>
              </div>

              {isActive ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  {item.tableBreakdown.map((entry) => (
                    <li key={`${item._id}-${entry.table}`}>
                      - {entry.table} ({entry.qty})
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      LIVE_BADGE.idle
                    }`}
                  >
                    No live orders yet
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveOrders;
