import { Outlet } from "react-router-dom";

const CashierLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 h-12 sm:h-14 bg-white/95 backdrop-blur border-b flex items-center px-3 sm:px-4 text-sm sm:text-base font-semibold">
        Cashier Panel
      </header>

      <main className="flex-1 p-3 sm:p-4 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CashierLayout;
