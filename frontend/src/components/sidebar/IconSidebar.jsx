import {
  LayoutDashboard,
  UtensilsCrossed,
  Armchair,
  Users,
  ClipboardList,
  FileText,
  Settings
} from "lucide-react";

const IconSidebar = ({ setActiveMenu, activeMenu }) => {
  const base =
    "p-2 rounded-md cursor-pointer transition";

  const active =
    "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30";

  return (
    <aside className="w-14 bg-gray-900 text-white flex flex-col items-center py-3 space-y-2">

      <div
        className={`${base} ${activeMenu === "dashboard" && active}`}
        onClick={() => setActiveMenu("dashboard")}
      >
        <LayoutDashboard size={18} />
      </div>

      <div
        className={`${base} ${activeMenu === "menu" && active}`}
        onClick={() => setActiveMenu("menu")}
      >
        <UtensilsCrossed size={18} />
      </div>

      <div
        className={`${base} ${activeMenu === "tables" && active}`}
        onClick={() => setActiveMenu("tables")}
      >
        <Armchair size={18} />
      </div>

      <div
        className={`${base} ${activeMenu === "staff" && active}`}
        onClick={() => setActiveMenu("staff")}
      >
        <Users size={18} />
      </div>

      <div
        className={`${base} ${activeMenu === "orders" && active}`}
        onClick={() => setActiveMenu("orders")}
      >
        <ClipboardList size={18} />
      </div>

      <div
        className={`${base} ${activeMenu === "reports" && active}`}
        onClick={() => setActiveMenu("reports")}
      >
        <FileText size={18} />
      </div>

      <div
        className={`${base} ${activeMenu === "settings" && active}`}
        onClick={() => setActiveMenu("settings")}
      >
        <Settings size={18} />
      </div>

    </aside>
  );
};

export default IconSidebar;
