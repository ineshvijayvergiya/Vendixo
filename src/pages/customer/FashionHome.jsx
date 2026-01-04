import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Tag, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const FashionHome = () => {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const sliderRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [fashionFeatured, setFashionFeatured] = useState([]); // 🔥 Slider Data
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchClothing = async () => {
      try {
        // 1. All Fashion Items (Grid ke liye)
        const q = query(
            collection(db, "products"), 
            where("category", "in", ["Men", "Women", "Kids", "Accessories", "Footwear"])
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);

        // 2. 🔥 Filter Featured Items (Jinpe tune "Fashion Slider" tick kiya hai)
        const featured = data.filter(item => item.isFashionFeatured === true);
        setFashionFeatured(featured);

      } catch (error) {
        console.error("Error fetching fashion items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClothing();
  }, []);

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(item => item.category === activeTab);

  const scrollLeft = () => sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });

  // CARD COMPONENT (Internal)
  const FashionCard = ({ product }) => {
      const isInWishlist = wishlist.some(item => item.id === product.id);
      return (
        <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 min-w-[280px]">
             {/* Image & Actions */}
             <div className="relative h-[320px] bg-gray-100 overflow-hidden">
                <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </Link>
                {product.isOnSale && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1">
                        <Tag size={12}/> SALE
                    </div>
                )}
                {/* Wishlist */}
                <button onClick={(e) => { e.preventDefault(); toggleWishlist(product); }} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10">
                    <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}/>
                </button>
                {/* Cart */}
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg translate-y-20 group-hover:translate-y-0 transition-transform duration-300 text-violet-600 cursor-pointer" onClick={() => addToCart(product)}>
                    <ShoppingBag size={20}/>
                </div>
            </div>
            {/* Details */}
            <div className="p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                <Link to={`/product/${product.id}`}>
                    <h3 className="font-serif text-lg text-gray-900 truncate hover:text-violet-600 cursor-pointer">{product.title}</h3>
                </Link>
                <div className="flex justify-center items-center gap-2 mt-2">
                    {product.isOnSale ? (
                        <><span className="text-gray-400 line-through text-sm">${product.originalPrice}</span><span className="text-red-600 font-bold text-lg">${product.price}</span></>
                    ) : (
                        <span className="text-gray-900 font-bold text-lg">${product.price}</span>
                    )}
                </div>
            </div>
        </div>
      );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO BANNER */}
      <div className="relative h-[400px] bg-gray-900 overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center"></div>
        <div className="relative z-10 text-white max-w-3xl">
            <span className="text-violet-400 font-bold tracking-widest uppercase text-sm mb-2 block">Premium Collection</span>
            <h1 className="text-5xl md:text-6xl font-serif italic mb-6">Redefine Your Style</h1>
            <p className="text-lg text-gray-200 mb-8">Explore the latest trends in men's, women's and kids' fashion.</p>
        </div>
      </div>

      {/* 2. 🔥 TRENDING SLIDER (Only Fashion Featured Items) */}
      {fashionFeatured.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200">
             <div className="flex justify-between items-end mb-8">
                 <div>
                    <h2 className="text-3xl font-serif italic text-gray-900">Trending Now</h2>
                    <p className="text-gray-500">Handpicked fashion just for you.</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={scrollLeft} className="p-2 rounded-full border hover:bg-black hover:text-white transition-all"><ChevronLeft size={20}/></button>
                    <button onClick={scrollRight} className="p-2 rounded-full border hover:bg-black hover:text-white transition-all"><ChevronRight size={20}/></button>
                 </div>
             </div>
             {/* Slider */}
             <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {fashionFeatured.map((product) => (
                    <div key={product.id} className="min-w-[280px]">
                        <FashionCard product={product} />
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* 3. CATEGORY TABS */}
      <div className="sticky top-16 z-30 bg-white shadow-sm border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4 overflow-x-auto scrollbar-hide justify-center">
            {['All', 'Men', 'Women', 'Kids', 'Footwear', 'Accessories'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {tab}
                </button>
            ))}
         </div>
      </div>

      {/* 4. MAIN GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12">
         {filteredProducts.length === 0 ? (
            <div className="text-center py-20"><p className="text-gray-500 text-lg">No products found.</p></div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <FashionCard key={product.id} product={product} />
                ))}
            </div>
         )}
      </div>

    </div>
  );
};

export default FashionHome;