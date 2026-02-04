import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Loader from "../../components/Loader";


const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ================= LOAD =================
  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/staff");
      setStaff(res.data.staff || []);
    } catch {
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {    // pura page load hote hi staff data load karne ke liye
    loadStaff();
  }, []);

  // ================= CREATE =================
  const addStaff = async () => {
    if (!form.name || !form.email || !form.password)
      return toast.error("All fields required");

    try {
      await api.post("/api/staff", { ...form, role: "cashier" });
      toast.success("Cashier added");
      setForm({ name: "", email: "", password: "" });
      loadStaff();  // reload staff list after adding new staff
    } catch (e) {
      toast.error(e.response?.data?.message || "Add failed");
    }
  };

  // ================= UPDATE =================
  const updateStaff = async () => {
    if (!editStaff.name) return toast.error("Name required");

    const payload = { name: editStaff.name };
    if (editStaff.password) payload.password = editStaff.password;

    try {
      await api.put(`/api/staff/${editStaff._id}`, payload);
      toast.success("Updated");
      setEditStaff(null);
      loadStaff();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= TOGGLE STATUS =================
  const toggleStatus = async (id, isActive) => {
    if (!window.confirm("Change staff status?")) return;
    try {
      await api.delete(`/api/staff/${id}`);
      toast.success(isActive ? "Deactivated" : "Activated");
      loadStaff();
    } catch {
      toast.error("Action failed");
    }
  };

  // ================= FILTER =================
  const filteredStaff = useMemo(() => { 
       // usememo use kiya hai kyu ki jyada data hai to baar baar filter na ho
  if (!search && !statusFilter) return staff;    // agar search + status dono empty → sab dikhao
    return staff.filter((s) => {
      const q =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());

      const st =
        statusFilter === ""
          ? true               // agar koi filter na ho to sab dikhana hai
          : statusFilter === "active"
            ? s.isActive         // agar active filter hai to active hi dikhana hai
            : !s.isActive;         // agar inactive filter hai to inactive hi dikhana hai

      return q && st;     // dono conditions ko satisfy karna hai
    });
  }, [staff, search, statusFilter]);     // jab bhi staff search ya statusFilter change ho to ye recalculate hoga


  // ================= TABLE =================
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
              <button onClick={() => setEditStaff({ ...s, password: "" })}>
                <Pencil size={16} />
              </button>
              <button onClick={() => toggleStatus(s._id, s.isActive)}>
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    []    // ae dependencies empty hai kyu ki ye columns sirf ek baar define hone chahiye
  );

  const table = useReactTable({
    data: filteredStaff,   // ye filtered staff data hai
    columns,  // ye columns upar define kiye hai
    getCoreRowModel: getCoreRowModel(), // ye table ka core row model provide karta hai
    getPaginationRowModel: getPaginationRowModel(),  // ye pagination ke liye hai
    initialState: { pagination: { pageSize: 8 } },   // aek page me 8 rows dikhana hai
  });


  // ================= UI =================
  return (
    <div className="p-3 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ADD STAFF – ONE LINE PROFESSIONAL */}
        <div className="bg-white border rounded-md px-3 py-2 shadow-sm">
          <div className="flex flex-col md:flex-row gap-2 items-stretch">

            <input
              placeholder="Name"
              className="border rounded px-3 py-2 text-sm flex-1 focus:ring-1 focus:ring-black outline-none"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              className="border rounded px-3 py-2 text-sm flex-1 focus:ring-1 focus:ring-black outline-none"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="border rounded px-3 py-2 text-sm flex-1 focus:ring-1 focus:ring-black outline-none"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button
              onClick={addStaff}
              className="bg-black text-white text-sm px-4 rounded hover:bg-gray-900 transition whitespace-nowrap"
            >
              Add
            </button>

          </div>
        </div>

        {/* FILTER */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 flex-1"
          />
          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* TABLE DESKTOP */}
        <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
         {loading ? (
            <Loader label="Loading staff..." containerClassName="py-10" />
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} className="p-3 text-left">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-t">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <Loader label="Loading staff..." containerClassName="py-6" />
          ) : (
            filteredStaff.map(s => (
              <div key={s._id} className="bg-white p-3 rounded shadow">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-gray-500">{s.email}</div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs">
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                  <div className="flex gap-3">
                    <Pencil size={16} onClick={() => setEditStaff({ ...s, password: "" })} />
                    <Trash2 size={16} onClick={() => toggleStatus(s._id, s.isActive)} />
                  </div>
                    </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* EDIT MODAL */}
      {editStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[90%] max-w-sm">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Edit Staff</h3>
              <X onClick={() => setEditStaff(null)} />
            </div>
            <input className="border p-2 w-full mb-2"
              value={editStaff.name}
              onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })} />
            <input className="border p-2 w-full"
              placeholder="New password (optional)"
              type="password"
              value={editStaff.password}
              onChange={(e) => setEditStaff({ ...editStaff, password: e.target.value })} />
            <button onClick={updateStaff}
              className="mt-3 w-full bg-black text-white py-2 rounded">
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
