import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Search, Mail, User, Send, X, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sending, setSending] = useState(false);

  // 🔥 Fetch Users Logic
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Agar collection nahi bani abhi tak toh crash na ho
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!msgTitle || !msgBody) return toast.error("Please fill all fields");

    setSending(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: msgTitle,
        message: msgBody,
        targetUsers: [selectedUser.uid || selectedUser.id], 
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success(`Message sent to ${selectedUser.displayName || 'User'}! 🚀`);
      setSelectedUser(null);
      setMsgTitle('');
      setMsgBody('');
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-violet-600"></div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UsersIcon className="text-violet-600" /> User Directory
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Managing {users.length} registered customers</p>
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

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b">
              <tr>
                <th className="px-6 py-5">Customer Profile</th>
                <th className="px-6 py-5">Email Address</th>
                <th className="px-6 py-5">Registration Date</th>
                <th className="px-6 py-5 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                 <tr><td colSpan="4" className="p-20 text-center text-gray-400 font-medium italic">No users found matching your search.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold border border-violet-200 shadow-sm overflow-hidden">
                                {user.photoURL ? <img src={user.photoURL} alt="" /> : <User size={20}/>}
                            </div>
                            <p className="font-bold text-gray-800">{user.displayName || "New Member"}</p>
                        </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-600">
                        {user.email}
                    </td>

                    <td className="px-6 py-4 text-gray-400 font-semibold">
                        {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : "Recently"}
                    </td>

                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedUser(user)}
                            className="bg-white border border-violet-200 text-violet-600 px-5 py-2 rounded-xl font-bold text-xs transition-all hover:bg-violet-600 hover:text-white shadow-sm"
                        >
                            Send Message
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 scale-in-center">
                <div className="bg-violet-600 p-6 flex justify-between items-center text-white">
                    <div>
                        <h3 className="font-bold text-lg">Direct Notification</h3>
                        <p className="text-violet-100 text-xs">To: {selectedUser.email}</p>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSendNotification} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subject Title</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="e.g. Voucher Inside! 🎁"
                            value={msgTitle}
                            onChange={(e) => setMsgTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message Body</label>
                        <textarea 
                            rows="4" 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Type your message to the customer..."
                            value={msgBody}
                            onChange={(e) => setMsgBody(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={sending}
                        className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 flex items-center justify-center gap-3 shadow-xl shadow-violet-100 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {sending ? "Sending Message..." : <><Send size={18}/> Deliver Message</>}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;