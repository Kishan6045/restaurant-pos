import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

const FLOORS = ["All", "Ground", "First", "Second"];

const CashierTables = () => {
  const [tables, setTables] = useState([]);
  const [floor, setFloor] = useState("All");
  const navigate = useNavigate();

  const fetchTables = async () => {
    const res = await api.get("/api/tables");
    setTables(res.data.tables || []);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables =
    floor === "All"
      ? tables
      : tables.filter((t) => t.floor === floor);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HEADER + FILTERS */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-400">
              Tables
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Select Table
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {filteredTables.length} Tables
          </div>
        </div>

        {/* FLOOR FILTER */}
        <div className="mt-4 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {FLOORS.map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all
                ${floor === f
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredTables.map((t) => (
          <div
            key={t._id}
            onClick={() => navigate(`/cashier/table/${t._id}`)}
            className={`group relative cursor-pointer rounded-2xl p-3 sm:p-4 border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg
              ${t.status === "available"
                ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border-emerald-200"
                : "bg-gradient-to-br from-rose-50 via-white to-rose-100 border-rose-200"
              }`}
          >
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    t.status === "available" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {t.status.toUpperCase()}
              </span>
              <span>{t.floor} Floor</span>
            </div>

            <div className="mt-3 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center text-lg sm:text-xl font-bold text-slate-900">
                T-{t.tableNumber}
              </div>
            </div>

            <div
              className={`mt-3 text-center text-xs sm:text-sm font-semibold px-2 py-1 rounded-full
                ${t.status === "available"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
                }`}
            >
              {t.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashierTables;
