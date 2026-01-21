import { useEffect, useRef, useState } from "react";
import api from "../../utils/axios";

const KitchenScreen = () => {
  const [rows, setRows] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const knownIds = useRef(new Set()); // 👈 already shown items

  // ================= FETCH & MERGE =================
  const fetchAndMerge = async () => {
    setIsRefreshing(true);
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
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Kitchen live fetch error:", err);
    } finally {
      setIsRefreshing(false);
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

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const preparingCount = rows.filter((r) => r.status === "preparing").length;
  const uniqueTables = new Set(
    rows.map((r) => `${r.floor}-${r.table}`)
  ).size;

  const formatTime = (value) => {
    if (!value) return "-";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Kitchen Console
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
              Kitchen Live Orders
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Live feed of pending and preparing items from all tables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <button
              type="button"
              onClick={fetchAndMerge}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <span className="text-xs text-slate-500">
              Updated {formatTime(lastUpdated)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total Items
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {rows.length}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-500">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-orange-500">
              Preparing
            </p>
            <p className="mt-2 text-2xl font-semibold text-orange-700">
              {preparingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-500">
              Active Tables
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">
              {uniqueTables}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 sm:px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Live Queue
              </p>
              <p className="text-base font-semibold text-slate-900">
                Orders in progress
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Showing {rows.length} items
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No pending or preparing items.
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="p-4 text-left">Floor</th>
                      <th className="p-4 text-left">Table</th>
                      <th className="p-4 text-left">Item</th>
                      <th className="p-4 text-center">Qty</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.key}
                        className="border-t border-slate-100 hover:bg-slate-50/70"
                      >
                        <td className="p-4 font-semibold text-slate-700">
                          {r.floor}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            T-{r.table}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">{r.name}</td>
                        <td className="p-4 text-center font-semibold text-slate-700">
                          {r.qty}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              r.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {r.status === "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  r.orderId,
                                  r.itemId,
                                  "preparing"
                                )
                              }
                              className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                            >
                              Start Cooking
                            </button>
                          )}
                          {r.status === "preparing" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  r.orderId,
                                  r.itemId,
                                  "ready"
                                )
                              }
                              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              Mark Ready
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {rows.map((r) => (
                  <div key={r.key} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {r.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.floor} • Table {r.table}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Qty: <span className="font-semibold">{r.qty}</span>
                      </span>
                      {r.status === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(r.orderId, r.itemId, "preparing")
                          }
                          className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                        >
                          Start Cooking
                        </button>
                      )}
                      {r.status === "preparing" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(r.orderId, r.itemId, "ready")
                          }
                          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Mark Ready
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenScreen;
