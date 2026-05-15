import { useEffect, useState, useCallback } from "react";
import api from "../../utils/axios";
import { Plus, Pencil, Trash2, X, Armchair } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import PaginationBar from "../../components/PaginationBar";
import { docId } from "../../helpers/docId";
import AdminPageShell from "../../components/admin/AdminPageShell";
import Select from "../../components/ui/Select";

const FLOORS = ["Ground", "First", "Second"];
const LIMIT = 10;

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [floorFilter, setFloorFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: LIMIT });

  const [openModal, setOpenModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [tableNumber, setTableNumber] = useState("");
  const [floor, setFloor] = useState("Ground");

  const fetchTables = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit: LIMIT };
      if (floorFilter !== "All") params.floor = floorFilter;
      const res = await api.get("/api/tables", { params });
      setTables(res.data.tables || []);
      setPagination(
        res.data.pagination || {
          total: (res.data.tables || []).length,
          totalPages: 1,
          limit: LIMIT,
        }
      );
    } catch {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, [floorFilter]);

  useEffect(() => {
    fetchTables(page);
  }, [page, floorFilter, fetchTables]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tableNumber) {
      toast.error("Table number required");
      return;
    }

    try {
      setLoading(true);

      if (editingTable) {
        await api.put(`/api/tables/${docId(editingTable)}`, {
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
      fetchTables(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Delete table?")) return;

    try {
      await api.delete(`/api/tables/${id}`);
      toast.success("Table deleted");
      fetchTables(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <AdminPageShell
        title="Tables"
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingTable(null);
              setTableNumber("");
              setFloor("Ground");
              setOpenModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/20 transition hover:from-indigo-700 hover:to-indigo-900"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add table
          </button>
        }
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Floor
            </label>
            <Select
              aria-label="Filter by floor"
              value={floorFilter}
              onChange={(v) => {
                setFloorFilter(v);
                setPage(1);
              }}
              options={[
                { value: "All", label: "All floors" },
                ...FLOORS.map((f) => ({ value: f, label: f })),
              ]}
              className="min-w-[148px]"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium">
              <Armchair className="h-3.5 w-3.5 text-slate-400" />
              {pagination.total} total
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <Loader label="Loading tables…" containerClassName="py-16" />
          ) : tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
              <Armchair className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No tables yet</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">Create your first table to start taking orders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
              {tables.map((table) => {
                const busy = table.status === "occupied";
                return (
                  <div
                    key={docId(table)}
                    className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                      busy ? "border-rose-200 ring-1 ring-rose-100" : "border-slate-200/90"
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full w-1 ${busy ? "bg-rose-500" : "bg-emerald-500"}`}
                      aria-hidden
                    />
                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Table</p>
                          <p className="text-lg font-bold text-slate-900">T{table.tableNumber}</p>
                          <p className="text-xs text-slate-500">{table.floor} floor</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            busy ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {busy ? "Busy" : "Free"}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => {
                            setEditingTable(table);
                            setTableNumber(String(table.tableNumber));
                            setFloor(table.floor);
                            setOpenModal(true);
                          }}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => deleteTable(docId(table))}
                          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <PaginationBar
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          loading={loading}
        />
      </AdminPageShell>

      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenModal(false);
              setEditingTable(null);
              setTableNumber("");
              setFloor("Ground");
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card-lg"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingTable ? "Edit table" : "Add table"}
              </h3>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                onClick={() => {
                  setOpenModal(false);
                  setEditingTable(null);
                  setTableNumber("");
                  setFloor("Ground");
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Table number</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Floor</label>
                <Select
                  aria-label="Table floor"
                  value={floor}
                  onChange={setFloor}
                  options={FLOORS.map((f) => ({ value: f, label: f }))}
                  className="mt-1 w-full"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {editingTable ? "Save changes" : "Create table"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Tables;
