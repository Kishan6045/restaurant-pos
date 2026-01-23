import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";

const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);
const ACTIVE_ITEM_STATUSES = new Set(["pending", "preparing"]);
const STAT_TONES = {
  slate: {
    label: "text-slate-500",
    value: "text-slate-900",
  },
  emerald: {
    label: "text-emerald-500",
    value: "text-emerald-700",
  },
  amber: {
    label: "text-amber-500",
    value: "text-amber-700",
  },
};
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
      const liveQtyById = new Map();

      orders
        .filter((order) => ACTIVE_ORDER_STATUSES.has(order.orderStatus))
        .forEach((order) => {
          (order.items || []).forEach((item) => {
            if (!ACTIVE_ITEM_STATUSES.has(item.status)) return;
            const productId =
              item.productId?._id ||
              item.productId ||
              (item.name ? nameLookup.get(item.name.toLowerCase()) : null);
            if (!productId) return;
            const qty = Number(item.quantity || 0);
            liveQtyById.set(productId, (liveQtyById.get(productId) || 0) + qty);
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

      const rows = sortedMenu.map((product) => ({
        ...product,
        liveQty: liveQtyById.get(product._id) || 0,
      }));

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

  const totalLiveQty = useMemo(
    () => menuItems.reduce((sum, item) => sum + (item.liveQty || 0), 0),
    [menuItems]
  );

  const activeItemCount = useMemo(
    () => menuItems.filter((item) => (item.liveQty || 0) > 0).length,
    [menuItems]
  );

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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Menu items" value={menuItems.length} tone="slate" />
        <Stat label="Items ordered" value={activeItemCount} tone="emerald" />
        <Stat label="Live quantity" value={totalLiveQty} tone="amber" />
        <Stat
          label="Idle items"
          value={menuItems.length - activeItemCount}
          tone="slate"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Live qty</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => {
              const isActive = (item.liveQty || 0) > 0;
              return (
                <tr
                  key={item._id}
                  className={`border-t ${isActive ? "bg-emerald-50/40" : ""}`}
                >
                  <td className="p-3 font-medium text-slate-800">
                    {item.name}
                  </td>
                  <td className="p-3 text-slate-500">
                    {item.category?.name || "-"}
                  </td>
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {item.liveQty || 0}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive ? LIVE_BADGE.active : LIVE_BADGE.idle
                      }`}
                    >
                      {isActive ? "ORDERED" : "IDLE"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat = ({ label, value, tone }) => {
  const style = STAT_TONES[tone] || STAT_TONES.slate;
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className={`text-xs uppercase ${style.label}`}>{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${style.value}`}>{value}</p>
    </div>
  );
};

export default LiveOrders;
