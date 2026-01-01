import { Outlet } from "react-router-dom";

const CashierLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 bg-white border-b flex items-center px-4 font-semibold">
        Cashier Panel
      </header>

      <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CashierLayout;
