import React, { useState } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Tag, Star, Shirt, Plus, X } from 'lucide-react'; 
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Toggles
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false); 
  const [isFashionFeatured, setIsFashionFeatured] = useState(false); 

  // 🔥 Multi-Image State
  const [imageUrls, setImageUrls] = useState(['', '', '', '']); // 4 empty slots

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    category: 'Men',
    description: '',
    stock: '10'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 Handle Image Input Changes
  const handleImageChange = (index, value) => {
    const newImages = [...imageUrls];
    newImages[index] = value;
    setImageUrls(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty strings from images array
    const finalImages = imageUrls.filter(url => url.trim() !== '');
    
    if (finalImages.length === 0) {
      return toast.error("Please add at least one product image!");
    }

    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        price: parseFloat(formData.price),
        originalPrice: isOnSale ? parseFloat(formData.originalPrice) : null,
        isOnSale: isOnSale,
        isFeatured: isFeatured,
        isFashionFeatured: isFashionFeatured,
        category: formData.category,
        images: finalImages, // 🔥 Now saving an array of images
        image: finalImages[0], // 👈 Backward compatibility (Main Image)
        description: formData.description,
        stock: parseInt(formData.stock),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "products"), productData);
      toast.success("Product with multiple images added! 🎉");
      navigate('/admin/products');

    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/admin/products')} className="flex items-center text-gray-500 hover:text-violet-600 mb-6 font-semibold transition-all">
            <ArrowLeft size={20} className="mr-1" /> Back to Products
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Title</label>
                    <input required name="title" onChange={handleChange} type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-medium" placeholder="e.g. Nike Air Jordan (PNG Image Recommended)" />
                </div>

                {/* TOGGLES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isOnSale ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-transparent'}`} onClick={() => setIsOnSale(!isOnSale)}>
                        <Tag size={20}/> 
                        <span className="font-bold text-[10px] uppercase">On Sale</span>
                    </div>

                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isFeatured ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-gray-50 border-transparent'}`} onClick={() => setIsFeatured(!isFeatured)}>
                        <Star size={20} fill={isFeatured ? "currentColor" : "none"}/> 
                        <span className="font-bold text-[10px] uppercase">Home Slider</span>
                    </div>

                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isFashionFeatured ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-gray-50 border-transparent'}`} onClick={() => setIsFashionFeatured(!isFashionFeatured)}>
                        <Shirt size={20} /> 
                        <span className="font-bold text-[10px] uppercase">Fashion Slider</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide text-[11px]">Selling Price ($)</label>
                        <input required name="price" onChange={handleChange} type="number" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold" />
                    </div>
                    {isOnSale && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-bold text-red-400 mb-2 uppercase tracking-wide text-[11px]">Original MRP ($)</label>
                            <input required name="originalPrice" onChange={handleChange} type="number" className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-red-200 bg-red-50 text-red-600 font-bold" />
                        </div>
                    )}
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide text-[11px]">Category</label>
                        <select name="category" onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-medium">
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Kids">Kids</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Footwear">Footwear</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home Decor">Home Decor</option>
                            <option value="Sports">Sports</option>
                            <option value="Fashion">Audio</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide text-[11px]">Stock Qty</label>
                        <input required name="stock" onChange={handleChange} type="number" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-medium" placeholder="10" />
                    </div>
                </div>

                {/* 🔥 MULTIPLE IMAGE URLS 🔥 */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon size={18} className="text-violet-600"/> Product Images (PNG Links)
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                                <span className="bg-white border flex items-center justify-center w-10 rounded-lg text-xs font-bold text-gray-400">{index + 1}</span>
                                <input 
                                    type="url" 
                                    value={url} 
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    placeholder={index === 0 ? "Main Image URL (Required)" : `Additional Image ${index + 1} (Optional)`}
                                    className="flex-1 p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Tip: Use transparent PNG links for the best look on the website.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide text-[11px]">Product Description</label>
                    <textarea required name="description" rows="4" onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px]" placeholder="Explain the features, material, and size..."></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-violet-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? "Adding Product..." : <><Plus size={20}/> Save Product</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;