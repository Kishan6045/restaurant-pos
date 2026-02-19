import { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../utils/axios";
import { Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Loader from "../../components/Loader";

const Staff = () => {

  /* ================= STATE ================= */

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);                                
  const [showEditPassword, setShowEditPassword] = useState(false);   


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ================= VALIDATION REGEX ================= */

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  /* ================= LOAD STAFF ================= */

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/staff");
      setStaff(res.data.staff || []);
    } catch (e) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  /* ================= ADD STAFF ================= */

  const addStaff = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!name || !email || !password) {
      return toast.error("All fields required");
    }

    if (name.length < 3) {
      return toast.error("Name must be at least 3 characters");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Invalid email format");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!strongPasswordRegex.test(password)) {
      return toast.error(
        "Password must contain uppercase, lowercase & number"
      );
    }

    const exists = staff.find(
      (s) => s.email?.toLowerCase() === email
    );

    if (exists) {
      return toast.error("Email already exists");
    }

    try {
      await api.post("/api/staff", {
        name,
        email,
        password,
      });

      toast.success("Cashier added");
      setForm({ name: "", email: "", password: "" });
      loadStaff();
    } catch (e) {
      toast.error(e.response?.data?.message || "Add failed");
    }
  };

  /* ================= UPDATE STAFF ================= */
  const updateStaff = async () => {
    const name = editStaff.name.trim();
    const password = editStaff.password?.trim();

    if (!name) {
      return toast.error("Name required");
    }

    if (name.length < 3) {
      return toast.error("Name must be at least 3 characters");
    }

    const payload = { name };

    if (password) {
      if (password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }

      if (!strongPasswordRegex.test(password)) {
        return toast.error(
          "Password must contain uppercase, lowercase & number"
        );
      }

      payload.password = password;
    }

    try {
      await api.put(`/api/staff/${editStaff.id}`, payload);
      toast.success("Updated");
      setEditStaff(null);
      loadStaff();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  /* ================= DEACTIVATE ================= */

  const toggleStatus = async (id) => {
    if (!window.confirm("Deactivate this staff?")) return;

    try {
      await api.delete(`/api/staff/${id}`);
      toast.success("Staff deactivated");
      loadStaff();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  /* ================= FILTER LOGIC ================= */

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? s.isActive
            : !s.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [staff, search, statusFilter]);

  /* ================= TABLE ================= */

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${row.original.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
              }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        header: "Action",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setEditStaff({ ...s, password: "" })
                }
              >
                <Pencil size={16} />
              </button>

              {s.isActive && (
                <button onClick={() => toggleStatus(s.id)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredStaff,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  /* ================= UI ================= */

  return (
    <div className="h-full flex flex-col bg-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 gap-4 overflow-hidden">

        {/* ADD SECTION */}
        <div className="bg-white rounded-xl shadow border p-4 shrink-0">
          <h2 className="text-lg font-semibold mb-3">Add Cashier</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Name"
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="border rounded-lg px-3 py-2 text-sm w-full pr-10"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>


            <button
              onClick={addStaff}
              className="bg-black text-white rounded-md px-2 py-2 text-sm w-auto self-start hover:bg-gray-900 transition"
            >
              Add
            </button>

          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-3 shrink-0">
          <input
            placeholder="Search..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="flex-1 bg-white rounded-xl shadow border flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold shrink-0">
            Cashier List
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <Loader label="Loading..." />
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b z-10">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th key={h.id} className="px-4 py-3 text-left">
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center px-4 py-2 border-t bg-gray-50 shrink-0">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Cashier</h3>
              <X onClick={() => setEditStaff(null)} />
            </div>

            <input
              className="border rounded-lg px-3 py-2 w-full mb-3"
              value={editStaff.name}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  name: e.target.value,
                })
              }
            />

            <div className="relative">
              <input
                type={showEditPassword ? "text" : "password"}
                placeholder="New password (optional)"
                className="border rounded-lg px-3 py-2 w-full pr-10"
                value={editStaff.password}
                onChange={(e) =>
                  setEditStaff({
                    ...editStaff,
                    password: e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={() => setShowEditPassword(!showEditPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>



            <button
              onClick={updateStaff}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
