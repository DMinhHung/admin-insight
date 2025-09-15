import "../assets/css/style.css";
import { Routes, Route } from "react-router-dom";
import Bills from "../container/admin/Bills";
import ProductAdmin from "../container/admin/Product/ProductAdmin";
import Staffs from "../container/admin/Staffs";
import Customers from "../container/admin/Customers";
import Dashboard from "../container/admin/Dashboard";
import App from "../components/layout/App";
import User from "../container/admin/User/User";

const AppRoutes = () => {
  return (
    <Routes>
      {/* <Route path="/login" element={<LoginHome />} />
            <Route path="/register" element={<RegisterHome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/bill" element={<Bill />} /> */}
      <Route path="/" element={<App />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/product" element={<ProductAdmin />} />
        <Route path="/user" element={<User />} />
        <Route path="/seting" element={<Dashboard />} />

        <Route path="/customers" element={<Customers />} />
        <Route path="/staffs" element={<Staffs />} />
        <Route path="/bills" element={<Bills />} />
      </Route>
    </Routes>
  );
};
export default AppRoutes;
