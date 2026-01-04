import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { ShoppingCart, Heart, ArrowLeft, Truck, ShieldCheck, Tag, BellRing, Zap } from 'lucide-react'; 
import toast from 'react-hot-toast';

// Firebase Imports
import { db } from '../../config/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Import Reviews Component
import ProductReviews from '../../components/products/ProductReviews'; 

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist } = useShop();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(''); // 🔥 Main image state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          // Set pehli image as main image
          setMainImage(data.images ? data.images[0] : data.image);
        } else {
          toast.error("Product not found!");
          navigate('/shop');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleNotifyMe = async () => {
    if (!currentUser) {
        toast.error("Please login to get notified");
        navigate('/login');
        return;
    }
    try {
        await addDoc(collection(db, "waitlist"), {
            productId: product.id,
            productName: product.title,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            createdAt: serverTimestamp()
        });
        toast.success("We will notify you when it's back! 🔔");
    } catch (error) {
        toast.error("Something went wrong");
    }
  };

  // ✅ Common validation for Add to Cart & Buy Now
  const validatePurchase = () => {
    if (!selectedSize && ['Men', 'Women', 'Kids', 'Footwear'].includes(product.category)) {
        toast.error("Please select a size first!");
        return false;
    }
    if (product.stock < quantity) {
        toast.error(`Only ${product.stock} items left in stock!`);
        return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (validatePurchase()) {
        addToCart({ ...product, size: selectedSize, quantity: quantity });
        toast.success("Added to cart! 🛒");
    }
  };

  // 🔥 DIRECT BUY NOW FUNCTION
  const handleBuyNow = () => {
    if (validatePurchase()) {
        addToCart({ ...product, size: selectedSize, quantity: quantity });
        navigate('/checkout'); // Seedha checkout pe bhej do
    }
  };

  const getDiscount = (price, original) => {
    return Math.round(((original - price) / original) * 100);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>;
  if (!product) return null;

  const sizes = ['S', 'M', 'L', 'XL', 'XXL']; 

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 font-bold hover:text-violet-600 mb-8 transition-all">
          <ArrowLeft size={20} className="mr-2" /> BACK TO SHOP
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* LEFT: IMAGE GALLERY */}
            <div className="p-8 bg-gray-50/50">
                <div className="relative aspect-square bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 flex items-center justify-center p-10 group">
                    <img src={mainImage} alt={product.title} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                    
                    {product.isOnSale && (
                        <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 tracking-widest uppercase">
                            <Tag size={14}/> {getDiscount(product.price, product.originalPrice)}% OFF
                        </div>
                    )}
                    
                    <button onClick={() => addToWishlist(product)} className="absolute top-6 right-6 bg-white p-3 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-all hover:scale-110">
                        <Heart size={24} />
                    </button>
                </div>

                {/* Thumbnails (Only if multiple images exist) */}
                {product.images && product.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                        {product.images.map((img, index) => (
                            <div 
                                key={index} 
                                onClick={() => setMainImage(img)}
                                className={`aspect-square rounded-2xl border-2 cursor-pointer bg-white p-2 transition-all ${mainImage === img ? 'border-violet-600 scale-105 shadow-md' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-contain" alt="" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT: PRODUCT INFO */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <p className="text-[10px] text-violet-600 font-black uppercase tracking-[0.2em] mb-3">{product.category}</p>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase">{product.title}</h1>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-gray-900">${product.price}</span>
                    {product.isOnSale && (
                        <span className="text-xl text-gray-300 line-through font-bold">${product.originalPrice}</span>
                    )}
                </div>
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${product.stock < 5 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {product.stock <= 0 ? 'Sold Out' : product.stock < 5 ? `Only ${product.stock} Left` : 'In Stock'}
                </span>
              </div>

              <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg border-l-4 border-violet-100 pl-6">{product.description}</p>

              {['Men', 'Women', 'Kids', 'Footwear'].includes(product.category) && (
                <div className="mb-10">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Your Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-14 rounded-2xl border-2 font-black transition-all ${selectedSize === size ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {product.stock > 0 ? (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-gray-500 font-black hover:bg-white rounded-xl transition-all">-</button>
                                <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-12 h-12 flex items-center justify-center text-gray-500 font-black hover:bg-white rounded-xl transition-all">+</button>
                            </div>

                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={20} /> Add to Cart
                            </button>
                        </div>

                        {/* 🔥 DIRECT BUY NOW BUTTON */}
                        <button 
                            onClick={handleBuyNow}
                            className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <Zap size={20} className="fill-current" /> Buy It Now
                        </button>
                    </>
                ) : (
                    <Button fullWidth onClick={handleNotifyMe} className="py-5 text-sm font-black uppercase tracking-widest bg-orange-500 border-none shadow-orange-100">
                        <BellRing size={20} className="mr-2" /> Notify Me When Back
                    </Button>
                )}
              </div>
                
              <div className="grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Truck size={18} className="text-violet-600"/> 2-Day Delivery
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-violet-600"/> 1-Year Warranty
                  </div>
              </div>
            </div>
          </div>
        </div>
        
        <ProductReviews productId={id} />
      </div>
    </div>
  );
};

export default ProductDetails;