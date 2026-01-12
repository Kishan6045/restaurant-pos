import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";

// Dashboard components
import StatCard from "../../components/dashboardcharts/StatCard.jsx";
import PaymentPieChart from "../../components/dashboardcharts/PaymentPieChart.jsx";
import SalesLineChart from "../../components/dashboardcharts/SalesLineChart.jsx";
import TopItemsTable from "../../components/dashboardcharts/TopItemsTable.jsx";

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
    { value: "30d", label: "Last 1 month" },
    { value: "custom", label: "Custom date" },
  ];

  // 🔄 Load dashboard data
  const fetchOverview = async (opts = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      const nextPreset = opts.preset ?? preset;
      const fromDate = opts.from ?? from;
      const toDate = opts.to ?? to;

      if (nextPreset && nextPreset !== "custom") {
        params.preset = nextPreset;
      } else {
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
      }

      const res = await api.get("/api/admin/overview", { params });

      setData(res.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);

      // 🔴 Proper error message
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

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  // ❌ ERROR
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

  // ❌ NO DATA
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
    rangeFrom && rangeTo
      ? `${formatDay(rangeFrom)} → ${formatDay(rangeTo)}`
      : "";

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
      amber: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[tone] || map.gray}`}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-120px)]">
      {/* ===================== HEADER / FILTERS ===================== */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Dashboard Overview
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-sm text-gray-500">Sales, payments, and order flow.</p>
            {rangeLabel && (
              <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                Showing: {rangeLabel}
              </span>
            )}
          </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              Range
            </label>
            <select
              value={preset}
              onChange={(e) => {
                const next = e.target.value;
                setPreset(next);
                if (next !== "custom") {
                  // keep custom inputs for later, but fetch immediately
                  fetchOverview({ preset: next });
                }
              }}
              className="h-10 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {presetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom range */}
          {preset === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-10 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-10 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => fetchOverview({ preset: "custom" })}
                className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          )}

          <button
            onClick={() => fetchOverview()}
            className="h-10 px-4 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
            title="Refresh"
          >
            Refresh
          </button>
          </div>
        </div>
      </div>

      {/* ===================== TOP STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={currency.format(data.totalSales || 0)} />
        <StatCard title="Total Orders" value={data.totalOrders ?? 0} />
        <StatCard title="Staff On Duty" value={data.staffOnDuty ?? 0} />
        <StatCard
          title="Tables (Occupied / Total)"
          value={`${data.tablesSummary?.occupied ?? 0} / ${data.tablesSummary?.total ?? 0}`}
        />
      </div>

      {/* ===================== SECONDARY STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Tables"
          value={data.tablesSummary?.available ?? 0}
        />
        <StatCard
          title="Paid Orders"
          value={data.ordersSummary?.paid ?? 0}
        />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentPieChart data={data.paymentSummary || {}} />

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <SalesLineChart data={data.salesGraph || []} />
        </div>
      </div>

      {/* ===================== TABLES OVERVIEW ===================== */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Tables</h3>
            <p className="text-xs text-gray-500">
              Total: {data.tablesSummary?.total ?? 0} • Occupied:{" "}
              {data.tablesSummary?.occupied ?? 0} • Available:{" "}
              {data.tablesSummary?.available ?? 0}
            </p>
          </div>
          <div className="flex gap-2">
            {badge("Occupied", "red")}
            {badge("Available", "green")}
          </div>
        </div>

        {(data.tables || []).length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            No tables found
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(data.tablesByFloor || {}).map(([floor, s]) => (
                <div key={floor} className="rounded-xl border bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{floor}</p>
                    <p className="text-xs text-gray-500">{s.total} tables</p>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    {badge(`Occupied: ${s.occupied}`, "red")}
                    {badge(`Available: ${s.available}`, "green")}
                  </div>
                </div>
              ))}
            </div>

            {/* Scrollable tables list (handles lots of tables) */}
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <div className="space-y-4">
                {Object.entries(groupedTables).map(([floor, list]) => (
                  <div key={floor}>
                    <div className="sticky top-0 z-10 bg-white pb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {floor}
                        </p>
                        <p className="text-xs text-gray-500">
                          {list.length} tables
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                      {list.map((t) => (
                        <div
                          key={t._id}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium flex items-center justify-between ${
                            t.status === "occupied"
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
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Order Status</h3>
          <span className="text-xs text-gray-500">
            {(data.orderStatus || []).reduce((sum, s) => sum + (s.count || 0), 0)} total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data.orderStatus || []).map((status) => (
            <div
              key={status._id}
              className="border rounded-xl p-3 text-center bg-gray-50"
            >
              <p className="text-sm text-gray-500 capitalize">
                {status._id}
              </p>
              <p className="text-xl font-bold">
                {status.count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== RECENT ORDERS ===================== */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center justify-between mb-3">
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
            <div className="max-h-[420px] overflow-y-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b text-gray-600">
                    <th className="py-3 px-3 rounded-tl-xl">Time</th>
                    <th className="py-3 px-3">Table</th>
                    <th className="py-3 px-3">Order</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3 text-right">Items</th>
                    <th className="py-3 px-3 text-right rounded-tr-xl">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentOrders || []).map((o) => (
                    <tr
                      key={o._id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-3 text-gray-700 tabular-nums whitespace-nowrap">
                        {formatTime(o.createdAt)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
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
                      <td className="py-3 px-3 whitespace-nowrap">
                        {badge(
                          (o.orderStatus || "—").toUpperCase(),
                          o.orderStatus === "open"
                            ? "blue"
                            : o.orderStatus === "billed"
                              ? "amber"
                              : "green"
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
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
                      <td className="py-3 px-3 text-right tabular-nums font-medium whitespace-nowrap">
                        {o.itemsCount ?? 0}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-gray-900 whitespace-nowrap">
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
      {data.topItems && data.topItems.length > 0 && (
        <TopItemsTable items={data.topItems} />
      )}
    </div>
  );
};

export default Overview;
