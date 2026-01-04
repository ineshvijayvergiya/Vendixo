const BACKEND_URL = "http://localhost:5000";

// 1. Welcome Email (Signup ke liye)
export const sendWelcomeEmail = async (user) => {
  try {
    const response = await fetch(`${BACKEND_URL}/send-welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName || "User"
      })
    });
    if (response.ok) console.log('Welcome Mail Sent! ✅');
  } catch (err) {
    console.error('Welcome Mail Failed:', err);
  }
};

// 2. Order Confirmation (Checkout ke liye)
export const sendOrderEmail = async (user, orderDetails) => {
  try {
    const response = await fetch(`${BACKEND_URL}/send-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName || "Customer",
        orderDetails: orderDetails
      })
    });
    if (response.ok) console.log('Order Confirmation Sent! 📦');
  } catch (err) {
    console.error('Order Mail Failed:', err);
  }
};

// 🔥 3. Delivered Email (Admin Panel se call hoga)
export const sendDeliveredEmail = async (orderData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/send-delivered`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: orderData.email,
        name: orderData.customerName,
        orderId: orderData.id
      })
    });
    if (response.ok) console.log('Delivery Mail Sent! 🎁');
  } catch (err) {
    console.error('Delivery Mail Failed:', err);
  }
};

// 🔥 4. Back in Stock Alert (Waitlist ke liye)
export const sendStockAlertEmail = async (email, productName, productId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/send-back-in-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        productName: productName,
        productUrl: `http://localhost:3000/product/${productId}` // Tera frontend URL
      })
    });
    if (response.ok) console.log('Stock Alert Sent! 🔥');
  } catch (err) {
    console.error('Stock Alert Failed:', err);
  }
};

// 🔥 5. Login Alert (Security ke liye)
export const sendLoginAlertEmail = async (user) => {
  try {
    const response = await fetch(`${BACKEND_URL}/send-login-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName || "User",
        time: new Date().toLocaleString()
      })
    });
    if (response.ok) console.log('Login Alert Sent! 🔐');
  } catch (err) {
    console.error('Login Alert Failed:', err);
  }
};