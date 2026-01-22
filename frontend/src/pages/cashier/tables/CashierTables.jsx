import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/axios";
import useAutoRefresh from "../../../utils/useAutoRefresh";

const FLOORS = ["All", "Ground", "First", "Second"]; // Available floor options for filtering tables
const FLOOR_STORAGE_KEY = "cashier:selectedFloor";  // Key used to store selected floor in localStorage
const TABLES_REFRESH_MS = 5000;

// Main component
const CashierTables = () => {

  const [tables, setTables] = useState([]);   // State to store all tables fetched from backend
  const [floor, setFloor] = useState(() => {     // State to store selected floor (initialized from localStorage)
    if (typeof window === "undefined") return "All";    // Safety check for browser environment

    const saved = window.localStorage.getItem(FLOOR_STORAGE_KEY);     // Get saved floor from localStorage

    return FLOORS.includes(saved) ? saved : "All";     // Use saved value if valid, otherwise default to "All"
  });

  const [isFloorPickerOpen, setIsFloorPickerOpen] = useState(false);    // State to control floor picker dropdown visibility` 

  // Navigation function
  const navigate = useNavigate();

  // Function to fetch tables from backend API
  const fetchTables = async () => {
    try {
      const res = await api.get("/api/tables"); // API call
      setTables(res.data.tables || []); // Store tables in state
    } catch (err) {
      console.error("Failed to load tables:", err);
    }
  };

  // Fetch tables once when component mounts
  useEffect(() => {
    fetchTables();
  }, []);

  useAutoRefresh(fetchTables, TABLES_REFRESH_MS, { runOnMount: false });

  // Save selected floor to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FLOOR_STORAGE_KEY, floor);
    }
  }, [floor]);

  // Filter tables based on selected floor
  const filteredTables =
    floor === "All"
      ? tables // Show all tables
      : tables.filter((t) => t.floor === floor); // Filter by floor

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* HEADER + FILTER SECTION */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Title */}
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-400">
              Tables
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Select Table
            </h2>
          </div>

          {/* Table count badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {filteredTables.length} Tables
            </div>
          </div>
        </div>

        {/* FLOOR FILTER UI */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">

            {/* Current selected floor */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="uppercase tracking-wide text-[10px] sm:text-xs text-slate-400">
                Floor
              </span>
              <span className="font-semibold text-slate-900">{floor}</span>
            </div>

            {/* Toggle floor picker */}
            <button
              onClick={() => setIsFloorPickerOpen((prev) => !prev)}
              className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {isFloorPickerOpen ? "Hide" : "Change"}
            </button>
          </div>

          {/* Floor selection buttons */}
          {isFloorPickerOpen && (
            <div className="mt-3 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
              {FLOORS.map((f) => {
                const isActive = floor === f; // Check active floor

                return (
                  <button
                    key={f}
                    onClick={() => {
                      setFloor(f); // Update floor
                      setIsFloorPickerOpen(false); // Close picker
                    }}
                    className={`relative shrink-0 px-3 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all
                      ${isActive
                        ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    <span className="whitespace-nowrap">{f}</span>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">

        {/* Render each table */}
        {filteredTables.map((t) => {
          const isAvailable = t.status === "available"; // Table status

          return (
            <div
              key={t._id}
              onClick={() => navigate(`/cashier/table/${t._id}`)} // Navigate on click
              className={`group relative cursor-pointer rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg bg-white
                ${isAvailable ? "border-emerald-200" : "border-rose-200"}
              `}
            >
              {/* Status Bar */}
              <div
                className={`flex items-center justify-between px-3 py-2 border-b
                ${isAvailable
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-rose-50 border-rose-100"
                  }
              `}
              >
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-slate-700">
                  <span
                    className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                  />
                  {isAvailable ? "AVAILABLE" : "OCCUPIED"}
                </div>

                <div className="text-[10px] sm:text-xs text-slate-500">
                  {t.floor} Floor
                </div>
              </div>

              {/* Table Content */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-center">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center text-lg sm:text-2xl font-bold
                    ${isAvailable
                        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                        : "border-rose-200 text-rose-700 bg-rose-50"
                      }
                  `}
                  >
                    T-{t.tableNumber}
                  </div>
                </div>

                {/* Table state text */}
                <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {isAvailable ? "Ready" : "In Use"}
                  </span>
                </div>

                {/* Action button */}
                <div
                  className={`mt-3 w-full text-center text-xs sm:text-sm font-semibold py-1.5 rounded-xl
                    ${isAvailable
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                    }
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

// Export component
export default CashierTables;
