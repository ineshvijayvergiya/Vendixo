import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
  // Hum check karenge ki browser ki memory (localStorage) mein 'isAdmin' likha hai ya nahi
  const isAdmin = localStorage.getItem('isAdminLoggedIn');

  // Agar 'true' hai, toh <Outlet /> (Dashboard) dikhao
  // Agar nahi hai, toh <Navigate /> karke Login page pe bhej do
  return isAdmin === 'true' ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default ProtectedAdminRoute;