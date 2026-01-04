import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔥 Real-time Notifications Fetching
  useEffect(() => {
    if (!currentUser) return;

    // Query: Mere ID wale messages + "ALL" wale messages (Broadcasts)
    const q = query(
      collection(db, "notifications"),
      where("targetUsers", "array-contains", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark as Read Logic (Optional: Hum bas delete kar denge ya color change kar denge)
  const markAsRead = async (notifId) => {
     const notifRef = doc(db, "notifications", notifId);
     await updateDoc(notifRef, { read: true });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-600 hover:text-violet-600 transition-colors">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button onClick={() => setIsOpen(false)}><X size={16} className="text-gray-400 hover:text-red-500"/></button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No new notifications.</p>
            ) : (
                notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-60' : 'bg-violet-50/50'}`}
                        onClick={() => markAsRead(notif.id)}
                    >
                        <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-violet-600'}`}></div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{notif.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">
                                    {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;