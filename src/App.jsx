import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext'; 
import { ShopProvider } from './context/ShopContext'; 

// Layouts & Utils
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute'; // 👈 Ye file update karni hai
import ScrollToTop from './components/common/ScrollToTop';
import ForgotPassword from './pages/auth/ForgotPassword';

// Customer Pages
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';
import FashionHome from './pages/customer/FashionHome';
import Wishlist from './pages/customer/Wishlist';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProductDetails from './pages/customer/ProductDetails'; 
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import About from './pages/customer/About';
import Contact from './pages/customer/Contact';
import HelpCenter from './pages/customer/HelpCenter';
import UserProfile from './pages/customer/UserProfile'; 
import MyOrders from './pages/customer/MyOrders';

// Admin Pages
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products'; 
import AddProduct from './pages/admin/AddProduct';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';
import EditProduct from './pages/admin/EditProduct';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider> 
        <ScrollToTop />
        <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        
        <Routes>
          {/* --- CUSTOMER ROUTES --- */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/clothing" element={<FashionHome />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* 🔒 Is route ke andar wahi ghusega jiske paas tumhari email hogi */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="customers" element={<AdminUsers />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

        </Routes>
      </ShopProvider>
    </AuthProvider>
  );
}