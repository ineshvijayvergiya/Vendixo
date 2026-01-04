import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useShop();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500"/> My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">Your wishlist is empty.</p>
            <Link to="/shop">
               <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                {/* Image */}
                <Link to={`/product/${product.id}`} className="block relative h-64 bg-gray-100">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* 🔥 REMOVE BUTTON (Corrected) */}
                  <button 
                    onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(product.id);
                    }}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </Link>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate mb-1">{product.title}</h3>
                  <p className="text-violet-600 font-bold mb-4">${product.price}</p>
                  
                  <Button fullWidth onClick={() => addToCart(product)} className="flex items-center justify-center gap-2">
                    <ShoppingCart size={18} /> Move to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;