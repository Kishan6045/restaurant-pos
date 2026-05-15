import ProfileDropdown from "./ProfileDropdown";

const titles = {
  admin: "Admin",
  cashier: "Cashier",
  kitchen: "Kitchen",
};

const Header = ({ role }) => {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-indigo-600 to-indigo-900" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            RS Hotel POS
          </p>
          <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
            {titles[role] || "Panel"}
          </h1>
        </div>
      </div>

      <ProfileDropdown role={role} />
    </header>
  );
};

export default Header;
