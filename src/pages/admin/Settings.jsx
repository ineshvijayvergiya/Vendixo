import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Save, Store, User, Lock, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('store'); // 'store' or 'account'

  // Store Config State
  const [storeConfig, setStoreConfig] = useState({
    storeName: 'TechShed',
    supportEmail: 'support@techshed.com',
    shippingFee: 10,
    currency: '$'
  });

  // Admin Profile State
  const [adminName, setAdminName] = useState(currentUser?.displayName || '');

  // 🔥 1. Database se purani settings lao
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "storeConfig"); // Fixed ID 'storeConfig'
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStoreConfig(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // 🔥 2. Store Settings Save Karo
  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 'setDoc' use kar rahe hain with merge: true
      // Iska matlab agar document nahi hai to ban jayega, hai to update ho jayega
      await setDoc(doc(db, "settings", "storeConfig"), {
        ...storeConfig,
        shippingFee: Number(storeConfig.shippingFee)
      }, { merge: true });

      toast.success("Store Settings Saved! ✅");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 3. Admin Profile Update Karo
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: adminName
        });
        toast.success("Profile Updated! (Refresh to see changes)");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 4. Password Reset Email Bhejo
  const handlePasswordReset = async () => {
    const confirm = window.confirm(`Send password reset email to ${currentUser.email}?`);
    if (confirm) {
      try {
        await sendPasswordResetEmail(auth, currentUser.email);
        toast.success("Email Sent! Check your inbox. 📧");
      } catch (error) {
        toast.error("Error sending email");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR (Tabs) --- */}
        <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                    onClick={() => setActiveTab('store')}
                    className={`w-full text-left px-6 py-4 flex items-center gap-3 font-bold transition-all ${activeTab === 'store' ? 'bg-violet-50 text-violet-600 border-l-4 border-violet-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Store size={20}/> Store Configuration
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-6 py-4 flex items-center gap-3 font-bold transition-all ${activeTab === 'account' ? 'bg-violet-50 text-violet-600 border-l-4 border-violet-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <User size={20}/> My Account
                </button>
            </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1">
            
            {/* 🏪 STORE SETTINGS TAB */}
            {activeTab === 'store' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Store className="text-violet-600"/> Store General Settings
                    </h2>
                    
                    <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                                <input type="text" value={storeConfig.storeName} onChange={(e) => setStoreConfig({...storeConfig, storeName: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                                <input type="email" value={storeConfig.supportEmail} onChange={(e) => setStoreConfig({...storeConfig, supportEmail: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Fee (Global)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                                    <input type="number" value={storeConfig.shippingFee} onChange={(e) => setStoreConfig({...storeConfig, shippingFee: e.target.value})} className="w-full p-3 pl-8 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Currency Symbol</label>
                                <input type="text" value={storeConfig.currency} onChange={(e) => setStoreConfig({...storeConfig, currency: e.target.value})} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <button type="submit" disabled={loading} className="bg-violet-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-violet-700 shadow-lg flex items-center gap-2 transition-all">
                                {loading ? "Saving..." : <><Save size={20}/> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 👤 ACCOUNT SETTINGS TAB */}
            {activeTab === 'account' && (
                <div className="space-y-8 animate-fadeIn">
                    
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="text-violet-600"/> Admin Profile
                        </h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email (Read Only)</label>
                                <input type="text" value={currentUser?.email} disabled className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>
                            <button type="submit" disabled={loading} className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-violet-700 transition-all">
                                Update Profile
                            </button>
                        </form>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 border-l-4 border-l-red-500">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="text-red-500"/> Security & Login
                        </h2>
                        <p className="text-gray-500 mb-6">Need to change your password? We will send you a secure link to your email.</p>
                        
                        <button onClick={handlePasswordReset} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2">
                            <Lock size={18} /> Send Password Reset Email
                        </button>
                    </div>

                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Settings;