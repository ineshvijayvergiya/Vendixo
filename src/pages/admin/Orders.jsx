import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, updateDoc, query } from 'firebase/firestore';
import { Search, Package, MapPin, ShoppingBag, Truck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendDeliveredEmail } from '../../utils/emailService'; 

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, "orders")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Orders Fetch Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });

      if (newStatus === 'Delivered') {
        await sendDeliveredEmail({
          email: order.email,
          customerName: order.customerName,
          id: order.id
        });
        toast.success(`Status: Delivered & Confirmation Email Sent! 🎁`);
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeliveryDate = async (orderId, dateValue) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { expectedDelivery: dateValue });
      toast.success("Delivery date updated! 📅");
    } catch (error) {
      toast.error("Failed to update delivery date");
    }
  };

  const formatPrice = (amount) => {
    if (typeof amount === 'string') {
      const cleanAmount = parseFloat(amount.replace(/[$,]/g, '')) || 0;
      return `$${cleanAmount.toFixed(2)}`;
    }
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (order.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 font-bold text-violet-600 uppercase tracking-widest animate-pulse">Scanning Orders...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3 uppercase italic">
                <Package className="text-violet-600" size={32} /> Vendixo Console
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Operational Logistics Hub</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Search Reference / Name" 
                    className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none w-full md:w-72 shadow-sm focus:ring-2 focus:ring-violet-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-violet-600" size={18} />
            </div>
            <select 
                className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 outline-none shadow-sm cursor-pointer hover:border-violet-200 transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="All">All Transactions</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">Order Details</th>
                <th className="px-8 py-6">Destination & Customer</th>
                <th className="px-8 py-6">Items Orderd</th>
                <th className="px-8 py-6 text-center">Net Revenue</th>
                <th className="px-8 py-6 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-violet-50/10 transition-all duration-300">
                  {/* Order ID & Date */}
                  <td className="px-8 py-6">
                    <p className="font-mono font-black text-gray-900 text-xs">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase mt-1">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : "Syncing..."}</p>
                  </td>

                  {/* Destination & Profile */}
                  <td className="px-8 py-6 max-w-xs">
                    <div className="flex flex-col gap-1">
                        <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{order.customerName}</p>
                        <div className="flex items-start gap-1.5 text-gray-500">
                            <MapPin size={12} className="mt-0.5 text-violet-500 shrink-0" />
                            <p className="text-[10px] font-bold leading-relaxed italic">
                                {typeof order.address === 'object' 
                                  ? `${order.address.houseNo}, ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zip}` 
                                  : order.address}
                            </p>
                        </div>
                    </div>
                  </td>

                  {/* Items Badge View */}
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                        {order.items && order.items.map((item, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                                <ShoppingBag size={10} /> {item.title} <span className="text-violet-600">x{item.quantity}</span>
                            </span>
                        ))}
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-8 py-6 text-center">
                    <p className="font-black text-violet-600 text-base">{formatPrice(order.totalAmount)}</p>
                    <p className="text-[9px] text-gray-300 font-bold uppercase">{order.paymentMethod || 'Online'}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <select 
                            value={order.status || 'Pending'} 
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 outline-none cursor-pointer transition-all ${getStatusColor(order.status)}`}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-400" />
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-[9px] font-black text-gray-500 uppercase outline-none focus:ring-0"
                                value={order.expectedDelivery || ""}
                                onChange={(e) => handleDeliveryDate(order.id, e.target.value)}
                            />
                        </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-gray-300 font-black uppercase tracking-[0.5em]">No Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;