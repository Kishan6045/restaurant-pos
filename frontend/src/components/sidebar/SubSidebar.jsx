import { NavLink } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const menuConfig = {
  dashboard: {
    title: "Dashboard",
    links: [{ to: "/admin", label: "Overview" }],
  },
  menu: {
    title: "Menu",
    links: [
      { to: "/admin/categories", label: "Categories" },
      { to: "/admin/products", label: "Products" },
    ],
  },
  tables: {
    title: "Tables",
    links: [{ to: "/admin/tables", label: "All Tables" }],
  },
  staff: {
    title: "Staff",
    links: [{ to: "/admin/staff", label: "Staff List" }],
  },
  orders: {
    title: "Orders",
    links: [{ to: "/admin/liveorders", label: "Live Orders" }],
  },
  reports: {
    title: "Reports",
    links: [{ to: "/admin/reports", label: "Reports" }],
  },
  settings: {
    title: "Settings",
    links: [{ to: "/admin/permissions", label: "Permissions" }],
  },
};

const SubSidebar = ({ activeMenu, close }) => {
  const menu = menuConfig[activeMenu];
  if (!menu) return null;

  return (
    <aside className="flex w-[11.5rem] shrink-0 flex-col border-r border-slate-600/80 bg-slate-800 shadow-[4px_0_20px_-6px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={close}
        className="flex h-12 items-center gap-2 border-b border-slate-600/90 bg-slate-800/95 px-3 text-left text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        <ChevronLeft size={18} className="shrink-0 text-indigo-400" />
        <span className="truncate">{menu.title}</span>
      </button>

      <nav className="flex-1 space-y-1 bg-slate-800/80 py-3" aria-label={`${menu.title} links`}>
        {menu.links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={close}
            className={({ isActive }) =>
              [
                "mx-2 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-indigo-600 font-semibold text-white shadow-sm ring-1 ring-indigo-400/50"
                  : "text-slate-100 hover:bg-slate-600/95 hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SubSidebar;
