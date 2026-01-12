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
  const [preset, setPreset] = useState("7d"); // default: last 7 days

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

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
    fetchOverview({ preset: "7d" });
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

  return (
    <div className="p-6 space-y-6">
      {/* ===================== HEADER / FILTERS ===================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard Overview</h2>
          <p className="text-sm text-gray-500">
            Track sales, payments, and order flow.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "3d", label: "Last 3 Days" },
              { key: "7d", label: "Last 7 Days" },
              { key: "10d", label: "Last 10 Days" },
              { key: "20d", label: "Last 20 Days" },
              { key: "30d", label: "Last 30 Days" },
              { key: "this_month", label: "This Month" },
              { key: "custom", label: "Custom" },
            ].map((p) => {
              const active = preset === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    setPreset(p.key);
                    if (p.key !== "custom") fetchOverview({ preset: p.key });
                  }}
                  className={
                    active
                      ? "px-3 py-2 rounded bg-blue-600 text-white text-sm"
                      : "px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50"
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom range */}
          {preset === "custom" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>

              <button
                onClick={() => fetchOverview({ preset: "custom" })}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===================== TOP STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={currency.format(data.totalSales || 0)} />
        <StatCard title="Total Orders" value={data.totalOrders ?? 0} />
        <StatCard title="Staff On Duty" value={data.staffOnDuty ?? 0} />
        <StatCard
          title="Occupied Tables"
          value={`${data.activeTables?.occupied ?? 0} / ${data.activeTables?.total ?? 0}`}
        />
      </div>

      {/* ===================== CHARTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentPieChart data={data.paymentSummary || {}} />

        <div className="bg-white rounded-xl shadow p-4">
          <SalesLineChart data={data.salesGraph || []} />
        </div>
      </div>

      {/* ===================== ORDER STATUS ===================== */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Order Status</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data.orderStatus || []).map((status) => (
            <div
              key={status._id}
              className="border rounded p-3 text-center"
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

      {/* ===================== TOP ITEMS ===================== */}
      {data.topItems && data.topItems.length > 0 && (
        <TopItemsTable items={data.topItems} />
      )}
    </div>
  );
};

export default Overview;
