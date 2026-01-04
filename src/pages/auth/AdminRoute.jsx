import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Package,
  ShieldCheck
} from 'lucide-react';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

const ProtectedAdminRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 🔥 TERA ADMIN EMAIL
  const ADMIN_EMAIL = "ineshvijay.work@gmail.com";

  // --- 1. LOGIN & SECURITY CHECK ---

  // Agar loading hai to Spinner dikhao
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        <span className="ml-4 font-bold animate-pulse">Verifying Access...</span>
      </div>
    );
  }

  // Agar user nahi hai ya Email match nahi hua -> Login pe bhejo
  const isAdmin = currentUser && currentUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // --- 2. ADMIN PANEL UI / LAYOUT ---

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin-login');
  };

  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/products', name: 'Products', icon: <Package size={20} /> }, // Route check kr lena
    { path: '/admin/orders', name: 'Orders', icon: <ShoppingBag size={20} /> },
    { path: '/admin/users', name: 'Customers', icon: <Users size={20} /> },
    { path: '/admin/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR (Desktop & Mobile) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider">VENDIXO</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button (Bottom) */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header (Mobile Toggle & Profile) */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center md:hidden">
           <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
             <Menu size={24} />
           </button>
           <span className="font-bold text-gray-800">Admin Dashboard</span>
           <div className="w-6"></div> {/* Spacer for centering */}
        </header>

        {/* Page Content (Outlet jahan Dashboard dikhega) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
           {/* Yahan tera asli Dashboard page render hoga */}
           <Outlet /> 
        </main>
      </div>

    </div>
  );
};

export default ProtectedAdminRoute;