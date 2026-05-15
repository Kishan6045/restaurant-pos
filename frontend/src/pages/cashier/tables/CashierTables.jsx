import { useEffect, useState, useCallback } from "react";
import api from "../../../utils/axios";
import { useNavigate } from "react-router-dom";
import { POS } from "../../../components/cashier/posListTheme";

const FLOORS = ["All", "Ground", "First", "Second"];
const FLOOR_STORAGE_KEY = "cashier:selectedFloor";

const CashierTables = () => {
  const [tables, setTables] = useState([]);
  const [floor, setFloor] = useState(() => {
    if (typeof window === "undefined") return "All";
    const af = window.localStorage.getItem("assignedFloor") || "";
    if (["Ground", "First", "Second"].includes(af)) return af;
    const saved = window.localStorage.getItem(FLOOR_STORAGE_KEY);
    return FLOORS.includes(saved) ? saved : "All";
  });
  const assignedFloor = typeof window !== "undefined" ? window.localStorage.getItem("assignedFloor") || "" : "";
  const isRestrictedToFloor = ["Ground", "First", "Second"].includes(assignedFloor);
  const [isFloorPickerOpen, setIsFloorPickerOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTables = useCallback(async () => {
    const params = { limit: 500 };
    if (!isRestrictedToFloor && floor !== "All") params.floor = floor;
    const res = await api.get("/api/tables", { params });
    setTables(res.data.tables || []);
  }, [floor, isRestrictedToFloor]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isRestrictedToFloor) {
      window.localStorage.setItem(FLOOR_STORAGE_KEY, floor);
    }
  }, [floor, isRestrictedToFloor]);

  const filteredTables = floor === "All" ? tables : tables.filter((t) => t.floor === floor);

  return (
    <div className="w-full space-y-3 py-1 md:space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-zinc-900/[0.04] md:px-5 md:py-4">
        <div>
          <h1 className="text-base font-semibold text-zinc-900 md:text-lg">Tables</h1>
          <p className="text-xs text-zinc-500 md:text-sm">{filteredTables.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          {!isRestrictedToFloor && (
            <button
              type="button"
              onClick={() => setIsFloorPickerOpen((p) => !p)}
              className="rounded-xl border border-zinc-200/90 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:shadow-md md:text-sm"
            >
              {isFloorPickerOpen ? "Close" : "Floor"}
            </button>
          )}
          {isRestrictedToFloor && <span className="text-xs text-zinc-500 md:text-sm">{assignedFloor}</span>}
        </div>
      </div>

      {!isRestrictedToFloor && isFloorPickerOpen && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-zinc-900/[0.04] md:p-4">
          {FLOORS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFloor(f);
                setIsFloorPickerOpen(false);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition md:text-sm ${
                floor === f ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredTables.map((t) => {
          const isAvailable = t.status === "available";
          const id = t._id ?? t.id;
          return (
            <button
              key={id}
              type="button"
              onClick={() =>
                navigate(`/cashier/table/${id}`, {
                  state: { tableNumber: t.tableNumber, floor: t.floor },
                })
              }
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200/90 bg-white p-3 text-left shadow-[0_2px_12px_rgba(0,0,0,0.05)] ring-1 ring-zinc-900/[0.03] transition hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:gap-3 sm:p-4"
            >
              <span
                className={`${POS.mono} mx-auto sm:mx-0 ${isAvailable ? "text-emerald-700" : "text-rose-700"}`}
              >
                {t.tableNumber}
              </span>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className={`${POS.title} text-sm md:text-base`}>Table T-{t.tableNumber}</p>
                <p className={`${POS.sub} text-xs md:text-[11px]`}>{t.floor}</p>
              </div>
              <span
                className={`mx-auto shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold sm:mx-0 md:text-xs ${
                  isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}
              >
                {isAvailable ? "Order" : "View"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CashierTables;
