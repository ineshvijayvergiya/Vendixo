import React from 'react';
import { ShoppingCart, Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist } = useShop();

  // 🔥 Optimized Add to Cart Function
  const handleAddToCart = (e) => {
    e.preventDefault(); // Navigation rokne ke liye
    e.stopPropagation(); // Card click event ko rokne ke liye
    
    // Data validation check
    if (!product || !product.id) {
      console.error("Product data missing!");
      return;
    }

    console.log("Adding to cart:", product.title); // Debugging ke liye

    // Default quantity 1 ke saath add karo
    addToCart({ 
      ...product, 
      quantity: 1,
      // Agar category clothing hai toh default size 'M' bhej sakte ho crash rokne ke liye
      size: ['Men', 'Women', 'Kids', 'Footwear'].includes(product.category) ? 'M' : null 
    });

    toast.success(`${product.title} added to bag! 🛍️`, {
      style: { 
        borderRadius: '10px', 
        background: '#333', 
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-[2rem] border border-gray-100 p-4 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(109,40,217,0.1)] hover:-translate-y-2">
      
      {/* Sale Badge */}
      {product.isOnSale && (
        <div className="absolute top-5 left-5 z-10 bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          Sale
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/90 text-gray-400 hover:text-red-500 transition-all duration-300 shadow-sm hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <Heart size={18} fill={product.isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <div 
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative h-56 w-full bg-gray-50/50 rounded-[1.5rem] overflow-hidden mb-5 cursor-pointer flex items-center justify-center"
      >
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-[80%] h-[80%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
        />
        
        {/* 🔥 QUICK ADD OVERLAY */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-4">
            <button 
              onClick={handleAddToCart}
              className="bg-gray-900 text-white w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl hover:bg-violet-600 active:scale-95"
            >
                <Plus size={16} /> Quick Add
            </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        <p className="text-[10px] text-violet-600 font-black uppercase tracking-[0.2em] mb-2">{product.category}</p>
        <h3 className="text-gray-900 font-bold text-base leading-tight mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Price & Cart Action */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
             {product.isOnSale && (
               <span className="text-[10px] text-gray-300 line-through font-bold mb-0.5">
                 ${(Number(product.price) * 1.2).toFixed(2)}
               </span>
             )}
             <span className="text-xl font-black text-gray-900 tracking-tight">${product.price}</span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-violet-100 active:scale-90"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;