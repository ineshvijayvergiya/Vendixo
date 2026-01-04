import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DollarSign, ShoppingBag, Clock, Users, ArrowRight } from 'lucide-react'; // 🔥 ArrowRight add kiya
import { useNavigate } from 'react-router-dom'; // 🔥 Navigation ke liye

const Dashboard = () => {
  const navigate = useNavigate(); // 🔥 Hook initialize kiya
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const orders = ordersSnapshot.docs.map(doc => doc.data());

        const totalSales = orders.reduce((sum, order) => {
          let amount = order.totalAmount;
          if (typeof amount === 'string') {
            amount = parseFloat(amount.replace(/[$,]/g, '')) || 0;
          }
          return sum + (Number(amount) || 0);
        }, 0);

        const pendingOrders = orders.filter(order => 
          order.status?.toLowerCase() === 'pending'
        ).length;
        
        const uniqueCustomers = new Set(orders.map(o => o.email)).size;

        setStats({
          totalSales,
          totalOrders: orders.length,
          pendingOrders,
          customers: uniqueCustomers
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-violet-600 font-bold">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 🔥 HEADER WITH EXIT OPTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm font-medium">Welcome back, Boss!</p>
        </div>
        
        {/* Wapas Shop jaane ka button */}
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-2 bg-white border-2 border-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-900 hover:text-white transition-all shadow-sm"
        >
          View Live Store 
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Revenue" 
          value={`$${Number(stats.totalSales).toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          color="bg-violet-500" 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Active Customers" 
          value={stats.customers} 
          icon={Users} 
          color="bg-blue-500" 
        />
      </div>

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Everything is under control! 👋</h2>
        <p className="opacity-90 font-medium">
          Quickly check <span className="underline">{stats.pendingOrders} new orders</span> or manage your product inventory.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;