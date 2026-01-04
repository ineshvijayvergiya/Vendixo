import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase'; // Path check kar lena
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ShieldCheck, Lock } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔒 Sirf ye email allow hoga
  const ADMIN_EMAIL = "ineshvijay.work@gmail.com";

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Firebase se Login Check karo
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Check karo ki kya ye TERA email hai?
      // (Email ko lowercase mein convert karke check kar rahe hain taaki galti na ho)
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
         // ✅ Success! Dashboard pe bhejo
         navigate('/admin/dashboard'); 
      } else {
         // ❌ Koi aur login karne ki koshish kar raha hai
         setError("Access Denied: You are not authorized as Admin!");
         await signOut(auth); // Turant logout kar do
      }

    } catch (err) {
      console.error(err);
      // Errors ko thoda user-friendly banaya hai
      if (err.code === 'auth/wrong-password') {
        setError("Galat Password dala hai bhai!");
      } else if (err.code === 'auth/user-not-found') {
        setError("Ye email registered nahi hai.");
      } else {
        setError("Login Failed: Details check karo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={32} />
            </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">Admin Portal</h1>
        <p className="text-center text-gray-400 mb-8">Authorized Access Only</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm text-center font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Admin Email</label>
            <div className="relative">
                <input 
                  type="email" required 
                  className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" 
                  placeholder="admin@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
                <ShieldCheck size={18} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
                <input 
                  type="password" required 
                  className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                ← Back to Website
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;