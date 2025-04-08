import LoginHome from "../container/home/Auth/LoginHome";
import Profile from "../container/home/Auth/Profile";
import RegisterHome from "../container/home/Auth/RegisterHome";
import Wishlist from "../container/home/Auth/Wishlist";
import "../assets/css/style.css";
import { Routes, Route } from "react-router-dom";
import Bills from "../container/admin/Bills";
import ProductAdmin from "../container/admin/Product/ProductAdmin";
import Staffs from "../container/admin/Staffs";
import Customers from "../container/admin/Customers";
import Dashboard from "../container/admin/Dashboard";
import Bill from "../container/home/Auth/Bill";
import Product from "../container/home/Product";
import Product_detail from "../container/home/Product_detail";
import Shopping_cart from "../container/home/Shopping_cart";
import Checkout from "../container/home/Checkout";
import About from "../container/home/About";
import Contact from "../container/home/Contact";
import Search from "../container/home/Search";
import Indexs from "../container/home/Index";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Login Home */}
            <Route path="/login" element={<LoginHome />} />
            <Route path="/register" element={<RegisterHome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/bill" element={<Bill />} />

            {/* Home */}
            <Route path="/" element={<Indexs />} />
            <Route path="/product" element={<Product />} />
            <Route path="/productdetail/:id" element={<Product_detail />} />
            <Route path="/shopping_cart" element={<Shopping_cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<Search />} />
            {/* <Route path="/checkout" element={<Checkout />} /> */}

            {/* Login Home */}
            {/* <Route path="/loginadmin" element={<LoginAdmin />} />
        <Route path="/registeradmin" element={<RegisterAdmin />} /> */}
            {/* Admin */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/staffs" element={<Staffs />} />
            <Route path="/productadmin" element={<ProductAdmin />} />
            <Route path="/bills" element={<Bills />} />
        </Routes>
    );
};
export default AppRoutes;
