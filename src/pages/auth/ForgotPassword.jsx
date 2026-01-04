import React, { useState } from 'react';
import { auth } from '../../config/firebase'; // Path ab sahi hai
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting to send email to:", email); // Console check

    try {
      await sendPasswordResetEmail(auth, email);
      
      // ✅ Agar ye chala, matlab Firebase ne mail bhej diya
      alert("✅ SUCCESS: Email sent! Check your inbox."); 
      console.log("Email sent successfully");
      
    } catch (err) {
      console.error("Firebase Error:", err); // Asli error yahan dikhega
      
      // ❌ Alag-alag errors ke liye alag alerts
      if (err.code === 'auth/user-not-found') {
        alert("❌ ERROR: E-mail is not registered.");
      } else if (err.code === 'auth/invalid-email') {
        alert("❌ ERROR: Enter a valid email address.");
      } else {
        alert("❌ ERROR: " + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>Reset Password 🔒</h2>
      <p>Enter your registered email below.</p>

      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '90%', padding: '10px', marginBottom: '10px' }}
        />
        <br />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div style={{ marginTop: '15px' }}>
        <Link to="/login" style={{ color: '#7c3aed' }}>Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;