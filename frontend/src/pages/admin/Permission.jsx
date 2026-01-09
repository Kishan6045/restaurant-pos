import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { togglePermission } from "../../helpers/permissionHelper";

const ROLES = ["admin", "cashier", "kitchen"];

const MODULES = [
  { key: "dashboard", label: "Dashboard", actions: ["read"] },
  { key: "tables", label: "tables", actions: ["read", "create", "update", "delete"] },
  { key: "products", label: "Products", actions: ["read", "create", "update", "delete"] },
  { key: "categories", label: "Categories", actions: ["read", "create", "update", "delete"] },
  { key: "orders", label: "Orders", actions: ["read", "create", "cancel"] },
  { key: "payments", label: "Payments", actions: ["read", "create"] },
  { key: "kitchen", label: "Kitchen", actions: ["view", "update"] },
  { key: "staff", label: "Staff", actions: ["read", "create", "update", "delete"] },
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
    const res = await api.get("/api/permissions/matrix");
    setData({
      admin: res.data.admin || [],
      cashier: res.data.cashier || [],
      kitchen: res.data.kitchen || []
    });
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
    <div className="p-4 sm:p-6 bg-white rounded shadow">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Permission Management</h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        )}
      </div>

      {/* ✅ SINGLE SCROLL WRAPPER (BOTTOM SCROLLER HERE) */}
      <div className="border rounded h-[70vh] overflow-auto">

        <table className="min-w-[1600px] text-sm border-collapse relative">

          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left sticky left-0 bg-gray-100 z-30 border-r">
                Module
              </th>
              {ROLES.map(role => (
                <th key={role} className="p-3 text-center uppercase">
                  {role}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {MODULES.map(m => (
              <tr key={m.key} className="border-t hover:bg-gray-50">

                <td className="p-3 font-medium whitespace-nowrap sticky left-0 bg-white z-20 border-r">
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
                              className="accent-blue-600"
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

      <div className="text-xs text-gray-400 text-center mt-2 sm:hidden">
        ← Swipe left / right →
      </div>
    </div>
  );
};

export default PermissionManagement;
