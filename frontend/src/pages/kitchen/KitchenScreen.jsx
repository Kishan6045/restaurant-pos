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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("qty");
  const [showOnlyActive, setShowOnlyActive] = useState(true);

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
                pendingQty: 0,
                preparingQty: 0,
                tables: new Map(),
              });
            }

            const group = itemMap.get(productKey);
            const qty = Number(item.quantity || 0);
            group.totalQty += qty;
            if (item.status === "pending") {
              group.pendingQty += qty;
            } else if (item.status === "preparing") {
              group.preparingQty += qty;
            }

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
          const pendingQty = nextTables.reduce(
            (sum, table) =>
              table.status === "pending" ? sum + (table.qty || 0) : sum,
            0
          );
          const preparingQty = nextTables.reduce(
            (sum, table) =>
              table.status === "preparing" ? sum + (table.qty || 0) : sum,
            0
          );

          return {
            ...group,
            tableBreakdown: nextTables,
            totalQty,
            pendingQty,
            preparingQty,
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

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let list = menuItems;

    if (showOnlyActive) {
      list = list.filter((item) => item.totalQty > 0);
    }

    if (normalizedSearch) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(normalizedSearch)
      );
    }

    const sorted = [...list];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => (b.totalQty || 0) - (a.totalQty || 0));
    }

    return sorted;
  }, [menuItems, search, showOnlyActive, sortBy]);

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

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Overview</p>
                <span className="text-xs text-slate-500">
                  Updated {formatTime(lastUpdated)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Total Items" value={summary.totalQty} />
                <Stat label="Pending" value={summary.pendingQty} color="amber" />
                <Stat
                  label="Preparing"
                  value={summary.preparingQty}
                  color="orange"
                />
                <Stat
                  label="Active Tables"
                  value={summary.uniqueTables}
                  color="emerald"
                />
              </div>
              <button
                onClick={fetchAndMerge}
                disabled={isRefreshing}
                className="mt-4 w-full rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-slate-700">Filters</p>
              <div>
                <label className="text-xs text-slate-500">Search menu</label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search items"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOnlyActive}
                    onChange={(event) =>
                      setShowOnlyActive(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Only active
                </label>
                <span>{filteredItems.length} items</span>
              </div>
              <div>
                <label className="text-xs text-slate-500">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                >
                  <option value="qty">Most orders</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Kitchen Command Center
              </h3>
              <p className="text-xs text-slate-500">
                Menu-wise workflow with table actions for pending and preparing
                items.
              </p>
            </div>

            <div className="rounded-xl border bg-white overflow-hidden">
              {menuItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No pending or preparing items
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto p-4">
                  {filteredItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                      No items match the current filters.
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                      {filteredItems.map((item) => (
                        <div
                          key={item.key}
                          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.tableBreakdown.length} tables •{" "}
                                {item.totalQty} qty
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Orders</p>
                              <p className="text-lg font-semibold text-slate-900">
                                {item.totalQty}
                              </p>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                                Pending {item.pendingQty}
                              </span>
                              <span className="rounded-full bg-orange-50 px-2 py-1 font-semibold text-orange-700">
                                Preparing {item.preparingQty}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {item.tableBreakdown.map((table) => (
                                <div
                                  key={table.key}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">
                                      {table.table}
                                    </span>
                                    <span className="text-slate-500">
                                      Qty {table.qty}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                        STATUS_STYLES[table.status] ||
                                        "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {table.status.toUpperCase()}
                                    </span>
                                    {table.status === "pending" && (
                                      <button
                                        onClick={() =>
                                          updateStatus(table, "preparing")
                                        }
                                        className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-orange-600"
                                      >
                                        Start
                                      </button>
                                    )}
                                    {table.status === "preparing" && (
                                      <button
                                        onClick={() =>
                                          updateStatus(table, "ready")
                                        }
                                        className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
                                      >
                                        Ready
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
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
