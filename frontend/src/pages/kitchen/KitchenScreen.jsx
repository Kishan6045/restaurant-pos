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
  const [menuItems, setMenuItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ================= FETCH & MERGE =================
  const fetchAndMerge = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get("/api/kitchen/orders");

      const orders = Array.isArray(res.data)
        ? res.data
        : res.data.orders || [];

      const itemMap = new Map();

      orders
        .filter((order) => ACTIVE_ORDER_STATUSES.has(order.orderStatus))
        .forEach((order) => {
          const tableLabel = `T${order.tableId?.tableNumber || "-"}`;

          order.items?.forEach((item) => {
            if (!ACTIVE_ITEM_STATUSES.has(item.status)) return;

            const productKey =
              item.productId?._id || item.productId || item.name || item._id;
            const productName =
              item.productId?.name || item.name || "Unknown item";

            if (!productKey) return;

            if (!itemMap.has(productKey)) {
              itemMap.set(productKey, {
                key: productKey,
                name: productName,
                totalQty: 0,
                tables: new Map(),
              });
            }

            const group = itemMap.get(productKey);
            const qty = Number(item.quantity || 0);
            group.totalQty += qty;

            if (!group.tables.has(tableLabel)) {
              group.tables.set(tableLabel, {
                key: `${productKey}-${tableLabel}`,
                productKey,
                table: tableLabel,
                qty: 0,
                status: item.status,
                items: [],
              });
            }

            const tableEntry = group.tables.get(tableLabel);
            tableEntry.qty += qty;
            tableEntry.status = item.status;
            tableEntry.items.push({
              orderId: order._id,
              itemId: item._id,
              status: item.status,
            });
          });
        });

      const groupedItems = Array.from(itemMap.values())
        .map((group) => ({
          ...group,
          tableBreakdown: Array.from(group.tables.values()).sort((a, b) =>
            a.table.localeCompare(b.table, undefined, { numeric: true })
          ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setMenuItems(groupedItems);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Kitchen live fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (entry, nextStatus) => {
    setMenuItems((prev) =>
      prev
        .map((group) => {
          if (group.key !== entry.productKey) return group;
          const nextTables = group.tableBreakdown
            .map((table) =>
              table.key === entry.key
                ? { ...table, status: nextStatus }
                : table
            )
            .filter((table) => table.status !== "ready");

          const totalQty = nextTables.reduce(
            (sum, table) => sum + (table.qty || 0),
            0
          );

          return {
            ...group,
            tableBreakdown: nextTables,
            totalQty,
          };
        })
        .filter((group) => group.tableBreakdown.length > 0)
    );

    try {
      await Promise.all(
        (entry.items || []).map((itemRef) =>
          api.patch(`/api/orders/${itemRef.orderId}/items/${itemRef.itemId}`, {
            status: nextStatus,
          })
        )
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

  const summary = useMemo(() => {
    const tableSet = new Set();
    let totalQty = 0;
    let pendingQty = 0;
    let preparingQty = 0;

    menuItems.forEach((item) => {
      totalQty += item.totalQty || 0;
      item.tableBreakdown.forEach((table) => {
        tableSet.add(table.table);
        if (table.status === "pending") {
          pendingQty += table.qty || 0;
        } else if (table.status === "preparing") {
          preparingQty += table.qty || 0;
        }
      });
    });

    return {
      totalQty,
      pendingQty,
      preparingQty,
      uniqueTables: tableSet.size,
    };
  }, [menuItems]);

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
          <Stat label="Total Items" value={summary.totalQty} />
          <Stat label="Pending" value={summary.pendingQty} color="amber" />
          <Stat label="Preparing" value={summary.preparingQty} color="orange" />
          <Stat label="Active Tables" value={summary.uniqueTables} color="emerald" />
        </div>

        {/* ================= MENU VIEW ================= */}
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <p className="text-sm font-semibold">Live Kitchen Menu</p>
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

          {menuItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No pending or preparing items
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <div className="text-xs font-semibold text-slate-900">
                        🔥 {item.totalQty}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-700">
                      {item.tableBreakdown.map((table) => (
                        <div
                          key={table.key}
                          className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1"
                        >
                          <span>
                            {table.table} ({table.qty})
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              STATUS_STYLES[table.status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {table.status.toUpperCase()}
                          </span>
                          {table.status === "pending" && (
                            <button
                              onClick={() => updateStatus(table, "preparing")}
                              className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-orange-600"
                            >
                              Start
                            </button>
                          )}
                          {table.status === "preparing" && (
                            <button
                              onClick={() => updateStatus(table, "ready")}
                              className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
                            >
                              Ready
                            </button>
                          )}
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
