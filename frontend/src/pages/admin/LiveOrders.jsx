import { useEffect, useState } from "react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";

const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);
const ACTIVE_ITEM_STATUSES = new Set(["pending", "preparing"]);

const LiveOrders = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMenuLive = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/api/orders"),
        api.get("/api/products"),
      ]);

      const orders = ordersRes.data.orders || ordersRes.data || [];
      const products = productsRes.data.products || [];

      // productId -> live summary
      const liveMap = new Map();

      orders
        .filter((o) => ACTIVE_ORDER_STATUSES.has(o.orderStatus))
        .forEach((order) => {
          const table = `T${order.tableId?.tableNumber || "?"}`;

          order.items?.forEach((item) => {
            if (!ACTIVE_ITEM_STATUSES.has(item.status)) return;

            const productId = item.productId?._id || item.productId;
            if (!productId) return;

            if (!liveMap.has(productId)) {
              liveMap.set(productId, {
                totalQty: 0,
                tables: new Map(),
              });
            }

            const summary = liveMap.get(productId);
            summary.totalQty += item.quantity;
            summary.tables.set(
              table,
              (summary.tables.get(table) || 0) + item.quantity
            );
          });
        });

      const rows = products.map((product) => {
        const summary = liveMap.get(product._id) || {
          totalQty: 0,
          tables: new Map(),
        };

        return {
          ...product,
          liveQty: summary.totalQty,
          tableBreakdown: [...summary.tables.entries()].map(
            ([table, qty]) => ({ table, qty })
          ),
        };
      });

      setMenuItems(rows);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Live menu error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuLive();
    const t = setInterval(fetchMenuLive, 5000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return <Loader label="Loading live menu..." containerClassName="p-6" />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">🍳 Live Kitchen Menu</h1>

      {menuItems.map((item) => {
        const active = item.liveQty > 0;

        return (
          <div
            key={item._id}
            className={`rounded-xl border p-4 ${
              active ? "bg-emerald-50 border-emerald-200" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.category?.name || "-"}
                </p>
              </div>
              <div className="font-bold text-sm">
                🔥 {item.liveQty} orders
              </div>
            </div>

            {active && (
              <ul className="mt-2 text-sm text-gray-700">
                {item.tableBreakdown.map((t) => (
                  <li key={`${item._id}-${t.table}`}>
                    - {t.table} ({t.qty})
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LiveOrders;
