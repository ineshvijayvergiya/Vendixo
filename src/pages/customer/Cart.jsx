import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button';

const Cart = () => {
  const navigate = useNavigate();
  // ShopContext se cart aur functions mangwa rahe hain
  const { cart, removeFromCart, setCart } = useShop();

  // Total Price Calculate karna
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 10; // $50 se upar free shipping
  const total = subtotal + shipping;

  // Quantity Badhana (+)
  const incrementQuantity = (productId) => {
    setCart(prevCart => prevCart.map(item => 
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Quantity Ghatana (-)
  const decrementQuantity = (productId) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item;
      }
      return item;
    }));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop">
          <Button variant="primary">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- LEFT: CART ITEMS --- */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <p className="font-bold text-lg">${item.price}</p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button onClick={() => decrementQuantity(item.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600">-</button>
                        <span className="px-3 py-1 font-medium text-gray-900 border-x border-gray-300">{item.quantity}</span>
                        <button onClick={() => incrementQuantity(item.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600">+</button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: ORDER SUMMARY --- */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button fullWidth onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>

              <div className="mt-6 flex justify-center">
                <Link to="/shop" className="text-sm text-gray-500 hover:text-violet-600 flex items-center gap-2">
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;