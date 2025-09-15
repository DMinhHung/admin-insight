import "../assets/css/style.css";
import { Routes, Route, Navigate  } from "react-router-dom";
import Product from "../pages/Product/Product";
import Staffs from "../pages/Staffs/Staffs";
import Customers from "../pages/Customers/Customers";
import Dashboard from "../pages/Dashboard/Dashboard";
import App from "../components/layout/App";
import User from "../pages/User/User";
import Login from "../pages/Login/Login";
import RequireAuth from "../components/RequireAuth";
import Brand from "../pages/Brand/Brand";
import Category from "../pages/Category/Category";

const AppRoutes = () => {
    const token = localStorage.getItem("accessToken");
    return (
    <Routes>
      <Route path="/login"element={token ? <Navigate to="/dashboard" replace /> : <Login />}/>
      <Route path="/"element={<RequireAuth><App /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="brand" element={<Brand />} />
        <Route path="category" element={<Category />} />
        <Route path="product" element={<Product />} />
        <Route path="user" element={<User />} />
        <Route path="customers" element={<Customers />} />
        <Route path="staffs" element={<Staffs />} />
      </Route>
      <Route path="*"element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}/>
    </Routes>
  );
};
export default AppRoutes;
