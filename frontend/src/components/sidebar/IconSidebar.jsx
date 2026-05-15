import {
  LayoutDashboard,
  UtensilsCrossed,
  Armchair,
  Users,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";

const IconSidebar = ({ setActiveMenu, activeMenu }) => {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "menu", icon: UtensilsCrossed, label: "Menu" },
    { id: "tables", icon: Armchair, label: "Tables" },
    { id: "staff", icon: Users, label: "Staff" },
    { id: "orders", icon: ClipboardList, label: "Orders" },
    { id: "reports", icon: FileText, label: "Reports" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="flex w-[4.5rem] shrink-0 flex-col items-center border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-4 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.45)]">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-800 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 ring-2 ring-white/15">
        RS
      </div>
      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Main sections">
        {items.map(({ id, icon: Icon, label }) => {
          const active = activeMenu === id;
          return (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              onClick={() => setActiveMenu(id)}
              className={[
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800",
                active
                  ? "bg-indigo-500 text-white shadow-md ring-2 ring-indigo-300/70"
                  : "text-slate-100 hover:bg-slate-600/90 hover:text-white",
              ].join(" ")}
            >
              <Icon size={21} strokeWidth={active ? 2.35 : 2} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default IconSidebar;
