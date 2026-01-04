import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Bell, Send, Users, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
// 🔥 Email Helpers Import
import { sendStockAlertEmail, sendWelcomeEmail } from '../../utils/emailService';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('waitlist'); 
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "waitlist"));
      setWaitlist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      toast.error("Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  // 🔥 1. RESTOCK ALERT (Email + DB Notification)
  const handleRestockAlert = async (waitItem) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">Send Vendixo Restock Email to {waitItem.userEmail}?</p>
        <div className="flex gap-2">
          <button 
            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // A. Send Automated Email via Backend
                await sendStockAlertEmail(waitItem.userEmail, waitItem.productName, waitItem.productId);
                
                // B. Add to In-App Notifications
                await addDoc(collection(db, "notifications"), {
                    title: "🎉 Back in Stock!",
                    message: `Great news! ${waitItem.productName} is back in stock at Vendixo. Grab it now!`,
                    targetUsers: [waitItem.userId],
                    read: false,
                    createdAt: serverTimestamp()
                });

                // C. Clean up Waitlist
                await deleteDoc(doc(db, "waitlist", waitItem.id));
                setWaitlist(prev => prev.filter(item => item.id !== waitItem.id));
                
                toast.success("Vendixo Restock Email Sent! 🔥");
              } catch (err) {
                toast.error("Error triggering email alert");
              }
            }}
          >Send Now</button>
          <button className="bg-gray-200 px-3 py-1 rounded text-xs" onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  // 🔥 2. BROADCAST (Email Blast to All Customers)
  const sendBroadcast = async () => {
    if (!title || !message) return toast.error("Please fill title and message");
    
    setLoading(true);
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const customers = usersSnap.docs.map(doc => doc.data());
        
        if (customers.length === 0) {
            toast.error("No customers found.");
            return;
        }

        // Parallel Email Blast
        const emailPromises = customers.map(user => 
            sendWelcomeEmail({ email: user.email, displayName: user.displayName })
        );

        // Add to Global Notifications DB
        await addDoc(collection(db, "notifications"), {
            title,
            message,
            targetUsers: customers.map(u => u.uid),
            read: false,
            createdAt: serverTimestamp()
        });

        await Promise.all(emailPromises);
        toast.success(`Vendixo Broadcast sent to ${customers.length} people! 📢`);
        setTitle('');
        setMessage('');
    } catch (error) {
        console.error(error);
        toast.error("Failed to execute broadcast");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Vendixo Alerts</h1>
          <button onClick={fetchWaitlist} className={`p-2 bg-white rounded-full shadow-sm ${loading ? 'animate-spin' : ''}`}><RefreshCw size={20}/></button>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
            onClick={() => setActiveTab('waitlist')} 
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'waitlist' ? 'bg-violet-600 text-white shadow-xl shadow-violet-100' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
            <Bell size={16}/> Waitlist ({waitlist.length})
        </button>
        <button 
            onClick={() => setActiveTab('broadcast')} 
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'broadcast' ? 'bg-violet-600 text-white shadow-xl shadow-violet-100' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
            <Send size={16}/> Broadcast
        </button>
      </div>

      {activeTab === 'waitlist' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] border-b">
                        <tr>
                            <th className="p-6">Product Item</th>
                            <th className="p-6">Customer</th>
                            <th className="p-6">Date Logged</th>
                            <th className="p-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {waitlist.length === 0 ? (
                            <tr><td colSpan="4" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No pending stock alerts.</td></tr>
                        ) : (
                            waitlist.map((item) => (
                                <tr key={item.id} className="hover:bg-violet-50/20 transition-all duration-300">
                                    <td className="p-6 font-black text-gray-900 uppercase tracking-tighter">{item.productName}</td>
                                    <td className="p-6 font-bold text-gray-500">{item.userEmail}</td>
                                    <td className="p-6 text-gray-400 text-[10px] font-bold">
                                        {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just Now'}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                          onClick={() => handleRestockAlert(item)} 
                                          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md active:scale-95"
                                        >
                                           Notify Now
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}

      {activeTab === 'broadcast' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 max-w-2xl mx-auto">
              <div className="text-center mb-10">
                 <div className="bg-violet-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-600">
                     <Users size={36}/>
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Blast Announcement</h2>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Email + Push to all customers</p>
              </div>
              
              <div className="space-y-6">
                  <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-bold transition-all" placeholder="E.g. Weekend Flash Sale!"/>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Context</label>
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-medium transition-all" placeholder="Write your message details here..."></textarea>
                  </div>
                  <button onClick={sendBroadcast} disabled={loading} className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-violet-600 shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                      {loading ? "Transmitting..." : "Execute Global Blast"}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminNotifications;