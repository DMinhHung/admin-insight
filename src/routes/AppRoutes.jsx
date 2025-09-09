import "../assets/css/style.css";
import { Routes, Route, Navigate  } from "react-router-dom";
import ProductAdmin from "../pages/Product/ProductAdmin";
import Staffs from "../pages/Staffs/Staffs";
import Customers from "../pages/Customers/Customers";
import Dashboard from "../pages/Dashboard/Dashboard";
import App from "../components/layout/App";
import User from "../pages/User/User";

const AppRoutes = () => {
    return (
        <Routes>
            {/* <Route path="/login" element={<LoginHome />} />
            <Route path="/register" element={<RegisterHome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/bill" element={<Bill />} /> */
            }
            <Route path="/" element={<App />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="/product" element={<ProductAdmin />} />
                <Route path="/user" element={<User />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/staffs" element={<Staffs />} />
            </Route>
        </Routes>
    );
};
export default AppRoutes;
