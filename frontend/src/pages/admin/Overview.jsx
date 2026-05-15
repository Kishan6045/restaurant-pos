import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";


// Dashboard components
import StatCard from "../../components/dashboardcharts/StatCard.jsx";
import PaymentPieChart from "../../components/dashboardcharts/PaymentPieChart.jsx";
import SalesLineChart from "../../components/dashboardcharts/SalesLineChart.jsx";
import TopItemsTable from "../../components/dashboardcharts/TopItemsTable.jsx";
import Select from "../../components/ui/Select.jsx";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preset, setPreset] = useState("today"); // default: today

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  // ✅ MUST be above any early return (Rules of Hooks)
  const groupedTables = useMemo(() => {
    const list = data?.tables || [];
    const grouped = {};
    for (const t of list) {
      const floor = t?.floor || "Ground";
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(t);
    }
    const floors = Object.keys(grouped);
    floors.sort((a, b) => {
      if (a === "Ground") return -1;
      if (b === "Ground") return 1;
      return a.localeCompare(b);
    });
    const ordered = {};
    for (const f of floors) {
      ordered[f] = grouped[f]
        .slice()
        .sort((x, y) => (x.tableNumber || 0) - (y.tableNumber || 0));
    }
    return ordered;
  }, [data]);

  const formatDay = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const presetOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "custom", label: "Custom" },
  ];

  // 🔄 Load dashboard data
  const fetchOverview = async (opts = {}) => {
    try {
      setLoading(true);
      setError("");

      const nextPreset = opts.preset ?? preset;
      const params = {};
      if (nextPreset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      } else {
        params.preset = nextPreset;
      }

      const res = await api.get("/api/admin/overview", { params });

      setData(res.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);

      if (err.response) {
        setError(err.response.data?.message || "API Error");
      } else {
        setError("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview({ preset: "today" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Loader
        label="Loading dashboard..."
        containerClassName="h-[60vh] text-gray-400"
      />
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-red-500">
        <p className="mb-2 font-semibold">Failed to load dashboard</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => fetchOverview()}
          className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-red-500">
        No dashboard data
      </div>
    );
  }

  const rangeFrom = data?.range?.from;
  const rangeTo = data?.range?.to;
  const rangeLabel =
    rangeFrom && rangeTo ? `${formatDay(rangeFrom)} → ${formatDay(rangeTo)}` : "";

  const formatTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const badge = (text, tone = "gray") => {
    const map = {
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[tone] || map.gray
          }`}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 sm:space-y-6 bg-gray-50 min-h-[calc(100vh-120px)]">
      {/* ===================== HEADER / FILTERS ===================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Dashboard Overview
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <p className="text-sm text-gray-500">Sales, payments, and order flow.</p>
              {rangeLabel && (
                <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Showing: {rangeLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
            <div className="flex items-start sm:items-end justify-start sm:justify-end w-full">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-medium text-gray-500">Range</label>
                <Select
                  aria-label="Date range"
                  value={preset}
                  onChange={(next) => {
                    setPreset(next);
                    if (next !== "custom") fetchOverview({ preset: next });
                  }}
                  options={presetOptions}
                  className="w-full sm:w-auto"
                  buttonClassName="h-10 min-h-0 py-2 sm:min-w-[180px]"
                />
              </div>
            </div>

            {preset === "custom" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end w-full">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-10 w-full sm:w-auto sm:min-w-[170px] rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-10 w-full sm:w-auto sm:min-w-[170px] rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => fetchOverview({ preset: "custom" })}
                  className="h-10 w-full sm:w-auto px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== TOP STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Sales" value={currency.format(data.totalSales || 0)} />
        <StatCard title="Total Orders" value={data.totalOrders ?? 0} />
        <StatCard title="Staff On Duty" value={data.staffOnDuty ?? 0} />
        <StatCard
          title="Tables (Occupied / Total)"
          value={`${data.tableSummary?.occupied ?? 0} / ${data.tableSummary?.total ?? 0}`}
        />
      </div>

      {/* ===================== SECONDARY STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Available Tables" value={data.tableSummary?.available ?? 0} />
        <StatCard title="Paid Orders" value={data.ordersSummary?.paid ?? 0} />
        <StatCard
          title="Active Products"
          value={`${data.menuSummary?.products?.active ?? 0} / ${data.menuSummary?.products?.total ?? 0}`}
        />
        <StatCard
          title="Active Categories"
          value={`${data.menuSummary?.categories?.active ?? 0} / ${data.menuSummary?.categories?.total ?? 0}`}
        />
      </div>

      {/* ===================== CHARTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PaymentPieChart data={data.paymentSummary || {}} />

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-5">
          <SalesLineChart data={data.salesGraph || []} />
        </div>
      </div>

      {/* ===================== TABLES OVERVIEW ===================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Tables</h3>
            <p className="text-xs text-gray-500">
              Total: {data.tableSummary?.total ?? 0} • Occupied:{" "}
              {data.tableSummary?.occupied ?? 0} • Available:{" "}
              {data.tableSummary?.available ?? 0}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {badge("Occupied", "red")}
            {badge("Available", "green")}
          </div>
        </div>

        {(data.tables || []).length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">No tables found</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Object.entries(data.tablesByFloor || {}).map(([floor, s]) => (
                <div key={floor} className="rounded-xl border bg-gray-50 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{floor}</p>
                    <p className="text-xs text-gray-500">{s.total} tables</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {badge(`Occupied: ${s.occupied}`, "red")}
                    {badge(`Available: ${s.available}`, "green")}
                  </div>
                </div>
              ))}
            </div>

            <div className="max-h-[360px] sm:max-h-[420px] overflow-y-auto pr-1 sm:pr-2">
              <div className="space-y-4">
                {Object.entries(groupedTables).map(([floor, list]) => (
                  <div key={floor}>
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur pb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{floor}</p>
                        <p className="text-xs text-gray-500">{list.length} tables</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                      {list.map((t) => (
                        <div
                          key={t._id ?? t.id}
                          className={`rounded-xl border px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium flex items-center justify-between ${t.status === "occupied"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-green-50 border-green-200 text-green-800"
                            }`}
                          title={`${floor} • Table ${t.tableNumber}`}
                        >
                          <span className="tabular-nums">T{t.tableNumber}</span>
                          <span className="text-[10px] uppercase tracking-wide opacity-80">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== ORDER STATUS ===================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-gray-900">Order Status</h3>
          <span className="text-xs text-gray-500">
            {(data.orderStatus || []).reduce((sum, s) => sum + (s.count || 0), 0)} total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {(data.orderStatus || []).map((status) => (
            <div key={status._id ?? status.id} className="border rounded-xl p-3 sm:p-4 text-center bg-gray-50">
              <p className="text-xs sm:text-sm text-gray-500 capitalize">{status._id ?? status.id}</p>
              <p className="text-xl font-bold">{status.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== RECENT ORDERS ===================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <span className="text-xs text-gray-500">
            {(data.recentOrders || []).length} latest
          </span>
        </div>

        {(data.recentOrders || []).length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            No orders in selected range
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[360px] sm:max-h-[420px] overflow-y-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
                  <tr className="border-b text-gray-600">
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-tl-xl">Time</th>
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3">Table</th>
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3">Order</th>
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3">Payment</th>
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right">Items</th>
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right rounded-tr-xl">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentOrders || []).map((o) => (
                    <tr
                      key={o._id ?? o.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-gray-700 tabular-nums whitespace-nowrap">
                        {formatTime(o.createdAt)}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">
                        {o.table ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              T{o.table.tableNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              {o.table.floor || "Ground"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">
                        {badge(
                          (o.orderStatus || "—").toUpperCase(),
                          o.orderStatus === "open"
                            ? "blue"
                            : o.orderStatus === "billed"
                              ? "indigo"
                              : "green"
                        )}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {badge(
                            (o.paymentStatus || "—").toUpperCase(),
                            o.paymentStatus === "paid" ? "green" : "red"
                          )}
                          {o.paymentMethod ? (
                            <span className="text-xs text-gray-500 uppercase">
                              {o.paymentMethod}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right tabular-nums font-medium whitespace-nowrap">
                        {o.itemsCount ?? 0}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right tabular-nums font-semibold text-gray-900 whitespace-nowrap">
                        {currency.format(o.totalAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===================== TOP ITEMS ===================== */}
      {data.topItems && data.topItems.length > 0 && <TopItemsTable items={data.topItems} />}
    </div>
  );
};

export default Overview;