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
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {FLOORS.map((f) => {
              const isActive = floor === f;
              return (
                <button
                  key={f}
                  onClick={() => setFloor(f)}
                  className={`relative shrink-0 px-3 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all
                    ${isActive
                      ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                    }`}
                >
                  <span className="whitespace-nowrap">{f}</span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredTables.map((t) => {
          const isAvailable = t.status === "available";
          return (
            <div
              key={t._id}
              onClick={() => navigate(`/cashier/table/${t._id}`)}
              className={`group relative cursor-pointer rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg bg-white
                ${isAvailable ? "border-emerald-200" : "border-rose-200"}
              `}
            >
              {/* Top Bar */}
              <div className={`flex items-center justify-between px-3 py-2 border-b
                ${isAvailable ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}
              `}>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {isAvailable ? "AVAILABLE" : "OCCUPIED"}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500">
                  {t.floor} Floor
                </div>
              </div>

              {/* Table Body */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-center">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center text-lg sm:text-2xl font-bold
                    ${isAvailable ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-rose-200 text-rose-700 bg-rose-50"}
                  `}>
                    T-{t.tableNumber}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                  <span className="uppercase tracking-wide">Table</span>
                  <span className="font-semibold text-slate-700">
                    {isAvailable ? "Ready" : "In Use"}
                  </span>
                </div>

                <div
                  className={`mt-3 w-full text-center text-xs sm:text-sm font-semibold py-1.5 rounded-xl
                    ${isAvailable ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}
                  `}
                >
                  {isAvailable ? "START ORDER" : "VIEW ORDER"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CashierTables;
