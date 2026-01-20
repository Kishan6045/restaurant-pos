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
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">Select Table</h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {filteredTables.length} Tables
        </span>
      </div>

      {/* FLOOR FILTER */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        {FLOORS.map((f) => (
          <button
            key={f}
            onClick={() => setFloor(f)}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border
              ${floor === f
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredTables.map((t) => (
          <div
            key={t._id}
            onClick={() => navigate(`/cashier/table/${t._id}`)}
            className={`cursor-pointer rounded-xl p-3 sm:p-4 shadow-sm border
              transition hover:shadow-md
              ${t.status === "available"
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
              }`}
          >
            <div className="text-lg sm:text-xl font-bold text-center">
              T-{t.tableNumber}
            </div>

            <div className="text-[11px] sm:text-xs text-center text-gray-500 mt-1">
              {t.floor} Floor
            </div>

            <div
              className={`mt-3 text-center text-xs sm:text-sm font-medium px-2 py-1 rounded-full
                ${t.status === "available"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
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
