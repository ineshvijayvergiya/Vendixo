const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔥 1. WELCOME EMAIL (With 10% Off Personalized)
app.post('/send-welcome', async (req, res) => {
  const { email, name } = req.body;
  try {
    await transporter.sendMail({
      from: `"Vendixo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to Vendixo, ${name}! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 30px; text-align: center;">
          <h1 style="color: #000; font-style: italic; font-weight: 900; letter-spacing: -1px;">VENDIXO</h1>
          <h2 style="color: #7c3aed; margin-top: 20px;">Hi ${name}, Welcome to the Family!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">We're thrilled to have you here. To celebrate your first step with us, we’ve got a special gift for you!</p>
          
          <div style="background: #f8f7ff; padding: 30px; border-radius: 20px; margin: 30px 0; border: 2px dashed #7c3aed;">
            <p style="margin: 0; font-size: 12px; color: #7c3aed; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Your Welcome Coupon</p>
            <h1 style="margin: 10px 0; color: #000; font-size: 40px; letter-spacing: 8px;">VENDIXO10</h1>
            <p style="margin: 0; font-weight: bold; color: #000;">10% OFF ON YOUR FIRST ORDER</p>
          </div>

          <p style="color: #666; font-size: 14px;">Simply enter this code at checkout to claim your discount.</p>
          <a href="https://vendixo.shop" style="display: inline-block; padding: 16px 40px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 15px; font-weight: 900; text-transform: uppercase; margin-top: 20px; box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2);">Start Shopping</a>
          <p style="margin-top: 40px; font-size: 12px; color: #aaa;">Best Regards,<br><b>Team Vendixo</b></p>
        </div>
      `
    });
    res.status(200).json({ message: "Personalized Welcome Email Sent!" });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 🔥 2. ORDER CONFIRMATION (Personalized)
app.post('/send-order', async (req, res) => {
  const { email, name, orderDetails } = req.body;
  try {
    await transporter.sendMail({
      from: `"Vendixo Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmed, ${name}! 📦 (#${orderDetails.orderId.toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; padding: 30px; border: 1px solid #ddd; max-width: 600px; border-radius: 25px;">
          <h2 style="color: #000;">Excellent Choice, ${name}!</h2>
          <p style="color: #555;">Your order has been successfully placed and is being prepared for shipment.</p>
          <div style="background: #f9f9f9; padding: 25px; border-radius: 20px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Items:</strong> ${orderDetails.itemsCount}</p>
          </div>
          <p style="font-size: 14px; color: #888;">We'll send you another update as soon as your package ships!</p>
        </div>
      `
    });
    res.status(200).json({ message: "Order Email Sent!" });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 🔥 3. ORDER DELIVERED
app.post('/send-delivered', async (req, res) => {
  const { email, name, orderId } = req.body;
  try {
    await transporter.sendMail({
      from: `"Vendixo Updates" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Delivered! Enjoy your new gear, ${name} 🎁`,
      html: `
        <div style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: auto;">
          <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
          <h2 style="color: #10b981; margin-bottom: 10px;">Delivered Successfully!</h2>
          <p style="color: #666;">Hi ${name}, your Vendixo package #${orderId} has arrived at its destination.</p>
          <p style="color: #666; margin-bottom: 30px;">We hope you're loving your purchase. Would you mind sharing your experience?</p>
          <a href="https://vendixo.shop/profile" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Review Order</a>
        </div>
      `
    });
    res.status(200).json({ message: "Delivery Email Sent!" });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 🔥 4. BACK IN STOCK
app.post('/send-back-in-stock', async (req, res) => {
  const { email, name, productName, productUrl } = req.body;
  try {
    await transporter.sendMail({
      from: `"Vendixo Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Quick! ${productName} is back in stock, ${name}! 🔥`,
      html: `
        <div style="font-family: sans-serif; padding: 30px; border: 2px solid #7c3aed; border-radius: 25px; text-align: center;">
          <h2 style="color: #7c3aed;">It's Back for You!</h2>
          <p>Hi ${name}, the item you've been waiting for is finally available again.</p>
          <h3 style="color: #000; margin: 20px 0;">${productName}</h3>
          <p>Stock is limited and moving fast. Don't miss out this time!</p>
          <a href="${productUrl}" style="background: #7c3aed; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; text-transform: uppercase;">Secure Yours Now</a>
        </div>
      `
    });
    res.status(200).json({ message: "Stock Alert Sent!" });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 🔥 5. LOGIN ALERT
app.post('/send-login-alert', async (req, res) => {
  const { email, name, time } = req.body;
  try {
    await transporter.sendMail({
      from: `"Vendixo Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Security Alert: New Login for ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 30px; background: #fffcf0; border: 1px solid #ffeeba; border-radius: 20px;">
          <h3 style="color: #856404;">New Sign-in Detected</h3>
          <p>Hi ${name}, your Vendixo account was just accessed at <b>${time}</b>.</p>
          <p style="font-size: 13px; color: #666;">If this was you, no action is needed. If you don't recognize this activity, please reset your password immediately to secure your account.</p>
        </div>
      `
    });
    res.status(200).json({ message: "Security Alert Sent!" });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Vendixo Backend running on port ${PORT}`));