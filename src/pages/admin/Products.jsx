import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Edit } from 'lucide-react'; // Edit icon import kiya
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(product => product.id !== id));
        toast.success("Product Deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Products...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link to="/admin/products/add">
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all">
            <Plus size={20} /> Add New Product
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 overflow-hidden relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              
              <div className="absolute top-2 right-2 flex gap-2">
                  {/* 🔥 EDIT BUTTON (Link to Edit Page) */}
                  <Link to={`/admin/products/edit/${product.id}`}>
                    <button className="bg-white p-2 rounded-full text-blue-500 hover:bg-blue-50 shadow-sm transition-transform hover:scale-110">
                        <Edit size={16} />
                    </button>
                  </Link>

                  {/* DELETE BUTTON */}
                  <button 
                      onClick={() => handleDelete(product.id)}
                      className="bg-white p-2 rounded-full text-red-500 hover:bg-red-50 shadow-sm transition-transform hover:scale-110"
                  >
                      <Trash2 size={16} />
                  </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
              <div className="flex justify-between items-center">
                <span className="font-bold text-violet-600">${product.price}</span>
                <span className={`text-xs px-2 py-1 rounded ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    Stock: {product.stock}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;