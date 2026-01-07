import { useState } from "react";
import api from "../../utils/axios";

const Reports = () => {
  const [type, setType] = useState("daily");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    setReport(null);

    try {
      let query = `/api/reports?type=${type}`;

      if (type === "custom") {
        if (!from || !to) return alert("Select date range");
        query = `/api/reports?from=${from}&to=${to}`;
      }
      const res = await api.get(query);
      setReport(res.data);
    } catch {
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="max-w-5xl mx-auto p-3 space-y-3">

        {/* HEADER */}
        <h2 className="text-lg font-semibold">Reports</h2>
        {/* FILTER */}
        <div className="bg-white p-2 rounded-md shadow-sm">
          <div className="flex items-center gap-2">

            {/* TYPE */}
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="border rounded px-2 py-1 text-xs w-28"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>

            {/* CUSTOM DATE */}
            {type === "custom" && (
              <>
                <input
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="border rounded px-2 py-1 text-xs w-32"
                />
                <input
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="border rounded px-2 py-1 text-xs w-32"
                />
              </>
            )}

            {/* BUTTON */}
            <button
              onClick={loadReport}
              className="ml-auto bg-black text-white px-3 py-1 rounded text-xs"
            >
              Generate
            </button>

          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white p-3 rounded shadow-sm text-sm text-center">
            Loading...
          </div>
        )}

        {/* RESULT */}
        {report && !loading && (
          <div className="bg-white p-3 rounded-lg shadow-sm space-y-3">

            {/* SUMMARY */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-500">Orders</p>
                <p className="font-semibold">{report.totalOrders}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-500">Sales</p>
                <p className="font-semibold text-green-600">
                  ₹{report.totalSales}
                </p>
              </div>
            </div>

            {/* PAYMENTS */}
            <div>
              <p className="text-sm font-medium mb-1">Payments</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(report.payments).map(([k, v]) => (
                  <div key={k} className="bg-gray-100 p-2 rounded text-center">
                    <p className="uppercase text-gray-500">{k}</p>
                    <p className="font-semibold">₹{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ITEMS (SCROLLABLE) */}
            <div>
              <p className="text-sm font-medium mb-1">Items</p>

              <div className="max-h-[220px] overflow-y-auto space-y-1 text-sm pr-1">
                {Object.entries(report.items).map(([name, data]) => (
                  <div
                    key={name}
                    className="flex justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="truncate">{name}</span>
                    <span className="text-gray-600">
                      {data.quantity} | ₹{data.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;