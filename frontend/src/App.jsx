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
import LiveOrders from "./pages/admin/LiveOrders";
import Reports from "./pages/admin/Reports";
import Permission from "./pages/admin/Permission";
import CashierLayout from "./layouts/CashierLayout";
import CashierTables from "./pages/cashier/CashierTables";
import OrderScreen from "./pages/cashier/OrderScreen";
import KitchenScreen from "./pages/kitchen/KitchenScreen";
import BillingScreen from "./pages/cashier/BillingScreen";

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
          <Route path="liveorders" element={<LiveOrders/>}/>
          <Route path="reports" element={<Reports/>}/>
          <Route path="permissions" element={<Permission/>}/>
        </Route>
        
        {/* Cashier layout */}
        <Route path="/cashier" element={<CashierLayout />} >
          <Route index element={<Navigate to="tables" />} />
         <Route path="tables" element={<CashierTables />} />
          <Route path="table/:tableId" element={<OrderScreen />} />
          <Route path="billing/:tableId" element={<BillingScreen />} />
        </Route>
      

        {/* Kitchen layout */}
        <Route path="/kitchen" element={<KitchenScreen />} />



        </Routes>
    </BrowserRouter>
  );
}

export default App;
