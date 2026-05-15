import { useState } from "react";
import IconSidebar from "../components/sidebar/IconSidebar";
import SubSidebar from "../components/sidebar/SubSidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40">
      <IconSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {activeMenu && (
        <SubSidebar
          activeMenu={activeMenu}
          close={() => setActiveMenu(null)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="admin" />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto max-w-[1600px] min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
