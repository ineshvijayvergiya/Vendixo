import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedAdminRoute = () => {
  const { currentUser, loading } = useAuth();
  
  // 🔥 Wahi email jo tune Profile mein set ki hai
  const ADMIN_EMAIL = "ineshvijay.work@gmail.com"; 

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        <span className="ml-4">Verifying Admin Access...</span>
      </div>
    );
  }

  const isAdmin = currentUser && currentUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  // Agar admin hai toh Outlet (Admin pages) dikhao, warna login bhej do
  return isAdmin ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default ProtectedAdminRoute;