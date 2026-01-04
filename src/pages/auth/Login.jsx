import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase'; 
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; 
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { sendLoginAlertEmail, sendWelcomeEmail } from '../../utils/emailService'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔥 1. Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // 🔐 Trigger Login Alert Email (Vendixo Security)
      // Note: Agar email service setup nahi hai toh is line ko comment kar dena abhi ke liye
      try {
        await sendLoginAlertEmail(user);
      } catch (emailErr) {
        console.log("Email service error (ignoring for login flow):", emailErr);
      }

      toast.success("Welcome back to Vendixo! 👋");
      navigate('/'); 
    } catch (err) {
      setError("Invalid Email or Password");
      toast.error("Login Failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 2. Google Login
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'customer',
          createdAt: serverTimestamp(),
        });
        
        try { await sendWelcomeEmail(user); } catch (e) { console.log(e) }
      } else {
        try { await sendLoginAlertEmail(user); } catch (e) { console.log(e) }
      }

      toast.success("Logged in with Google! 🚀");
      navigate('/');

    } catch (error) {
      console.error(error);
      toast.error("Google Sign In Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Vendixo</h1>
            <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">Secure Login</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              type="email" required 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all" 
              placeholder="name@email.com" 
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                
                {/* 👇 YAHAN ADD KIYA HAI FORGOT PASSWORD LINK 👇 */}
                <Link to="/forgot-password" className="text-[10px] font-bold text-violet-600 hover:underline uppercase tracking-wider">
                    Forgot Password?
                </Link>
            </div>
            
            <input 
              type="password" required 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all" 
              placeholder="••••••••" 
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button fullWidth variant="primary" disabled={loading} className="rounded-2xl py-4 shadow-violet-200">
            {loading ? "Authenticating..." : "Login to Account"}
          </Button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="px-4 bg-white text-gray-400">Security Verified</span></div>
        </div>

        <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
            Continue with Google
        </button>

        <p className="mt-10 text-center text-sm font-medium text-gray-500">
          New to Vendixo? <Link to="/signup" className="text-violet-600 font-black hover:underline uppercase tracking-tighter">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;