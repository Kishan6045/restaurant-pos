import { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../utils/axios";
import { Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  useReactTable,
getCoreRowModel,
    flexRender,
  } from "@tanstack/react-table";
import Loader from "../../components/Loader";
import PaginationBar from "../../components/PaginationBar";
import AdminPageShell from "../../components/admin/AdminPageShell";
import { docId } from "../../helpers/docId";
import Select from "../../components/ui/Select";

const FLOORS = ["Ground", "First", "Second"];

const FLOOR_ACCESS_OPTIONS = [
  { value: "", label: "All floors" },
  ...FLOORS.map((f) => ({ value: f, label: `${f} only` })),
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    assignedFloor: "",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const LIMIT = 10;

  /* ================= VALIDATION REGEX ================= */

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  /* ================= LOAD STAFF ================= */

  const loadStaff = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/api/staff", { params: { page: pageNum, limit: LIMIT } });
      setStaff(res.data.staff || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: LIMIT });
    } catch (e) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff(page);
  }, [page]);

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
        assignedFloor: form.assignedFloor || undefined,
      });

      toast.success("Cashier added");
      setForm({ name: "", email: "", password: "", assignedFloor: "" });
      loadStaff(page);
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
    if (editStaff.assignedFloor !== undefined) payload.assignedFloor = editStaff.assignedFloor || null;

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
      await api.put(`/api/staff/${docId(editStaff)}`, payload);
      toast.success("Updated");
      setEditStaff(null);
      loadStaff(page);
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
      loadStaff(page);
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
        header: "Floor",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.assignedFloor || "All"}
          </span>
        ),
      },
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
                type="button"
                onClick={() =>
                  setEditStaff({ ...s, password: "" })
                }
              >
                <Pencil size={16} />
              </button>

              {s.isActive && (
                <button type="button" onClick={() => toggleStatus(docId(s))}>
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
  });

  /* ================= UI ================= */

  return (
    <>
    <AdminPageShell title="Staff">
      <div className="space-y-4 p-4 sm:p-6">

        {/* ADD SECTION */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm shrink-0">
          <h2 className="text-lg font-semibold mb-3">Add Cashier</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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

            <Select
              aria-label="Floor access for cashier"
              value={form.assignedFloor}
              onChange={(v) => setForm((f) => ({ ...f, assignedFloor: v }))}
              options={FLOOR_ACCESS_OPTIONS}
              placeholder="All floors"
              className="w-full min-w-[140px] sm:w-auto"
            />

            <button
              type="button"
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

          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            className="w-36 shrink-0"
            variant="compact"
          />
        </div>

        {/* TABLE */}
        <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-800">
            Cashier list
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

          <PaginationBar
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>
    </AdminPageShell>

      {/* EDIT MODAL */}
      {editStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Cashier</h3>
              <X
                role="button"
                tabIndex={0}
                onClick={() => setEditStaff(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditStaff(null)}
                className="cursor-pointer text-slate-500 hover:text-slate-800"
                aria-label="Close"
              />
            </div>

            <input
              className="border rounded-lg px-3 py-2 w-full mb-3"
              placeholder="Name"
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

            <label className="mb-1 mt-3 block text-sm font-medium text-gray-700">Floor access</label>
            <Select
              aria-label="Floor access"
              value={editStaff.assignedFloor ?? ""}
              onChange={(v) =>
                setEditStaff((s) => (s ? { ...s, assignedFloor: v || null } : s))
              }
              options={FLOOR_ACCESS_OPTIONS}
              placeholder="All floors"
              className="w-full"
            />

            <button
              type="button"
              onClick={updateStaff}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Staff;
