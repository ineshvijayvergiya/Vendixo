import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package, Truck, XCircle, LayoutDashboard, Calendar, Clock } from 'lucide-react'; 
import HelpBanner from '../../components/common/HelpBanner';
// Firebase Imports
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'; 
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 ADMIN EMAIL (Matched with your previous settings)
  const ADMIN_EMAIL = "ineshvijay.work@gmail.com";

  // LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // ✅ CANCEL ORDER FUNCTION
  const handleCancelOrder = async (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <span className="text-sm font-medium text-gray-800">
          Are you sure you want to cancel this order?
        </span>
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const orderRef = doc(db, "orders", orderId);
                await updateDoc(orderRef, { status: 'Cancelled' });
                toast.success("Order has been cancelled", { 
                    icon: '🗑️',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' } 
                });
              } catch (error) {
                toast.error("Could not cancel order.");
              }
            }}
          >
            Yes, Cancel
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-200"
            onClick={() => toast.dismiss(t.id)}
          >
            Keep Order
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sorting: Latest order on top
        ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setOrders(ordersData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [currentUser]);

  const getStatusStep = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing') return 1;
    if (s === 'cancelled') return -1;
    return 0; // Pending
  };

  if (!loading && !currentUser) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white shadow-sm py-12 px-6 mb-8 border-b border-gray-100">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-200">
               <User size={48} />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back, {currentUser?.displayName || "Valued Member"}</h1>
               <p className="text-gray-500 font-medium">{currentUser?.email}</p>
            </div>
            
            <div className="flex items-center gap-4">
               {/* 🔥 SECRET ADMIN BUTTON */}
               {currentUser?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() && (
                 <button 
                   onClick={() => navigate('/admin/dashboard')}
                   className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-md"
                 >
                   <LayoutDashboard size={18} /> Admin Panel
                 </button>
               )}

               <button 
                   onClick={handleLogout}
                   className="bg-white hover:bg-red-50 text-red-500 border border-red-200 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm"
               >
                   <LogOut size={18} /> Sign Out
               </button>
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <Package className="text-violet-600" size={28}/> My Orders
        </h2>

        {/* ORDERS LIST */}
        {orders.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="text-gray-300" size={40} />
                </div>
                <p className="text-gray-500 text-lg mb-6">You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/shop')} className="bg-violet-600 text-white px-8 py-3 rounded-full font-bold hover:bg-violet-700 transition-all shadow-md">
                    Start Shopping
                </button>
            </div>
        ) : (
            <div className="space-y-8">
                {orders.map((order) => (
                    <div key={order.id} className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all ${order.status === 'Cancelled' ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                        {/* Order Header */}
                        <div className="bg-gray-50/50 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Order ID</p>
                                    <p className="font-mono font-bold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Purchased On</p>
                                    <p className="font-bold text-gray-700 text-sm">
                                       {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Paid</p>
                                    <p className="font-bold text-violet-600 text-sm">
                                       {typeof order.totalAmount === 'number' ? `$${order.totalAmount.toFixed(2)}` : order.totalAmount}
                                    </p>
                                </div>
                            </div>
                            
                            {/* CANCEL BUTTON */}
                            {order.status === 'Pending' && (
                                <button 
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-5 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>

                        {/* Order Body */}
                        <div className="p-8">
                            {order.status !== 'Cancelled' ? (
                                <>
                                    {/* 🔥 EXPECTED DELIVERY BOX */}
                                    {order.expectedDelivery && (
                                      <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 animate-fadeIn">
                                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Calendar size={18} className="text-green-600" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Estimated Delivery</p>
                                            <p className="text-sm font-bold">
                                              Arriving by: {new Date(order.expectedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                          </div>
                                      </div>
                                    )}

                                    {/* Tracking Bar */}
                                    <div className="mb-10">
                                        <div className="flex justify-between text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">
                                            <span className={getStatusStep(order.status) >= 0 ? "text-violet-600" : ""}>Confirmed</span>
                                            <span className={getStatusStep(order.status) >= 1 ? "text-violet-600" : ""}>Processing</span>
                                            <span className={getStatusStep(order.status) >= 2 ? "text-violet-600" : ""}>In Transit</span>
                                            <span className={getStatusStep(order.status) >= 3 ? "text-green-600" : ""}>Delivered</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex p-0.5">
                                            <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: '25%' }}></div>
                                            <div className={`h-full rounded-full transition-all duration-700 delay-100 w-1/4 ${getStatusStep(order.status) >= 1 ? 'bg-violet-500' : 'bg-transparent'}`}></div>
                                            <div className={`h-full rounded-full transition-all duration-700 delay-200 w-1/4 ${getStatusStep(order.status) >= 2 ? 'bg-violet-500' : 'bg-transparent'}`}></div>
                                            <div className={`h-full rounded-full transition-all duration-700 delay-300 w-1/4 ${getStatusStep(order.status) >= 3 ? 'bg-green-500' : 'bg-transparent'}`}></div>
                                        </div>
                                    </div>

                                    <div className="mb-8 p-4 bg-violet-50 border border-violet-100 text-violet-700 rounded-xl text-sm flex gap-3 items-center">
                                        <Truck size={18} />
                                        <span className="font-semibold">Current Status: <span className="capitalize">{order.status || 'Processing'}</span></span>
                                    </div>
                                </>
                            ) : (
                                <div className="mb-8 p-5 bg-gray-50 border border-gray-200 text-gray-400 rounded-2xl text-sm flex gap-3 items-center italic">
                                    <XCircle size={20} />
                                    <span className="font-bold text-lg">Order Cancelled</span>
                                </div>
                            )}

                            {/* Item List */}
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex gap-6 items-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-base">{item.title}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Quantity: {item.quantity} · Price: ${item.price}</p>
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
      
      <div className="mt-24">
        <HelpBanner />
      </div>
    </div>
  );
};

export default UserProfile;