import { useEffect, useMemo, useState } from "react";
import { ChefHat, Clock } from "lucide-react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";
import PaginationBar from "../../components/PaginationBar";
import { ordersListFromResponse } from "../../helpers/ordersResponse";
import { docId } from "../../helpers/docId";
import AdminPageShell from "../../components/admin/AdminPageShell";

const ACTIVE_ORDER_STATUSES = new Set(["open", "billed"]);
const ACTIVE_ITEM_STATUSES = new Set(["pending", "preparing"]);
const PAGE_SIZE = 8;

const LiveOrders = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page, setPage] = useState(1);

  const fetchMenuLive = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/api/orders", { params: { limit: 500 } }),
        api.get("/api/products", { params: { limit: 500 } }),
      ]);

      const orders = ordersListFromResponse(ordersRes.data);
      const products = productsRes.data?.products || [];

      const liveMap = new Map();

      orders
        .filter((o) => ACTIVE_ORDER_STATUSES.has(o.orderStatus))
        .forEach((order) => {
          const table = `T${order.tableId?.tableNumber || "?"}`;

          order.items?.forEach((item) => {
            if (!ACTIVE_ITEM_STATUSES.has(item.status)) return;

            const productIdRaw =
              item.productId?._id ?? item.productId?.id ?? item.productId;
            if (!productIdRaw) return;
            const productId = String(productIdRaw);

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
        const pid = String(product._id ?? product.id ?? "");
        const summary = (pid && liveMap.get(pid)) || {
          totalQty: 0,
          tables: new Map(),
        };

        return {
          ...product,
          liveQty: summary.totalQty,
          tableBreakdown: [...summary.tables.entries()].map(
            ([tbl, qty]) => ({ table: tbl, qty })
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

  const sortedMenuItems = useMemo(() => {
    return [...menuItems].sort((a, b) => {
      const liveA = a.liveQty > 0 ? 0 : 1;
      const liveB = b.liveQty > 0 ? 0 : 1;
      if (liveA !== liveB) return liveA - liveB;
      return String(a.name || "").localeCompare(String(b.name || ""), undefined, {
        sensitivity: "base",
      });
    });
  }, [menuItems]);

  const total = sortedMenuItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedMenuItems.slice(start, start + PAGE_SIZE);
  }, [sortedMenuItems, page]);

  const formatTime = (d) => {
    if (!d) return "—";
    const x = d instanceof Date ? d : new Date(d);
    return x.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const liveCount = useMemo(
    () => sortedMenuItems.filter((i) => i.liveQty > 0).length,
    [sortedMenuItems]
  );

  if (loading) {
    return (
      <AdminPageShell title="Live kitchen load">
        <Loader label="Loading live menu…" containerClassName="py-20" />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Live kitchen load">
      <div className="flex flex-col">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/95 via-white to-stone-50/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
              <ChefHat className="h-5 w-5 text-indigo-600" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Kitchen queue by menu item</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Open & billed orders only · Items in <span className="font-medium text-slate-600">pending</span> or{" "}
                <span className="font-medium text-slate-600">preparing</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 font-medium shadow-sm">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Updated {formatTime(lastUpdated)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 font-semibold text-emerald-800">
              {liveCount} with live tickets
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 py-16 text-center">
              <ChefHat className="mb-3 h-10 w-10 text-slate-300" aria-hidden />
              <p className="text-sm font-semibold text-slate-700">No menu products</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Add products in Admin → Products to see live load here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((item) => {
                const active = item.liveQty > 0;
                const id = docId(item);

                return (
                  <article
                    key={id}
                    className={[
                      "group flex flex-col rounded-2xl border p-4 shadow-sm transition",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      active
                        ? "border-emerald-200/90 bg-gradient-to-br from-white via-emerald-50/25 to-white ring-1 ring-emerald-100/80"
                        : "border-slate-200/90 bg-white ring-1 ring-slate-900/[0.03] hover:border-slate-300",
                    ].join(" ")}
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
                        {item.name}
                      </h3>
                      <p className="mt-2 inline-flex max-w-full truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/60">
                        {item.category?.name || "Uncategorised"}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Live qty</span>
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                            active ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {item.liveQty}
                        </span>
                      </div>
                      {active && item.tableBreakdown.length > 0 ? (
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                          {item.tableBreakdown.map((t) => (
                            <li
                              key={`${id}-${t.table}`}
                              className="rounded-lg border border-slate-200/90 bg-slate-50/90 px-2 py-1 text-[11px] font-medium text-slate-700"
                            >
                              <span className="tabular-nums text-slate-900">{t.table}</span>
                              <span className="mx-1 text-slate-300">·</span>
                              <span className="tabular-nums">{t.qty} qty</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-[11px] text-slate-400">No active tickets</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {total > 0 ? (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            loading={false}
          />
        ) : null}
      </div>
    </AdminPageShell>
  );
};

export default LiveOrders;
