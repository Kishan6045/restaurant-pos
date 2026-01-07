// import { useEffect, useState } from "react";
// import api from "../../utils/axios";
// import { toast } from "react-toastify";

// const ROLES = ["admin", "cashier", "kitchen"];

// const MODULES = [
//   { key: "products", label: "Products", actions: ["read", "create", "update", "delete"] },
//   { key: "categories", label: "Categories", actions: ["read", "create", "update", "delete"] },
//   { key: "orders", label: "Orders", actions: ["read", "create", "cancel"] },
//   { key: "payments", label: "Payments", actions: ["read", "create"] },
//   { key: "kitchen", label: "Kitchen", actions: ["view", "update"] },
//   { key: "staff", label: "Staff", actions: ["read", "create", "update", "delete"] },
//   { key: "reports", label: "Reports", actions: ["read"] }
// ];

// const PermissionManagement = () => {
//   const [data, setData] = useState({
//     admin: [],
//     cashier: [],
//     kitchen: []
//   });
//   const [saving, setSaving] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//   // ================= LOAD =================
//  const load = async () => {
//   const res = await api.get("/api/permissions/matrix");

//   setData({
//     admin: res.data.admin || [],
//     cashier: res.data.cashier || [],
//     kitchen: res.data.kitchen || []
//   });
// };

//   useEffect(() => {
//     load();
//   }, []);

//   // ================= HELPERS =================
//   const has = (role, perm) => data[role]?.includes(perm);

//   const toggle = (role, perm) => {
//     if (!isEditing) return;

//     setData(prev => {
//       let list = prev[role] || [];
//       const [module, action] = perm.split(".");

//       const moduleConfig = MODULES.find(m => m.key === module);
//       const baseAction = moduleConfig.actions.includes("read")
//         ? "read"
//         : "view";

//       if (action !== baseAction && !list.includes(`${module}.${baseAction}`)) {
//         list = [...list, `${module}.${baseAction}`];
//       }

//       if (list.includes(perm)) {
//         list = list.filter(p => p !== perm);

//         if (perm === `${module}.${baseAction}`) {
//           list = list.filter(p => !p.startsWith(`${module}.`));
//         }
//       } else {
//         list = [...list, perm];
//       }

//       return { ...prev, [role]: list };
//     });
//   };

//   // ================= SAVE =================
//   const save = async () => {
//     try {
//       setSaving(true);

//       for (const role of ROLES) {
//         await api.put("/api/permissions", {
//           role,
//           permissions: data[role]
//         });
//       }

//       toast.success("Permissions saved");
//       setIsEditing(false); // 🔒 lock after save
//     } catch {
//       toast.error("Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded shadow">
//       {/* HEADER */}
//       <div className="flex justify-between mb-4">
//         <h2 className="text-lg font-semibold">Permission Management</h2>

//         {!isEditing ? (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="px-4 py-2 bg-gray-600 text-white rounded"
//           >
//             Edit
//           </button>
//         ) : (
//           <button
//             onClick={save}
//             disabled={saving}
//             className="px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             Save
//           </button>
//         )}
//       </div>

//       {/* TABLE */}
//       <div className="overflow-x-auto">
//         <table className="min-w-[1100px] text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Module</th>
//               {ROLES.map(r => (
//                 <th key={r} className="p-3 text-center uppercase">{r}</th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {MODULES.map(m => (
//               <tr key={m.key} className="border-t">
//                 <td className="p-3 font-medium">{m.label}</td>

//                 {ROLES.map(role => (
//                   <td key={role} className="p-3">
//                     <div className="flex gap-3 flex-wrap">
//                       {m.actions.map(a => {
//                         const key = `${m.key}.${a}`;
//                         return (
//                           <label key={key} className="flex items-center gap-1 text-xs">
//                             <input
//                               type="checkbox"
//                               checked={has(role, key)}
//                               disabled={!isEditing}
//                               onChange={() => toggle(role, key)}
//                             />
//                             {a}
//                           </label>
//                         );
//                       })}
//                     </div>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PermissionManagement;





import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { toast } from "react-toastify";

const ROLES = ["admin", "cashier", "kitchen"];

const MODULES = [
  { key: "tables", label: "tables", actions: ["read", "create", "update", "delete"] },
  { key: "products", label: "Products", actions: ["read", "create", "update", "delete"] },
  { key: "categories", label: "Categories", actions: ["read", "create", "update", "delete"] },
  { key: "orders", label: "Orders", actions: ["read", "create", "cancel"] },
  { key: "payments", label: "Payments", actions: ["read", "create"] },
  { key: "kitchen", label: "Kitchen", actions: ["view", "update"] },
  { key: "staff", label: "Staff", actions: ["read", "create", "update", "delete"] },
  { key: "reports", label: "Reports", actions: ["read"] }
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

    setData(prev => {
      let list = prev[role] || [];
      const [module, action] = perm.split(".");

      const moduleConfig = MODULES.find(m => m.key === module);
      const baseAction = moduleConfig.actions.includes("read") ? "read" : "view";

      if (action !== baseAction && !list.includes(`${module}.${baseAction}`)) {
        list = [...list, `${module}.${baseAction}`];
      }

      if (list.includes(perm)) {
        list = list.filter(p => p !== perm);
        if (perm === `${module}.${baseAction}`) {
          list = list.filter(p => !p.startsWith(`${module}.`));
        }
      } else {
        list = [...list, perm];
      }

      return { ...prev, [role]: list };
    });
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
            className="px-4 py-2 bg-gray-600 text-white rounded w-full sm:w-auto"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
          >
            Save
          </button>
        )}
      </div>

      {/* TABLE SCROLL CONTAINER */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <table className="min-w-[1000px] w-full text-sm border">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-3 text-left whitespace-nowrap">Module</th>
                {ROLES.map(r => (
                  <th
                    key={r}
                    className="p-3 text-center uppercase whitespace-nowrap"
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {MODULES.map(m => (
                <tr key={m.key} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium whitespace-nowrap">
                    {m.label}
                  </td>

                  {ROLES.map(role => (
                    <td key={role} className="p-3">
                      <div className="flex gap-3 flex-wrap">
                        {m.actions.map(a => {
                          const key = `${m.key}.${a}`;
                          return (
                            <label
                              key={key}
                              className="flex items-center gap-1 text-xs whitespace-nowrap"
                            >
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

        {/* SCROLL HINT (MOBILE) */}
        <div className="text-xs text-gray-400 text-center mt-2 sm:hidden">
          ← Swipe left / right to see more →
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;
