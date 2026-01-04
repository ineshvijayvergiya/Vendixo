import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Heart, Search, Menu, X, Package, Settings, LogOut, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const { cart, wishlist } = useShop();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [storeName, setStoreName] = useState('Vendixo'); 
  const [searchQuery, setSearchQuery] = useState('');

  // 🔒 Admin Email Check
  const ADMIN_EMAIL = "ineshvijay.work@gmail.com";
  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const docRef = doc(db, "settings", "storeConfig");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStoreName(docSnap.data().storeName || 'Vendixo');
        }
      } catch (error) {
        console.error("Error fetching store name:", error);
      }
    };
    fetchStoreName();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 font-sans">
      
      {/* 1. TOP BLACK BAR */}
      <div className="bg-black text-white text-[10px] md:text-xs py-2 px-4 md:px-8 flex justify-between items-center uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <Package size={14}/>
            <span>Free Shipping over $50</span>
          </div>
          <div className="hidden md:flex gap-6">
            <Link to="/about" className="hover:text-violet-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-violet-400 transition-colors">Contact</Link>
            <span>Call Us 123-456-7890</span>
          </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-8">
            
            {/* Logo */}
            <Link to="/" className="text-2xl md:text-3xl font-black text-black tracking-tighter shrink-0 uppercase italic">
                {storeName}
            </Link>

            {/* SEARCH BAR (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative group">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gadgets, fashion..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-6 pl-6 pr-12 text-sm focus:ring-2 focus:ring-violet-100 focus:bg-white outline-none transition-all font-medium"
                />
                <button type="submit" className="absolute right-4 top-3 text-gray-400 group-hover:text-violet-600 transition-colors">
                    <Search size={20} />
                </button>
            </form>

            {/* Icons Right Side */}
            <div className="flex items-center gap-5 md:gap-7 text-black">
                
                {/* 🔥 FIXED PROFILE DROPDOWN */}
                {currentUser ? (
                    <div className="relative">
                        <button 
                          onClick={() => setIsProfileOpen(!isProfileOpen)}
                          className={`flex items-center gap-2 p-2 rounded-xl transition-all ${isProfileOpen ? 'bg-violet-50 text-violet-600' : 'hover:bg-gray-50'}`}
                        >
                            <User size={24} />
                            <span className="hidden lg:block text-[10px] font-black uppercase tracking-tighter">Account</span>
                        </button>
                          
                        {isProfileOpen && (
                          <>
                            {/* Overlay to close on outside click */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                            
                            {/* 🔥 Fix: Adjusted width for mobile (w-56) and spacing */}
                            <div className="absolute right-0 top-full mt-3 w-56 sm:w-60 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 rounded-[2rem] p-4 z-50 animate-in fade-in zoom-in duration-200">
                                <div className="px-4 py-3 mb-3 bg-violet-50 rounded-2xl">
                                    <p className="text-[9px] text-violet-400 font-black uppercase tracking-widest">Signed In As</p>
                                    <p className="text-xs font-black text-violet-700 truncate">{currentUser.displayName || 'Vendixo User'}</p>
                                </div>
                                
                                {/* 👇 ADMIN LINK ADDED HERE 👇 */}
                                {isAdmin && (
                                  <Link to="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 mb-2 text-[11px] font-black uppercase tracking-widest text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-lg shadow-violet-200">
                                    <LayoutDashboard size={16}/> Admin Panel
                                  </Link>
                                )}

                                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition-all">
                                  <Settings size={16}/> Profile Settings
                                </Link>
                                <Link to="/my-orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition-all">
                                  <ShoppingBag size={16}/> Order History
                                </Link>
                                
                                <div className="border-t border-gray-50 my-3 mx-2"></div>
                                
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 text-left text-[11px] font-black text-red-500 px-4 py-3 hover:bg-red-50 rounded-xl transition-all uppercase tracking-[0.2em]">
                                  <LogOut size={16}/> Sign Out
                                </button>
                            </div>
                          </>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="p-2 hover:bg-gray-50 rounded-full transition-all">
                        <User size={24} />
                    </Link>
                )}

                {/* Wishlist */}
                <Link to="/wishlist" className="relative group p-1 hover:bg-gray-50 rounded-lg transition-all">
                    <Heart size={24} className="hover:text-red-500 transition-colors"/>
                    {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">{wishlist.length}</span>}
                </Link>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Cart */}
                <Link to="/cart" className="relative group p-1 hover:bg-gray-50 rounded-lg transition-all">
                    <ShoppingCart size={24} className="hover:text-violet-600 transition-colors"/>
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">{cart.length}</span>}
                </Link>

                {/* Mobile Menu Toggle */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>
        </div>
      </div>

      {/* 3. CATEGORY MENU (Desktop) */}
      <div className="hidden md:block bg-white/80 backdrop-blur-md border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-10 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 overflow-x-auto no-scrollbar">
                <Link to="/shop" className="text-gray-900 hover:text-violet-600 transition-colors whitespace-nowrap">Explore All</Link>
                <Link to="/shop?category=Computers" className="hover:text-violet-600 transition-colors whitespace-nowrap">Computers</Link>
                <Link to="/shop?category=Tablets" className="hover:text-violet-600 transition-colors whitespace-nowrap">Tablets</Link>
                <Link to="/shop?category=Drones" className="hover:text-violet-600 transition-colors whitespace-nowrap">Drones & Cameras</Link>
                <Link to="/shop?category=Audio" className="hover:text-violet-600 transition-colors whitespace-nowrap">Audio</Link>
                <Link to="/clothing" className="text-violet-600 font-serif italic text-lg hover:underline whitespace-nowrap px-2 lowercase tracking-normal">clothing</Link>
                <Link to="/shop?sale=true" className="text-red-500 hover:text-red-600 transition-colors whitespace-nowrap">Outlet Sale</Link>
            </div>
         </div>
      </div>

      {/* MOBILE MENU (Big Drawer) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white fixed inset-0 top-[110px] z-50 p-6 space-y-8 animate-slideIn overflow-y-auto pb-20">
          <form onSubmit={handleSearchSubmit} className="relative">
             <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..." 
                className="w-full bg-gray-100 p-4 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-violet-200"
             />
             <Search className="absolute right-4 top-4 text-gray-400" size={20}/>
          </form>

          <div className="space-y-6">
              <Link to="/shop" className="block text-2xl font-black uppercase tracking-tighter" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
              <Link to="/clothing" className="block text-2xl font-serif italic text-violet-600" onClick={() => setIsMenuOpen(false)}>Clothing</Link>
              <Link to="/shop?sale=true" className="block text-2xl font-black uppercase text-red-500" onClick={() => setIsMenuOpen(false)}>Outlet</Link>
              
              <div className="border-t border-gray-100 pt-6 space-y-4">
                  {/* 👇 ADMIN LINK IN MOBILE MENU 👇 */}
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-sm font-black text-violet-600 uppercase tracking-widest bg-violet-50 p-3 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard size={18} /> Admin Dashboard
                    </Link>
                  )}

                  <Link to="/profile" className="block text-sm font-bold text-gray-500 uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                  <Link to="/my-orders" className="block text-sm font-bold text-gray-500 uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Order History</Link>
                  <button onClick={handleLogout} className="block text-sm font-black text-red-500 uppercase tracking-widest">Sign Out</button>
              </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;