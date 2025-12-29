import { NavLink } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; // sub sidebar icon

const menuConfig = {
    dashboard: {
        title: "Dashboard",
        links: [{ to: "/admin", label: "Overview" }]
    },
    menu: {
        title: "Menu",
        links: [
            { to: "/admin/categories", label: "Categories" },
            { to: "/admin/products", label: "Products" }
        ]
    },
    tables: {
        title: "Tables",
        links: [{ to: "/admin/tables", label: "All Tables" }]
    },
    staff: {
        title: "Staff",
        links: [{ to: "/admin/staff", label: "Staff List" }]
    },
    orders: {
        title: "Orders",
        links: [{ to: "/admin/orders", label: "Live Orders" }]
    },
    reports: {
        title: "Reports",
        links: [
            { to: "/admin/reports/daily", label: "Daily" },
            { to: "/admin/reports/monthly", label: "Monthly" }
        ]
    },
    settings: {
        title: "Settings",
        links: [{ to: "/admin/settings", label: "General" }]
    }
};

const SubSidebar = ({ activeMenu, close }) => {
    const menu = menuConfig[activeMenu];
    if (!menu) return null;

    return (
        <aside className="w-40 bg-[#1f2937] border-r border-gray-700 flex flex-col">

            {/* Header (Back style) */}
            <button
                onClick={close}
                className="
          h-12 px-4
          flex items-center gap-2
          text-sm text-gray-300
          hover:bg-gray-700/40
          border-b border-gray-700
          transition
        "
            >
                <ChevronLeft size={16} />
                {menu.title}
            </button>

            {/* Links */}
            <nav className="flex-1 py-2">
                {menu.links.map((item, i) => (
                    <NavLink
                        key={i}
                        to={item.to}
                        className={({ isActive }) =>
                            `
              flex items-center px-4 py-2 text-sm transition
              ${isActive
                                ? "bg-blue-500/10 text-blue-400 border-l-4 border-blue-500"
                                : "text-gray-300 hover:bg-gray-700/40 hover:text-white"}
              `
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
