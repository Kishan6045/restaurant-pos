import { useEffect, useState } from "react";
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

  // 🔄 Load dashboard data
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("api/admin/overview");

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
    fetchOverview();
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

      {/* ===================== TOP STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={`₹${data.totalSales}`} />
        <StatCard title="Total Orders" value={data.totalOrders} />
        <StatCard title="Staff On Duty" value={data.staffOnDuty} />
        <StatCard
          title="Occupied Tables"
          value={`${data.activeTables.occupied} / ${data.activeTables.total}`}
        />
      </div>

      {/* ===================== CHARTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentPieChart data={data.paymentSummary} />

        <div className="bg-white rounded-xl shadow p-4">
          <SalesLineChart data={data.salesGraph} />
        </div>
      </div>

      {/* ===================== ORDER STATUS ===================== */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Order Status</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.orderStatus.map(status => (
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
