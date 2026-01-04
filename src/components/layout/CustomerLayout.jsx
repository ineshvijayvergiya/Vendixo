import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
// 🔥 1. Import Toaster
import { Toaster } from 'react-hot-toast';

const CustomerLayout = () => {
  return (
    <>
      {/* 🔥 2. Toaster ko sabse upar laga de taaki notifications har page pe dikhen */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
      />

      <Navbar />
      
      <div className="min-h-screen">
        <Outlet /> {/* Yahan Home, Shop, ProductDetails dikhenge */}
      </div>

      <Footer />
    </>
  );
};

export default CustomerLayout;