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

  // ================= FETCH =================
  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tables");
      setTables(res.data.tables || []);
    } catch {
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
        await api.put(`/api/tables/${editingTable.id}`, {
          tableNumber,
          floor,
        });
        toast.success("Table updated");
      } else {
        await api.post("/api/tables", {
          tableNumber,
          floor,
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

  // ================= DELETE =================
  const deleteTable = async (id) => {
    if (!window.confirm("Delete table?")) return;

    try {
      await api.delete(`/api/tables/${id}`);
      toast.success("Table deleted");
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredTables =
    floorFilter === "All"
      ? tables
      : tables.filter((t) => t.floor === floorFilter);

  // ================= UI =================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Restaurant Tables</h2>

        <button
          onClick={() => {
            setEditingTable(null);
            setTableNumber("");
            setFloor("Ground");
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
        >
          <Plus size={14} />
          Add Table
        </button> 
      </div>

      {/* FILTER */}
      <select
        value={floorFilter}
        onChange={(e) => setFloorFilter(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      >
        <option value="All">All Floors</option>
        {FLOORS.map((f) => (
          <option key={f}>{f}</option>
        ))}
      </select>

      {/* TABLE GRID */}
      {loading ? (
        <Loader label="Loading tables..." containerClassName="py-10" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200"
            >
              <div className="font-semibold text-base text-gray-800">
                Table {table.tableNumber}
              </div>


              <div className="text-xs text-gray-500">
                {table.floor} Floor
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingTable(table);
                    setTableNumber(table.tableNumber);
                    setFloor(table.floor);
                    setOpenModal(true);
                  }}
                  className="p-1 text-gray-600 hover:text-black"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => deleteTable(table.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {openModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xs rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">
                {editingTable ? "Edit Table" : "Add Table"}
              </h3>
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditingTable(null);
                  setTableNumber("");
                  setFloor("Ground");
                }}
              >
                <X size={16} />
              </button>
            </div>    

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number"
                min="1"
                placeholder="Table Number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              />

              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {FLOORS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md text-sm hover:bg-gray-800 transition"
              >
                {editingTable ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
