import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../config/firebase'; 
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // 🔥 Context zaroori hai auto-check ke liye
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Global Auth State
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔒 TERA ADMIN EMAIL (Isko same rakhna)
  const ADMIN_EMAIL = "ineshvijay.work@gmail.com";

  // 🔥 MAGIC 1: Auto-Redirect agar pehle se login ho
  useEffect(() => {
    if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      // User pehle se andar hai, form mat dikhao, seedha dashboard bhejo
      navigate('/admin/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Firebase Login Try karo
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // 2. Security Check: Kya ye Admin hai?
      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
         toast.success("Welcome back, Boss! 🫡");
         navigate('/admin/dashboard'); 
      } else {
         // ❌ Koi aur login karne ki koshish kar raha hai
         setError("Access Denied: You are not authorized as Admin!");
         await signOut(auth); // Turant logout maaro
         toast.error("Unauthorized Access");
      }

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError("Incorrect Password.");
      } else if (err.code === 'auth/user-not-found') {
        setError("Admin email not found.");
      } else {
        setError("Login Failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <ShieldCheck size={32} />
            </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Admin Portal</h1>
        <p className="text-center text-gray-400 mb-8 text-sm">Secure Access for Inesh Only</p>

        {/* Error Message */}
        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Email</label>
            <div className="relative group">
                <input 
                  type="email" required 
                  className="w-full p-3.5 pl-10 bg-gray-700/50 border border-gray-600 text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all group-hover:bg-gray-700" 
                  placeholder="admin@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
                <ShieldCheck size={18} className="absolute left-3 top-4 text-gray-500 group-focus-within:text-violet-500 transition-colors" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative group">
                <input 
                  type="password" required 
                  className="w-full p-3.5 pl-10 bg-gray-700/50 border border-gray-600 text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all group-hover:bg-gray-700" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3 top-4 text-gray-500 group-focus-within:text-violet-500 transition-colors" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-violet-900/20"
          >
            {loading ? "Verifying Access..." : "Access Dashboard"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                ← Back to Main Website
            </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;