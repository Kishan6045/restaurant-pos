import { Outlet } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown";

const CashierLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-30">
        <div className="bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="mx-auto w-full max-w-7xl h-12 sm:h-14 px-3 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-orange-600" />
              <span className="text-sm sm:text-base font-semibold text-slate-900">
                Cashier Panel
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-slate-500">
                POS Console
              </span>
              <ProfileDropdown role="cashier" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CashierLayout;