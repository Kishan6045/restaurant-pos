import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import ProfileDropdown from "../../components/ProfileDropdown";
import api from "../../utils/axios";
import {
  ordersListFromResponse,
  kitchenOrderLabel,
  orderTableNumber,
  tableOrderSequence,
} from "../../helpers/ordersResponse";
import { posLineImageSrc } from "../../components/cashier/posListTheme";

const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);
const ACTIVE_ITEM_STATUSES = new Set(["pending", "preparing"]);

const Stat = ({ label, value, accent }) => (
  <div className="rounded-xl border border-slate-200/90 bg-white px-2 py-1.5 shadow-sm sm:px-2.5 sm:py-2">
    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-0.5 tabular-nums text-base font-bold leading-none sm:text-lg ${accent ?? "text-slate-900"}`}>
      {value}
    </p>
  </div>
);

const KitchenScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await api.get("/api/kitchen/orders", { params: { limit: 100 } });
      const data = ordersListFromResponse(res.data);

      const normalized = data
        .filter((order) => ACTIVE_ORDER_STATUSES.has(order.orderStatus))
        .map((order) => {
          const items = (order.items || [])
            .filter((item) => ACTIVE_ITEM_STATUSES.has(item.status))
            .map((item) => ({
              ...item,
              id: item.id ?? item._id,
              name: item.name || item.productId?.name || "Unknown",
            }));

          return {
            ...order,
            id: order.id ?? order._id,
            items,
            tableNumber:
              order.tableId?.tableNumber ??
              order.table?.tableNumber ??
              "-",
          };
        })
        .filter((order) => order.items.length > 0)
        .sort((a, b) => {
          const ta = orderTableNumber(a) ?? 0;
          const tb = orderTableNumber(b) ?? 0;
          if (ta !== tb) return ta - tb;
          const oa = tableOrderSequence(a) ?? 0;
          const ob = tableOrderSequence(b) ?? 0;
          if (oa !== ob) return oa - ob;
          const aT = new Date(a.createdAt || 0).getTime();
          const bT = new Date(b.createdAt || 0).getTime();
          return aT - bT;
        });

      setOrders(normalized);
    } catch (err) {
      console.error("Kitchen fetch error:", err);
      setError("Failed to load orders");
    } finally {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }
  };

  const updateStatus = async (orderId, itemId, nextStatus) => {
    const prevOrders = [...orders];
    setOrders((prev) =>
      prev
        .map((order) => {
          const oid = order.id ?? order._id;
          if (String(oid) !== String(orderId)) return order;
          const nextItems = order.items
            .map((item) => {
              const iid = item.id ?? item._id;
              return String(iid) === String(itemId) ? { ...item, status: nextStatus } : item;
            })
            .filter((item) => item.status !== "ready");
          return { ...order, items: nextItems };
        })
        .filter((order) => order.items.length > 0)
    );

    try {
      await api.patch(`/api/orders/${orderId}/items/${itemId}`, { status: nextStatus });
    } catch {
      setOrders(prevOrders);
      setError("Update failed");
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
    let pendingQty = 0;
    let preparingQty = 0;

    orders.forEach((order) => {
      tableSet.add(order.tableNumber);
      order.items.forEach((item) => {
        const qty = Number(item.quantity || 0);
        if (item.status === "pending") pendingQty += qty;
        else if (item.status === "preparing") preparingQty += qty;
      });
    });

    return {
      totalOrders: orders.length,
      pendingQty,
      preparingQty,
      uniqueTables: tableSet.size,
    };
  }, [orders]);

  const formatTime = (value) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-200/90">
      <header className="sticky top-0 z-20 shrink-0 border-b border-slate-200/90 bg-white shadow-sm">
        <div className="mx-auto flex h-11 max-w-[1920px] items-center justify-between gap-3 px-2 sm:h-12 sm:px-3 lg:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden h-7 w-0.5 shrink-0 rounded-full bg-indigo-600 sm:block" />
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600">RS Hotel POS</p>
              <h1 className="truncate text-sm font-bold text-slate-900">Kitchen</h1>
            </div>
          </div>
          <ProfileDropdown role="kitchen" />
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col gap-2 px-2 py-2 sm:gap-2.5 sm:px-3 sm:py-2.5 lg:px-4">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">Live tickets</h2>
            <p className="text-[11px] text-slate-500">
              Sync <span className="font-semibold text-slate-700">{formatTime(lastUpdated)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs text-rose-800">
            {error}
          </div>
        )}

        <div className="grid shrink-0 grid-cols-4 gap-1.5 sm:gap-2">
          <Stat label="Orders" value={summary.totalOrders} />
          <Stat label="Pending" value={summary.pendingQty} accent="text-slate-700" />
          <Stat label="Cooking" value={summary.preparingQty} accent="text-sky-700" />
          <Stat label="Tables" value={summary.uniqueTables} accent="text-emerald-700" />
        </div>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-100 shadow-sm">
          {orders.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-8 text-xs text-slate-500">No tickets</div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto p-1.5 sm:p-2 [scrollbar-gutter:stable]">
              <div className="grid grid-cols-2 items-start gap-1.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {orders.map((order) => {
                  const orderId = order.id ?? order._id;
                  const pendingCount = order.items.filter((i) => i.status === "pending").length;
                  const itemScroll = order.items.length > 4;
                  return (
                    <article
                      key={orderId}
                      className="flex w-full min-h-0 max-h-[calc(100dvh-7.75rem)] flex-col self-start overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"
                    >
                      <header className="flex shrink-0 flex-col gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1.5 sm:px-2">
                        <div className="flex min-w-0 items-start justify-between gap-1.5">
                          <p className="min-w-0 text-sm font-bold leading-tight text-slate-900 sm:text-base">
                            {kitchenOrderLabel(order)}
                          </p>
                          {pendingCount > 0 ? (
                            <span className="shrink-0 rounded-lg bg-indigo-600 px-1 py-0.5 text-[9px] font-bold text-white">
                              +{pendingCount}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] font-medium text-slate-500">
                          {order.items.length} item{order.items.length === 1 ? "" : "s"}
                        </p>
                      </header>

                      <ul
                        className={[
                          "min-h-0 max-h-[calc(4*3.25rem)] divide-y divide-slate-100 overscroll-y-contain bg-white text-left touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:max-h-[calc(4*3.375rem)]",
                          itemScroll ? "overflow-y-scroll" : "overflow-y-auto",
                        ].join(" ")}
                      >
                        {order.items.map((item) => {
                          const itemId = item.id ?? item._id;
                          const status = (item.status || "pending").toLowerCase();
                          const src = posLineImageSrc(item);
                          const qty = Number(item.quantity || 0);

                          return (
                            <li
                              key={itemId}
                              className="flex min-h-[3.25rem] items-center gap-1.5 px-1 py-1 sm:min-h-[3.375rem] sm:gap-2 sm:px-1.5 sm:py-1.5"
                            >
                              <img
                                src={src}
                                alt=""
                                className="h-7 w-7 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover sm:h-8 sm:w-8"
                                onError={(e) => {
                                  e.target.src = "/no-image.png";
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-slate-900 sm:text-xs">
                                  {item.name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500">×{qty}</p>
                              </div>
                              <div className="flex shrink-0 flex-col items-stretch justify-center gap-0.5">
                                {status === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => updateStatus(orderId, itemId, "preparing")}
                                    className="min-h-[26px] rounded-lg bg-indigo-600 px-1 py-0.5 text-center text-[9px] font-bold uppercase leading-tight text-white hover:bg-indigo-700 active:scale-[0.98] sm:min-h-[28px] sm:text-[10px]"
                                  >
                                    Start
                                  </button>
                                )}
                                {status === "preparing" && (
                                  <button
                                    type="button"
                                    onClick={() => updateStatus(orderId, itemId, "ready")}
                                    className="min-h-[26px] rounded-lg bg-emerald-600 px-1 py-0.5 text-center text-[9px] font-bold uppercase leading-tight text-white hover:bg-emerald-700 active:scale-[0.98] sm:min-h-[28px] sm:text-[10px]"
                                  >
                                    Ready
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default KitchenScreen;
