import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        
        {/* Vendixo Brand & Location */}
        <div className="space-y-6">
          <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase italic">Vendixo</h3>
          <ul className="space-y-4 text-gray-500 text-sm font-medium">
            <li className="flex items-center gap-3"><MapPin size={18} className="text-violet-600"/> 500 Terry Francine Street, SF</li>
            <li className="flex items-center gap-3"><Mail size={18} className="text-violet-600"/> support@vendixo.shop</li>
            <li className="flex items-center gap-3"><Phone size={18} className="text-violet-600"/> +1 123-456-7890</li>
          </ul>
          <div className="flex gap-5 pt-4">
             <Facebook size={20} className="text-gray-400 cursor-pointer hover:text-violet-600 transition-colors"/>
             <Instagram size={20} className="text-gray-400 cursor-pointer hover:text-violet-600 transition-colors"/>
             <Twitter size={20} className="text-gray-400 cursor-pointer hover:text-violet-600 transition-colors"/>
             <Youtube size={20} className="text-gray-400 cursor-pointer hover:text-violet-600 transition-colors"/>
          </div>
        </div>

        {/* Shop Collection */}
        <div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8">Shop</h3>
          <ul className="space-y-4 text-gray-600 text-sm font-bold">
            <li><Link to="/shop" className="hover:text-violet-600 transition-colors">Explore All</Link></li>
            <li><Link to="/shop?category=Computers" className="hover:text-violet-600">Computers</Link></li>
            <li><Link to="/shop?category=Tablets" className="hover:text-violet-600">Tablets</Link></li>
            <li><Link to="/shop?category=Audio" className="hover:text-violet-600">Audio Gear</Link></li>
            <li><Link to="/shop?category=Mobile" className="hover:text-violet-600">Mobile Phones</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8">Support</h3>
          <ul className="space-y-4 text-gray-600 text-sm font-bold">
            <li><Link to="/contact" className="hover:text-violet-600">Contact Us</Link></li>
            <li><Link to="/help-center" className="hover:text-violet-600">Help Center</Link></li>
            <li><Link to="/about" className="hover:text-violet-600">About Vendixo</Link></li>
            <li><Link to="/my-orders" className="hover:text-violet-600">Track Order</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8">Legal</h3>
          <ul className="space-y-4 text-gray-600 text-sm font-bold">
            <li><Link to="#" className="hover:text-violet-600">Shipping & Returns</Link></li>
            <li><Link to="#" className="hover:text-violet-600">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-violet-600">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-violet-600">Payment Safety</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Payment Bar */}
      <div className="border-t border-gray-50 pt-10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              © 2026 Vendixo Store. All rights reserved.
            </p>
            
            <div className="flex items-center gap-8 opacity-80">
                {/* 🔥 GrayScale Hata Diya - Ab Ye Colorful Dikhenge */}
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-5 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 object-contain" />
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;