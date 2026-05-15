import { useState } from "react";
import api from "../../utils/axios";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import AdminPageShell from "../../components/admin/AdminPageShell";
import Select from "../../components/ui/Select";

const REPORT_TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const Reports = () => {
  const [type, setType] = useState("daily");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    if (type === "custom" && (!from || !to)) {
      toast.error("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      let query = `/api/reports?type=${type}`;
      if (type === "custom") {
        query = `/api/reports?from=${from}&to=${to}`;
      }
      const res = await api.get(query);
      setReport(res.data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const payments = report?.payments && typeof report.payments === "object" ? report.payments : {};
  const items = report?.items && typeof report.items === "object" ? report.items : {};

  return (
    <AdminPageShell title="Reports">
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Select
            aria-label="Report period"
            value={type}
            onChange={setType}
            options={REPORT_TYPE_OPTIONS}
            className="w-full sm:w-44"
          />

          {type === "custom" && (
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          )}

          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="sm:ml-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            Generate
          </button>
        </div>
      </div>

      {loading && (
        <div className="border-b border-slate-100 px-4 py-6 sm:px-6">
          <Loader label="Loading report…" containerClassName="py-6" />
        </div>
      )}

      {report && !loading && (
        <div className="space-y-6 px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{report.totalOrders ?? 0}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Sales</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800 tabular-nums">
                ₹{Number(report.totalSales || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Payments</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {Object.keys(payments).length === 0 ? (
                <p className="text-sm text-slate-500">No payment breakdown</p>
              ) : (
                Object.entries(payments).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{k}</p>
                    <p className="mt-1 font-bold text-slate-900 tabular-nums">₹{Number(v || 0).toLocaleString("en-IN")}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Items</p>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
              {Object.keys(items).length === 0 ? (
                <p className="text-slate-500">No line items in this report</p>
              ) : (
                Object.entries(items).map(([name, data]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                  >
                    <span className="min-w-0 truncate font-medium text-slate-800">{name}</span>
                    <span className="shrink-0 tabular-nums text-slate-600">
                      {data?.quantity ?? 0} · ₹{Number(data?.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default Reports;
