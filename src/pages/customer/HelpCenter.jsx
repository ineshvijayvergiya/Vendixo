import React from 'react';
import HelpBanner from '../../components/common/HelpBanner';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-white">
       <div className="bg-black text-white py-20 text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-400">How can we help you today?</p>
          <input type="text" placeholder="Search for answers..." className="mt-6 w-full max-w-md px-6 py-3 rounded-full text-black outline-none" />
       </div>
       
       <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
             <h3 className="font-bold text-xl mb-2">Shipping & Delivery</h3>
             <p className="text-gray-600">Track your order, shipping rates, and delivery times.</p>
          </div>
          <div className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
             <h3 className="font-bold text-xl mb-2">Returns & Refunds</h3>
             <p className="text-gray-600">How to return an item and get your money back.</p>
          </div>
          <div className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
             <h3 className="font-bold text-xl mb-2">Orders & Payment</h3>
             <p className="text-gray-600">Manage your orders and payment methods.</p>
          </div>
          <div className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
             <h3 className="font-bold text-xl mb-2">Account Issues</h3>
             <p className="text-gray-600">Login problems and profile settings.</p>
          </div>
       </div>
       <HelpBanner />
    </div>
  );
};
export default HelpCenter;