import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { togglePermission } from "../../helpers/permissionHelper";
import AdminPageShell from "../../components/admin/AdminPageShell";

const ROLES = ["admin", "cashier", "kitchen"];

const MODULES = [
  { key: "dashboard", label: "Dashboard", actions: ["read"] },
  { key: "tables", label: "Tables", actions: ["read","create","update","delete"] },
  { key: "products", label: "Products", actions: ["read","create","update","delete"] },
  { key: "categories", label: "Categories", actions: ["read","create","update","delete"] },
  { key: "orders", label: "Orders", actions: ["read","create","cancel"] },
  { key: "payments", label: "Payments", actions: ["read","create"] },
  { key: "billing", label: "Billing", actions: ["view"] },
  { key: "kitchen", label: "Kitchen", actions: ["view","update"] },
  { key: "staff", label: "Staff", actions: ["read","create","update","delete"] },
  { key: "reports", label: "Reports", actions: ["read"] },
];


const PermissionManagement = () => {
  const [data, setData] = useState({
    admin: [],
    cashier: [],
    kitchen: []
  });

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/api/permissions/matrix");
      setData({
        admin: res.data.admin || [],
        cashier: res.data.cashier || [],
        kitchen: res.data.kitchen || [],
      });
    } catch {
      toast.error("Failed to load permissions");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const has = (role, perm) => data[role]?.includes(perm);

  const toggle = (role, perm) => {
    if (!isEditing) return;
    setData(prev =>
      togglePermission({
        prevData: prev,
        role,
        perm,
        modules: MODULES
      })
    );
  };

  const save = async () => {
    try {
      setSaving(true);
      for (const role of ROLES) {
        await api.put("/api/permissions", {
          role,
          permissions: data[role]
        });
      }
      toast.success("Permissions saved");
      setIsEditing(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell title="Permissions">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
      </div>

      {/* ✅ SINGLE SCROLL WRAPPER (BOTTOM SCROLLER HERE) */}
      <div className="h-[min(70vh,720px)] overflow-auto bg-white">

        <table className="min-w-[1600px] text-sm border-collapse relative">

          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr>
              <th className="sticky left-0 z-30 border-b border-r border-slate-200 bg-slate-100 p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Module
              </th>
              {ROLES.map(role => (
                <th key={role} className="border-b border-slate-200 p-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {role}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {MODULES.map(m => (
              <tr key={m.key} className="border-b border-slate-100 hover:bg-white/80">

                <td className="sticky left-0 z-20 whitespace-nowrap border-r border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  {m.label}
                </td>

                {ROLES.map(role => (
                  <td key={role} className="p-3">
                    <div className="flex gap-3 flex-wrap">
                      {m.actions.map(a => {
                        const key = `${m.key}.${a}`;
                        return (
                          <label key={key} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={has(role, key)}
                              disabled={!isEditing}
                              onChange={() => toggle(role, key)}
                              className="accent-indigo-600"
                            />
                            {a}
                          </label>
                        );
                      })}
                    </div>
                  </td>
                ))}

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-center text-xs text-slate-400 sm:hidden">
        ← Swipe to see all columns →
      </div>
    </AdminPageShell>
  );
};

export default PermissionManagement;
