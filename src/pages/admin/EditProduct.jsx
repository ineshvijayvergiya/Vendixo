import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Tag, Star, Shirt, Image as ImageIcon } from 'lucide-react'; 
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // 🔥 Toggles State
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false); 
  const [isFashionFeatured, setIsFashionFeatured] = useState(false); 

  // 🔥 Multi-Image State (4 slots)
  const [imageUrls, setImageUrls] = useState(['', '', '', '']);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    category: 'Men',
    description: '',
    stock: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title,
            price: data.price,
            originalPrice: data.originalPrice || '',
            category: data.category,
            description: data.description,
            stock: data.stock
          });
          setIsOnSale(data.isOnSale || false);
          setIsFeatured(data.isFeatured || false);
          setIsFashionFeatured(data.isFashionFeatured || false);

          // 🔥 Load Images Array
          if (data.images && Array.isArray(data.images)) {
            const newImages = ['', '', '', ''];
            data.images.forEach((url, i) => { if (i < 4) newImages[i] = url; });
            setImageUrls(newImages);
          } else if (data.image) {
            // Agar purana data hai single image wala
            setImageUrls([data.image, '', '', '']);
          }

        } else {
          toast.error("Product not found");
          navigate('/admin/products');
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error loading product data");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...imageUrls];
    newImages[index] = value;
    setImageUrls(newImages);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // 🔥 Filter empty URLs
    const finalImages = imageUrls.filter(url => url.trim() !== '');
    if (finalImages.length === 0) return toast.error("Bhai, kam se kam ek image toh rakho!");

    setUpdating(true);
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        title: formData.title,
        price: parseFloat(formData.price),
        originalPrice: isOnSale ? parseFloat(formData.originalPrice) : null,
        isOnSale: isOnSale,
        isFeatured: isFeatured,
        isFashionFeatured: isFashionFeatured,
        category: formData.category,
        images: finalImages, // 🔥 Array update
        image: finalImages[0], // 🔥 Thumbnail update
        description: formData.description,
        stock: parseInt(formData.stock),
        updatedAt: serverTimestamp()
      });
      toast.success("Product Updated Successfully! 🔄");
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-violet-600 animate-pulse">Fetching Product Details...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/admin/products')} className="flex items-center text-gray-400 hover:text-violet-600 mb-6 font-bold transition-all">
            <ArrowLeft size={20} className="mr-1" /> Back to Inventory
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Modify Product</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
                
                <div>
                    <label className="block text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">Title</label>
                    <input required name="title" value={formData.title} onChange={handleChange} type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold text-gray-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isOnSale ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-transparent'}`} onClick={() => setIsOnSale(!isOnSale)}>
                        <Tag size={20}/> <span className="font-bold text-[10px] uppercase">Sale</span>
                    </div>
                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isFeatured ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-gray-50 border-transparent'}`} onClick={() => setIsFeatured(!isFeatured)}>
                        <Star size={20} fill={isFeatured ? "currentColor" : "none"}/> <span className="font-bold text-[10px] uppercase">Home</span>
                    </div>
                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isFashionFeatured ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-gray-50 border-transparent'}`} onClick={() => setIsFashionFeatured(!isFashionFeatured)}>
                        <Shirt size={20} /> <span className="font-bold text-[10px] uppercase">Fashion</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">Price ($)</label>
                        <input required name="price" value={formData.price} onChange={handleChange} type="number" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold" />
                    </div>
                    {isOnSale && (
                        <div className="animate-fadeIn">
                            <label className="block text-[11px] uppercase tracking-widest font-black text-red-300 mb-2">MRP ($)</label>
                            <input required name="originalPrice" value={formData.originalPrice} onChange={handleChange} type="number" className="w-full p-4 border-none rounded-xl outline-none bg-red-50 text-red-600 font-bold" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700">
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Kids">Kids</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Footwear">Footwear</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home Decor">Home Decor</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">Inventory Stock</label>
                        <input required name="stock" value={formData.stock} onChange={handleChange} type="number" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none font-bold" />
                    </div>
                </div>

                {/* 🔥 MULTI-IMAGE URL SECTION */}
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-100">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ImageIcon size={16} className="text-violet-500"/> Product Gallery (PNG Links)
                    </label>
                    <div className="space-y-3">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                                <input 
                                    type="url" 
                                    value={url} 
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    placeholder={index === 0 ? "Main URL" : `Additional Image ${index+1}`}
                                    className="flex-1 p-3 bg-white border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-violet-500"
                                />
                                {url && <img src={url} className="w-11 h-11 rounded-lg object-cover border bg-white p-1" alt="" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">Description</label>
                    <textarea required name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-medium text-gray-600"></textarea>
                </div>

                <button type="submit" disabled={updating} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-5 rounded-2xl flex justify-center gap-3 shadow-xl shadow-violet-100 transition-all active:scale-95 disabled:opacity-50">
                    {updating ? "Saving Changes..." : <><Save size={20}/> Update Product</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;