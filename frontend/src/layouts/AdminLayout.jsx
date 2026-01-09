import { useState } from "react";
import IconSidebar from "../components/sidebar/IconSidebar";
import SubSidebar from "../components/sidebar/SubSidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="h-screen flex bg-gray-100">


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

        <main className="flex-1 p-4 overflow-y-auto">

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
