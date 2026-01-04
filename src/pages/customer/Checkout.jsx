import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { CreditCard, Truck, CheckCircle, Plus, Minus, Trash2, MapPin } from 'lucide-react'; 
import Confetti from 'react-confetti'; 
import toast from 'react-hot-toast';
import { sendOrderEmail } from '../../utils/emailService';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, updateQuantity, removeFromCart } = useShop();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 🔥 Detailed Form State
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '', email: currentUser?.email || '',
    houseNo: '', street: '', area: '', city: '', state: '', zip: '',
    cardNumber: '', expiry: '', cvv: ''
  });

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const codFee = paymentMethod === 'cod' ? 5 : 0; 
  const finalTotal = subtotal + shipping + codFee - discount;

  const handleInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'VENDIXO10') {
      setDiscount(subtotal * 0.10);
      setIsApplied(true);
      toast.success("10% Discount Applied! 🛍️");
    } else { toast.error("Invalid Code"); }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      const orderData = {
        orderId, userId: currentUser?.uid || "guest", customerName: formData.name,
        email: formData.email, 
        address: {
            houseNo: formData.houseNo, street: formData.street, 
            area: formData.area, city: formData.city, 
            state: formData.state, zip: formData.zip 
        },
        items: cart, totalAmount: finalTotal.toFixed(2), paymentMethod, status: "Pending", createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "orders"), orderData);
      sendOrderEmail({ email: formData.email, displayName: formData.name }, { orderId, totalAmount: `$${finalTotal.toFixed(2)}`, itemsCount: cart.length });
      if (clearCart) clearCart();
      setOrderPlaced(true);
    } catch (err) { toast.error("Error saving order"); } finally { setLoading(false); }
  };

  if (orderPlaced) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-white">
      <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} />
      <CheckCircle size={80} className="text-green-500 mb-4 animate-bounce" />
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">Order Confirmed!</h1>
      <p className="text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 mb-8">Vendixo is processing your gear</p>
      <button onClick={() => navigate('/shop')} className="px-12 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">Continue Shopping</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* --- LEFT: DETAILED SHIPPING & PAYMENT --- */}
        <div className="flex-1 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-8 italic flex items-center gap-2">
                <MapPin size={16}/> 01. Shipping Destination
            </h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input required name="name" value={formData.name} onChange={handleInput} placeholder="Full Name" className="md:col-span-2 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 text-sm font-bold" />
              <input required name="email" value={formData.email} onChange={handleInput} placeholder="Email" className="md:col-span-2 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 text-sm font-bold" />
              <input required name="houseNo" value={formData.houseNo} onChange={handleInput} placeholder="House No. / Building Name" className="p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" />
              <input required name="street" value={formData.street} onChange={handleInput} placeholder="Street / Road Name" className="p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" />
              <input name="area" value={formData.area} onChange={handleInput} placeholder="Nearby Area / Landmark (Optional)" className="md:col-span-2 p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" />
              <input required name="city" value={formData.city} onChange={handleInput} placeholder="City" className="p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" />
              <input required name="state" value={formData.state} onChange={handleInput} placeholder="State" className="p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" />
              <input required name="zip" value={formData.zip} onChange={handleInput} placeholder="ZIP / Pincode" className="md:col-span-2 p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" />
            </form>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-8 italic flex items-center gap-2">
                <CreditCard size={16}/> 02. Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div onClick={() => setPaymentMethod('cod')} className={`p-5 rounded-3xl border-2 cursor-pointer text-center transition-all ${paymentMethod === 'cod' ? 'border-violet-600 bg-violet-50' : 'border-gray-50 bg-gray-50 text-gray-400'}`}><Truck className="mx-auto mb-2" /> <span className="text-[10px] font-black uppercase tracking-widest">COD (+$5 Fee)</span></div>
              <div onClick={() => setPaymentMethod('card')} className={`p-5 rounded-3xl border-2 cursor-pointer text-center transition-all ${paymentMethod === 'card' ? 'border-violet-600 bg-violet-50' : 'border-gray-50 bg-gray-50 text-gray-400'}`}><CreditCard className="mx-auto mb-2" /> <span className="text-[10px] font-black uppercase tracking-widest">Online Card</span></div>
            </div>

            {/* 🔥 CONDITIONAL CARD DETAILS SECTION */}
            {paymentMethod === 'card' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <input required name="cardNumber" value={formData.cardNumber} onChange={handleInput} placeholder="Card Number (16 Digits)" className="col-span-2 p-4 bg-gray-50 rounded-2xl outline-none border-2 border-violet-100 text-sm font-bold" maxLength="16" />
                    <input required name="expiry" value={formData.expiry} onChange={handleInput} placeholder="MM/YY" className="p-4 bg-gray-50 rounded-2xl outline-none border-2 border-violet-100 text-sm font-bold" />
                    <input required name="cvv" value={formData.cvv} onChange={handleInput} placeholder="CVV" className="p-4 bg-gray-50 rounded-2xl outline-none border-2 border-violet-100 text-sm font-bold" maxLength="3" />
                </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: ORDER SUMMARY --- */}
        <div className="lg:w-[420px]">
          <div className="bg-gray-900 text-white p-10 rounded-[3rem] sticky top-24 shadow-2xl border-4 border-gray-800">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-8 pb-4 border-b border-gray-800 italic">Vendixo Cart Summary</h2>
            <div className="space-y-4 mb-8 max-h-56 overflow-y-auto no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tight truncate w-32">{item.title}</span>
                    <div className="flex items-center gap-3 mt-2">
                        <Minus size={14} className="p-0.5 bg-gray-700 rounded-full cursor-pointer hover:bg-violet-600" onClick={() => updateQuantity(item.id, -1)} />
                        <span className="text-xs font-black">{item.quantity}</span>
                        <Plus size={14} className="p-0.5 bg-gray-700 rounded-full cursor-pointer hover:bg-violet-600" onClick={() => updateQuantity(item.id, 1)} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-black text-xs text-violet-400">${(item.price * item.quantity).toFixed(2)}</span>
                    <Trash2 size={14} className="text-gray-600 cursor-pointer hover:text-red-500" onClick={() => removeFromCart(item.id)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-8">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="PROMO CODE" className="flex-1 bg-gray-800 p-3 rounded-xl text-[10px] font-black outline-none uppercase tracking-widest placeholder:text-gray-600" />
              <button onClick={applyCoupon} className="bg-violet-600 text-white px-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Apply</button>
            </div>

            <div className="space-y-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 border-t border-gray-800 pt-6">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-white">${shipping === 0 ? "FREE" : `$${shipping}`}</span></div>
              {paymentMethod === 'cod' && <div className="flex justify-between text-orange-400 font-black tracking-widest"><span>COD Service Fee</span><span>+$5.00</span></div>}
              {isApplied && <div className="flex justify-between text-green-400"><span>Vendixo Promo</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="border-t border-gray-800 mt-4 pt-6 flex justify-between items-end">
                <span className="text-white">Order Total</span>
                <span className="text-4xl font-black tracking-tighter text-white animate-pulse italic">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" form="checkout-form" disabled={loading} className="w-full mt-10 bg-violet-600 p-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Authenticating..." : `Authorize Payment ($${finalTotal.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;