import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Categories from "./pages/admin/Categories";
import Products from "./pages/admin/Products";
import Tables from "./pages/admin/Tables";
import Staff from "./pages/admin/Staff";
import Orders from "./pages/admin/orders";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import CashierLayout from "./layouts/CashierLayout";
import CashierTables from "./pages/cashier/CashierTables";
import OrderScreen from "./pages/cashier/OrderScreen";
import KitchenScreen from "./pages/kitchen/KitchenScreen";

function App() {
  return (
    <BrowserRouter>  {/*without relod login */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="/login" />} />
         <Route path="/login" element={<Login />} />

        {/* Admin layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<Categories/>}/>
          <Route path="products" element={<Products/>}/>
          <Route path="tables" element={<Tables/>}/>
          <Route path="staff" element={<Staff/>}/>
          <Route path="orders" element={<Orders/>}/>
          <Route path="reports" element={<Reports/>}/>
          <Route path="settings" element={<Settings/>}/>
        </Route>
        
        {/* Cashier layout */}
        <Route path="/cashier" element={<CashierLayout />} >
          <Route index element={<Navigate to="tables" />} />
         <Route path="tables" element={<CashierTables />} />
          <Route path="table/:tableId" element={<OrderScreen />} />
        </Route>
      

        {/* Kitchen layout */}
        <Route path="/kitchen" element={<KitchenScreen />} />



        </Routes>
    </BrowserRouter>
  );
}

export default App;
