import logo from './logo.svg';
import './assets/css/style.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from './container/home/Index';
import Product from './container/home/Product';
import Product_detail from './container/home/Product_detail';
import Shopping_cart from './container/home/Shopping_cart';
import Checkout from './container/home/Checkout';
import LoginHome from './container/home/Auth/LoginHome';
import RegisterHome from './container/home/Auth/RegisterHome';
import Dashboard from './container/admin/Dashboard';
import Customers from './container/admin/Customers';
import Staffs from './container/admin/Staffs';
import ProductAdmin from './container/admin/Product/ProductAdmin';
import Bills from './container/admin/Bills';
import LoginAdmin from './container/admin/login/LoginAdmin';
import RegisterAdmin from './container/admin/login/RegisterAdmin';
import About from './container/home/About';
import Contact from './container/home/Contact';
import Profile from './container/home/Auth/Profile';
import Wishlist from './container/home/Auth/Wishlist';
import Bill from './container/home/Auth/Bill';
import Search from './container/home/Search';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Home */}
        <Route path="/login" element={<LoginHome />} />
        <Route path="/register" element={<RegisterHome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/bill" element={<Bill />} />
        {/* Home */}
        <Route path="/" element={<Index />} />
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
    </Router>
  );
}

export default App;