import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Mail, User, MapPin, ShoppingBag, ExternalLink } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const orders = querySnapshot.docs.map(doc => doc.data());

        const customerMap = {};

        orders.forEach(order => {
          const email = order.email;
          if (!email) return; // Safety check
          
          if (!customerMap[email]) {
            customerMap[email] = {
              id: order.userId || 'N/A',
              name: order.customerName || 'Unknown Customer',
              email: order.email,
              address: order.address || 'No address provided',
              totalOrders: 0,
              totalSpent: 0,
              lastActive: order.createdAt
            };
          }

          // ✅ FIX: String se symbols hatao taaki calculation crash na ho
          let amount = order.totalAmount;
          if (typeof amount === 'string') {
            amount = parseFloat(amount.replace(/[$,]/g, '')) || 0;
          }

          customerMap[email].totalOrders += 1;
          customerMap[email].totalSpent += (Number(amount) || 0);
          
          if (order.createdAt > customerMap[email].lastActive) {
            customerMap[email].lastActive = order.createdAt;
          }
        });

        const customersArray = Object.values(customerMap);
        setCustomers(customersArray);

      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Analyzing customer data...</p>
        </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Insights</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Lifetime value and purchase history of your clients</p>
        </div>
        
        <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none shadow-sm transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b">
              <tr>
                <th className="px-6 py-5">Client Info</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5 text-center">Volume</th>
                <th className="px-6 py-5">LTV (Lifetime Value)</th>
                <th className="px-6 py-5 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                 <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-medium">No customers found in records.</td></tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                    <tr key={index} className="hover:bg-violet-50/30 transition-colors">
                    
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shadow-violet-100">
                                {customer.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{customer.name}</p>
                                <p className="text-[10px] font-mono text-gray-400">UID: {customer.id.slice(0, 8)}</p>
                            </div>
                        </div>
                    </td>

                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium italic">
                            <MapPin size={14} className="text-gray-300" /> 
                            <span className="max-w-[180px] truncate">{customer.address}</span>
                        </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold text-xs border">
                            {customer.totalOrders} Orders
                        </span>
                    </td>

                    <td className="px-6 py-4 text-green-600 font-black text-base">
                        ${Number(customer.totalSpent || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>

                    <td className="px-6 py-4 text-right">
                        <a 
                            href={`mailto:${customer.email}`} 
                            className="bg-white border border-gray-200 hover:border-violet-600 hover:text-violet-600 p-2.5 rounded-xl inline-flex items-center gap-2 transition-all shadow-sm text-xs font-bold text-gray-600"
                        >
                            <Mail size={16} /> Reach Out
                        </a>
                    </td>

                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;