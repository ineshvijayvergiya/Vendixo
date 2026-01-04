import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; 
import { auth, db } from '../../config/firebase'; 
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button'; // ✅ Custom Button use kiya

// ✅ Email service import
import { sendWelcomeEmail } from '../../utils/emailService'; 

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 1. Email/Password Signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      
      // A. Create User in Firebase Auth
      const userCredential = await signup(formData.email, formData.password);
      const user = userCredential.user;

      // B. Update Name in Profile
      await updateProfile(user, {
        displayName: formData.name
      });

      // C. Save User Data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.name,
        email: formData.email,
        photoURL: null,
        role: 'customer',
        createdAt: serverTimestamp(),
      });

      // ✅ D. Send Welcome Email (Backend Trigger)
      await sendWelcomeEmail({
        email: formData.email,
        displayName: formData.name
      });

      toast.success("Welcome to Vendixo! 🎉");
      navigate('/');
      
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 2. Google Signup Logic
  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Naya user hai -> Save and Send Welcome Email
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'customer',
          createdAt: serverTimestamp(),
        });

        await sendWelcomeEmail(user);
        toast.success("Joined Vendixo with Google! 🎉");
      } else {
        toast.success("Welcome back to Vendixo!");
      }

      navigate('/');

    } catch (error) {
      console.error(error);
      toast.error("Google Sign Up Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Vendixo</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input type="text" name="name" required className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all" placeholder="John Doe" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input type="email" name="email" required className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all" placeholder="name@example.com" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input type="password" name="password" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all" placeholder="••••••••" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm</label>
                <input type="password" name="confirmPassword" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all" placeholder="••••••••" onChange={handleChange} />
              </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-violet-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "Creating..." : <>Get Started <ArrowRight size={18}/></>}
          </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-gray-400"><span className="px-4 bg-white">Fast Register</span></div>
        </div>

        <button 
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
            Continue with Google
        </button>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Already a member? <Link to="/login" className="text-violet-600 font-black hover:underline uppercase tracking-tighter">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;