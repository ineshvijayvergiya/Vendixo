import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Filter, Search as SearchIcon, ShoppingCart, Heart } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Link, useLocation } from 'react-router-dom'; // 🔥 useLocation add kiya
import toast from 'react-hot-toast';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Shop = () => {
  const { addToCart, toggleWishlist, wishlist } = useShop(); // toggleWishlist use karein
  const { search } = useLocation(); // 🔥 URL se search query pakadne ke liye
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(2000); 
  const [sortOrder, setSortOrder] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔥 Navbar se aayi query ko handle karo
  useEffect(() => {
    const params = new URLSearchParams(search);
    const q = params.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [search]);

  // Fetch from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Price Scrubber: Ensure price is always a number
          let cleanPrice = data.price;
          if (typeof cleanPrice === 'string') {
            cleanPrice = parseFloat(cleanPrice.replace(/[$,]/g, '')) || 0;
          }
          return { id: doc.id, ...data, price: cleanPrice };
        });
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // 🔥 Search Filter (Title aur Category dono mein search karega)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Price Filter
    result = result.filter(item => item.price <= priceRange);

    // Sorting
    if (sortOrder === 'lowToHigh') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'highToLow') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    setFilteredProducts(result);
  }, [products, selectedCategory, priceRange, sortOrder, searchQuery]);

  const getDiscount = (price, original) => {
    const orig = parseFloat(String(original).replace(/[$,]/g, '')) || 0;
    if (!orig || orig <= price) return 0;
    return Math.round(((orig - price) / orig) * 100);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Inventory...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        
        {/* HEADING & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Marketplace</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Showing {filteredProducts.length} premium products</p>
          </div>
          <div className="relative w-full md:w-96 group">
            <input 
              type="text" 
              placeholder="Search in collection..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none shadow-sm transition-all" 
            />
            <SearchIcon className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-violet-600 transition-colors" size={20} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* SIDEBAR FILTERS */}
          <div className="lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Filter size={14} /> Categories
              </h3>
              <div className="space-y-4">
                {['All', 'Men', 'Women', 'Kids', 'Accessories', 'Footwear', 'Electronics', 'Home Decor'].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat} 
                      onChange={() => setSelectedCategory(cat)} 
                      className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-gray-300" 
                    />
                    <span className={`text-sm font-bold transition-colors ${selectedCategory === cat ? 'text-violet-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
                      {cat === 'All' ? 'All Collections' : cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Price Limit: ${priceRange}</h3>
              <input type="range" min="0" max="2000" step="50" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-violet-600" />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                <span>$0</span>
                <span>$2000+</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Sort Gallery</h3>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none text-gray-700">
                    <option value="default">New Arrivals</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                </select>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SearchIcon size={32} className="text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products found matching your criteria</p>
                    <button onClick={() => {setPriceRange(2000); setSelectedCategory('All'); setSearchQuery('')}} className="mt-6 text-violet-600 font-black text-xs uppercase tracking-widest hover:underline">Reset All Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    
                    {/* Image Area */}
                    <div className="relative h-72 bg-gray-50/50 overflow-hidden flex items-center justify-center p-8">
                        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                          <img src={product.image} alt={product.title} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                        </Link>
                        
                        {product.isOnSale && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg z-10 uppercase tracking-widest">
                                -{getDiscount(product.price, product.originalPrice)}%
                            </div>
                        )}

                        <button 
                          onClick={() => toggleWishlist(product)} 
                          className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-all z-20 hover:scale-110"
                        >
                            <Heart size={18} className={wishlist.some(i => i.id === product.id) ? "fill-red-500 text-red-500" : ""} />
                        </button>
                        
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500">
                            <button 
                              onClick={() => { addToCart(product); toast.success("Added to Bag! 🛍️"); }} 
                              className="w-full bg-gray-900 text-white py-3.5 rounded-xl shadow-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-violet-600"
                            >
                                <ShoppingCart size={16} /> Quick Add
                            </button>
                        </div>
                    </div>

                    {/* Details Area */}
                    <div className="p-6">
                        <p className="text-[10px] text-violet-600 font-black mb-2 uppercase tracking-[0.2em]">{product.category}</p>
                        
                        <Link to={`/product/${product.id}`}>
                             <h3 className="font-bold text-gray-900 mb-3 truncate group-hover:text-violet-600 transition-colors">{product.title}</h3>
                        </Link>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-gray-900 tracking-tight">${Number(product.price).toFixed(2)}</span>
                                {product.isOnSale && (
                                    <span className="text-xs text-gray-300 line-through font-bold">${product.originalPrice}</span>
                                )}
                            </div>
                            <div className="flex text-yellow-400">
                                <StarIcon rating={4.5} />
                            </div>
                        </div>
                    </div>

                    </div>
                ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chhota helper icon ke liye
const StarIcon = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
    <span className="text-[10px] font-black text-gray-900 ml-1">{rating}</span>
  </div>
);

export default Shop;