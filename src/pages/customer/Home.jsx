import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { 
  Smartphone, Watch, Headphones, Camera, Laptop, 
  Bike, PackageCheck, Percent, Clock, ChevronLeft, ChevronRight,
  Tablet, Tv, Speaker, Award, Tag, ShoppingBag, Heart, Plus
} from 'lucide-react'; 
import Button from '../../components/ui/Button';
import HelpBanner from '../../components/common/HelpBanner';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useShop } from '../../context/ShopContext';
import toast from 'react-hot-toast';

// 🔥 FIXED PRODUCT CARD COMPONENT (Compact Size + Permanent Dollar $)
const ProductCard = ({ product }) => {
    const { toggleWishlist, wishlist, addToCart } = useShop(); 
    const isInWishlist = wishlist.some((item) => item.id === product.id);

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to bag! 🛍️`);
    };

    return (
      <div className="block group w-full max-w-[280px] mx-auto relative bg-white p-3 rounded-[2rem] border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
          
          {/* 🔥 Fixed Height Container to prevent 'choda' look */}
          <div className="relative bg-gray-50 rounded-[1.6rem] overflow-hidden mb-3 h-[240px] flex items-center justify-center">
              <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center p-6">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700" 
                  />
              </Link>

              {product.isOnSale && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest">
                  SALE
                </span>
              )}

              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm hover:scale-110 transition-all z-10 text-gray-400"
              >
                  <Heart size={16} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-500">
                  <button 
                    onClick={handleQuickAdd}
                    className="w-full bg-black text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl hover:bg-violet-600"
                  >
                      <Plus size={12} /> Add to Bag
                  </button>
              </div>
          </div>

          <div className="px-1 text-center">
              <p className="text-[9px] text-violet-600 font-black uppercase tracking-[0.2em] mb-1">{product.category}</p>
              <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-gray-900 truncate text-sm mb-1 group-hover:text-violet-600 transition-colors leading-tight">{product.title}</h3>
                  <div className="flex gap-2 justify-center items-center mt-1">
                      {/* 🔥 Fixed Dollar Sign as requested */}
                      <span className="font-black text-gray-900 text-base">${product.price}</span>
                      {product.isOnSale && product.originalPrice && (
                          <span className="text-[10px] text-gray-300 line-through font-bold">${product.originalPrice}</span>
                      )}
                  </div>
              </Link>
          </div>
      </div>
    );
};

// 🔥 MAIN HOME COMPONENT
const Home = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const featuredQuery = query(collection(db, "products"), where("isFeatured", "==", true), limit(4));
        const featuredSnap = await getDocs(featuredQuery);
        setBestSellers(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const saleQuery = query(collection(db, "products"), where("isOnSale", "==", true), limit(8));
        const saleSnap = await getDocs(saleQuery);
        setSaleProducts(saleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { name: "Computers", icon: <Laptop size={32} /> },
    { name: "Mobile", icon: <Smartphone size={32} /> },
    { name: "Drones & Cameras", icon: <Camera size={32} /> },
    { name: "Sale", icon: <Tag size={32} />, isPurple: true },
    { name: "Tablets", icon: <Tablet size={32} /> },
    { name: "Best Sellers", icon: <Award size={32} />, isBlack: true },
    { name: "T.V & Cinema", icon: <Tv size={32} /> },
    { name: "Wearable", icon: <Watch size={32} /> },
    { name: "Speakers", icon: <Speaker size={32} /> },
    { name: "Headphones", icon: <Headphones size={32} /> },
  ];

  const scrollLeft = () => { if (sliderRef.current) sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' }); };
  const scrollRight = () => { if (sliderRef.current) sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-white font-sans pt-16">
      
      {/* 1. HERO BANNER */}
      <div className="relative h-[600px] w-full bg-gray-900 overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center scale-105 animate-pulse-slow"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <span className="inline-block bg-violet-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">New Season</span>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
              Incredible <br/> Prices on <br/> <span className="text-violet-400">Tech Gear</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-md">Upgrade your lifestyle with the latest gadgets. Premium quality, best prices.</p>
            <button 
                onClick={() => navigate('/shop')}
                className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-violet-600 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROMO BANNERS */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => navigate('/shop')} className="relative bg-black rounded-[2.5rem] overflow-hidden h-[350px] flex items-center p-12 cursor-pointer group shadow-sm hover:shadow-2xl transition-all">
                <div className="relative z-10 w-2/3 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 block">Limited Time</span>
                    <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase">30% OFF</h3>
                    <p className="text-sm opacity-60 mb-8 font-medium">On Selected Smartphones</p>
                    <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Shop Now</button>
                </div>
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600" className="absolute -right-10 bottom-0 h-[90%] object-contain group-hover:scale-110 transition-transform duration-700" alt="Phone" />
            </div>
            <div onClick={() => navigate('/shop')} className="relative bg-violet-600 rounded-[2.5rem] overflow-hidden h-[350px] flex items-center p-12 cursor-pointer group shadow-sm hover:shadow-2xl transition-all">
                <div className="relative z-10 w-2/3 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 block">New Arrivals</span>
                    <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase">The Sound</h3>
                    <p className="text-sm opacity-60 mb-8 font-medium">Premium Audio Experience</p>
                    <button className="bg-white text-violet-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Discover</button>
                </div>
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600" className="absolute -right-20 top-10 h-[80%] object-contain group-hover:rotate-12 transition-transform duration-700" alt="Headphones" />
            </div>
        </div>
      </div>

      {/* 3. BEST SELLERS */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-16">
             <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Best Sellers</h2>
             <div className="h-1.5 w-20 bg-violet-600 mt-4 rounded-full"></div>
          </div>
          
          {loading ? (
             <div className="text-center py-20 font-bold text-gray-400 uppercase tracking-widest animate-pulse">Scanning Inventory...</div>
          ) : bestSellers.length === 0 ? (
             <div className="text-center py-20 border-2 border-dashed rounded-[3rem] text-gray-400 font-bold uppercase">No Featured Items Found</div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {bestSellers.map((product) => (
                   <ProductCard key={product.id} product={product} />
                ))}
             </div>
          )}
          
          <div className="text-center mt-16">
             <button 
                onClick={() => navigate('/shop')}
                className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-violet-600 transition-all active:scale-95"
             >
                View All Best Sellers
             </button>
          </div>
        </div>
      </div>

      {/* 4. SHOP BY CATEGORY */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl font-black text-gray-900 mb-16 uppercase tracking-tight">Categories</h2>
           <div className="flex flex-wrap justify-center gap-x-16 gap-y-16">
              {categories.map((cat, i) => (
                 <div key={i} className="flex flex-col items-center gap-6 cursor-pointer group" onClick={() => navigate('/shop')}>
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-violet-200 ${
                       cat.isPurple ? 'bg-violet-600 text-white' : 
                       cat.isBlack ? 'bg-black text-white border-4 border-white' : 
                       'bg-white text-gray-800'
                    }`}>
                       {cat.icon}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-violet-600 transition-colors">{cat.name}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* 5. ON SALE SLIDER */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">On Sale</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Limited Stocks Available</p>
              </div>
              <div className="flex gap-4">
                  <button onClick={scrollLeft} className="p-4 rounded-2xl bg-gray-50 text-gray-900 hover:bg-violet-600 hover:text-white shadow-sm transition-all"><ChevronLeft size={20}/></button>
                  <button onClick={scrollRight} className="p-4 rounded-2xl bg-gray-50 text-gray-900 hover:bg-violet-600 hover:text-white shadow-sm transition-all"><ChevronRight size={20}/></button>
              </div>
          </div>
          
          <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide scroll-smooth snap-x" style={{ scrollbarWidth: 'none' }}>
             {saleProducts.length === 0 ? (
                 <p className="w-full text-center text-gray-400 py-20 font-bold uppercase border-2 border-dashed rounded-[3rem]">No Sales Active</p>
             ) : (
                saleProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="snap-start">
                        <ProductCard product={product} />
                    </div>
                ))
             )}
          </div>
        </div>
      </div>

      <HelpBanner />
    </div>
  );
};

export default Home;