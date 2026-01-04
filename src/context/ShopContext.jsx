import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  // 🔥 Initial state ab localStorage se uthayega taaki refresh pe data na jaye
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWish = localStorage.getItem('shop_wishlist');
    return savedWish ? JSON.parse(savedWish) : [];
  });

  // 🔥 Jab bhi cart ya wishlist change ho, use save karo
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    toast.error("Item removed from Cart");
  };

  const updateQuantity = (productId, amount) => {
    setCart((prev) => prev.map((item) => 
        item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shop_cart');
  };

  // --- WISHLIST LOGIC ---
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        toast.error("Removed from Wishlist 💔");
        return prev.filter((item) => item.id !== product.id);
      } else {
        toast.success("Added to Wishlist ❤️");
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart, // Checkout ke baad kaam aayega
    wishlist,
    toggleWishlist, // 🔥 Make sure ProductCard uses THIS name
    removeFromWishlist
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};