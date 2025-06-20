// app/api/payment/verify/route.js with comprehensive email receipt functionality
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Mongoose models and database connection
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';

// Verify Razorpay signature
function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  // Validate input parameters
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    console.error('Missing signature verification parameters');
    return false;
  }

  const text = razorpayOrderId + '|' + razorpayPaymentId;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // Additional validation for secret
  if (!secret) {
    console.error('Razorpay key secret is missing');
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
    
    return generatedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Create email transporter
function createEmailTransporter() {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Bypass SSL certificate issues (only for debugging)
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Send email receipt to customer
async function sendReceiptEmail(order, user) {
  try {
    // Create email transporter
    const transporter = createEmailTransporter();

    // Format order items for email
    const itemsList = order.items.map(item => {
      const product = item.product;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    // Format the date
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    // Create the email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d9488; margin: 0;">Koncept Services</h1>
          <p style="color: #666;">Order Confirmation</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Payment ID:</strong> ${order.paymentInfo.razorpayPaymentId}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Shipping Address</h3>
          <p>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₹${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #666; text-align: center;">Thank you for your order! If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    // Send the email with comprehensive logging
    console.log('Attempting to send email:', {
      from: `"Koncept Services" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${order._id}`
    });

    const info = await transporter.sendMail({
      from: `"Koncept Services" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${order._id}`,
      html: emailHtml
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });

    return true;
  } catch (error) {
    // Comprehensive error logging
    console.error('Detailed Email Sending Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
}

export async function POST(request) {
  try {
    // Await cookies store
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get payment verification details from request
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature 
    } = await request.json();
    
    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature
    );
    
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    // Find the order
    const order = await Order.findOne({ 
      'paymentInfo.razorpayOrderId': razorpayOrderId,
      user: userId
    }).populate('items.product');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Verify products are still available and reduce stock
    const availabilityIssues = [];
    const stockReductionResults = await Promise.all(
      order.items.map(async (item) => {
        // Find the product
        const product = await Product.findById(item.product._id);
        
        if (!product) {
          availabilityIssues.push({
            productId: item.product._id,
            message: 'Product no longer exists'
          });
          return false;
        }
        
        // Check product availability
        if (product.quantity < item.quantity) {
          availabilityIssues.push({
            productId: product._id,
            name: product.name,
            requestedQuantity: item.quantity,
            availableQuantity: product.quantity,
            message: `Only ${product.quantity} units available`
          });
          return false;
        }
        
        // Reduce stock - only after successful payment verification
        product.quantity -= item.quantity;
        
        if (product.quantity < 0) {
          availabilityIssues.push({
            productId: product._id,
            name: product.name,
            requestedQuantity: item.quantity,
            availableQuantity: product.quantity + item.quantity,
            message: 'Failed to reduce stock'
          });
          return false;
        }
        
        // Save the updated product
        await product.save();
        return true;
      })
    );
    
    // Check if all stock reductions were successful
    if (availabilityIssues.length > 0 || stockReductionResults.includes(false)) {
      // Rollback any successful stock reductions
      await Promise.all(
        order.items.map(async (item, index) => {
          if (stockReductionResults[index]) {  // Only rollback successful reductions
            const product = await Product.findById(item.product._id);
            if (product) {
              // Restore original quantity if stock was reduced
              product.quantity += item.quantity;
              await product.save();
            }
          }
        })
      );
      
      return NextResponse.json({ 
        error: 'Some products are no longer available',
        availabilityIssues 
      }, { status: 400 });
    }
    
    // Update order status - Changed to 'processing' when payment is successful
    order.status = 'processing';
    order.paymentStatus = 'completed';
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.paymentInfo.razorpaySignature = razorpaySignature;
    
    // Save the updated order
    await order.save();
    
    // Get user data for email
    const user = await User.findById(userId);
    
    // Send receipt email if we have user email
    let emailSent = false;
    if (user && user.email) {
      emailSent = await sendReceiptEmail(order, user);
    }
    
    // Clear the user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified and order processed successfully',
      emailSent,
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}