import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';

const MyOrders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
        navigate('/login');
        return;
    }

    const fetchOrders = async () => {
      try {
        // 🔥 Query: Sirf current user ke orders lao, aur latest pehle dikhao
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc") 
        );
        
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Note: Agar index error aaye to console check karna
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  // Status Colors Helper
  const getStatusColor = (status) => {
      switch(status) {
          case 'Delivered': return 'text-green-600 bg-green-100';
          case 'Shipped': return 'text-blue-600 bg-blue-100';
          case 'Cancelled': return 'text-red-600 bg-red-100';
          default: return 'text-yellow-600 bg-yellow-100'; // Pending/Processing
      }
  };

  const getStatusIcon = (status) => {
      switch(status) {
          case 'Delivered': return <CheckCircle size={16}/>;
          case 'Shipped': return <Truck size={16}/>;
          case 'Cancelled': return <XCircle size={16}/>;
          default: return <Clock size={16}/>;
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Package className="text-violet-600" /> My Orders
        </h1>

        {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package size={40}/>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
                <button onClick={() => navigate('/shop')} className="bg-violet-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-violet-700 transition-colors">
                    Start Shopping
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        
                        {/* ORDER HEADER */}
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <p className="text-gray-500 font-bold text-xs uppercase">Order Placed</p>
                                    <p className="font-medium text-gray-900">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toDateString() : 'Just now'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-bold text-xs uppercase">Total</p>
                                    <p className="font-medium text-gray-900">${order.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-bold text-xs uppercase">Order ID</p>
                                    <p className="font-medium text-gray-900">#{order.orderId || order.id.slice(0,8)}</p>
                                </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)} {order.status}
                            </div>
                        </div>

                        {/* ORDER ITEMS */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} {item.size && `| Size: ${item.size}`}</p>
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            ${item.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;