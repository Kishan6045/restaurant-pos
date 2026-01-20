import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const FLOORS = ["Ground", "First", "Second"];

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const [floorFilter, setFloorFilter] = useState("All");

  const [openModal, setOpenModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [tableNumber, setTableNumber] = useState("");
  const [floor, setFloor] = useState("Ground");

  // ================= FETCH TABLES =================
  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tables");
      setTables(res.data.tables || []);
    } catch (err) {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tableNumber) {
      toast.error("Table number required");
      return;
    }
    try {
      setLoading(true);
         if (editingTable) {
        await api.put(`/api/tables/${editingTable._id}`, {
          tableNumber,
          floor
        });
        toast.success("Table updated");
      } else {
        await api.post("/api/tables", {
          tableNumber,
          floor
        });
        toast.success("Table created");     
      }

      setOpenModal(false);
      setEditingTable(null);
      setTableNumber("");
      setFloor("Ground");
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS UPDATE =================
  const toggleStatus = async (table) => {
    try {
      const newStatus =
        table.status === "available" ? "occupied" : "available";

      await api.patch(`/api/tables/${table._id}/status`, {
        status: newStatus
      });

      fetchTables();
    } catch {
      toast.error("Status update failed");
    }
  };

  // ================= DELETE =================
  const deleteTable = async (id) => {
    if (!confirm("Delete table?")) return;

    try {
      await api.delete(`/api/tables/${id}`);
      toast.success("Table deleted");
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // ================= FILTER =================
  const filteredTables =
    floorFilter === "All"
      ? tables
      : tables.filter((t) => t.floor === floorFilter);

  // ================= UI =================
  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Restaurant Tables</h2>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
        >
          <Plus size={16} />
          Add Table
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="All">All Floors</option>
          {FLOORS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* TABLE GRID */}
      {loading ? (
        <Loader label="Loading tables..." containerClassName="py-10" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table._id}
              className={`rounded-lg p-4 border shadow-sm relative ${
                table.status === "available"
                  ? "bg-green-50 border-green-400"
                  : "bg-red-50 border-red-400"
              }`}
            >
              <div className="text-lg font-bold">
                Table {table.tableNumber}
              </div>

              <div className="text-sm text-gray-600">{table.floor} Floor</div>

              <div
                className={`mt-2 text-xs font-semibold ${
                  table.status === "available"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {table.status.toUpperCase()}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between mt-3">
                <button
                  onClick={() => toggleStatus(table)}
                  className="text-xs underline"
                >
                  Toggle
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTable(table);
                      setTableNumber(table.tableNumber);
                      setFloor(table.floor);
                      setOpenModal(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => deleteTable(table._id)}
                    disabled={table.status === "occupied"}
                    className={`${
                      table.status === "occupied"
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">
                {editingTable ? "Edit Table" : "Add Table"}
              </h3>
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditingTable(null);
                }}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number"
                placeholder="Table Number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                {FLOORS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded"
              >
                {editingTable ? "Update Table" : "Create Table"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
  