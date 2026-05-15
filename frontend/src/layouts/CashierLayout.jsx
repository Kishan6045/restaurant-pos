import { Outlet } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown";

const CashierLayout = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-100 text-zinc-900">
      <header className="sticky top-0 z-30 shrink-0 border-b border-zinc-200/90 bg-white/95 backdrop-blur-sm">
        <div className="flex h-11 w-full items-center justify-between gap-2 px-2 sm:h-12 sm:px-3 md:px-4 lg:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-6 w-0.5 shrink-0 rounded-full bg-zinc-900" />
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                RS Hotel POS
              </p>
              <span className="block truncate text-xs font-semibold text-zinc-900 sm:text-sm">
                Cashier
              </span>
            </div>
          </div>
          <ProfileDropdown role="cashier" />
        </div>
      </header>

      <main className="min-h-0 w-full flex-1 overflow-auto px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-5">
        <Outlet />
      </main>
    </div>
  );
};

export default CashierLayout;
