// Test API endpoint to test purchase verification logic
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Order from '../../../models/order.js';
import Product from '../../../models/product.js';
import User from '../../../models/user.js';

export async function POST(request) {
  try {
    const { userId, productId } = await request.json();
    
    console.log('🧪 Testing purchase verification for:');
    console.log('- User ID:', userId);
    console.log('- Product ID:', productId);
    
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ User and Product found');
    console.log('- User:', user.name, user.email);
    console.log('- Product:', product.name);
    
    // Test the purchase verification query (exact same as in review API)
    console.log('\n🔍 Running purchase verification query...');
    
    const purchaseRecord = await Order.findOne({
      user: userId,
      'items.product': productId,
      paymentStatus: 'completed',
      status: { $in: ['processing', 'delivered'] }
    }).sort({ createdAt: -1 });
    
    let hasPurchased = false;
    let purchaseDate = null;
    
    if (purchaseRecord) {
      hasPurchased = true;
      purchaseDate = purchaseRecord.createdAt;
      console.log('✅ Purchase verified! Order found:', purchaseRecord._id, 'Date:', purchaseDate);
    } else {
      console.log('❌ No purchase record found');
      
      // Debug step by step
      console.log('\n🐛 Debugging step by step:');
      
      const step1 = await Order.find({ user: userId });
      console.log('1. Total orders by user:', step1.length);
      
      const step2 = await Order.find({ user: userId, 'items.product': productId });
      console.log('2. Orders containing this product:', step2.length);
      
      const step3 = await Order.find({ user: userId, 'items.product': productId, paymentStatus: 'completed' });
      console.log('3. Completed orders with product:', step3.length);
      
      const step4 = await Order.find({ user: userId, 'items.product': productId, paymentStatus: 'completed', status: { $in: ['processing', 'delivered'] } });
      console.log('4. Valid status orders:', step4.length);
      
      // Show all orders for this user for debugging
      const allUserOrders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      console.log('\n📋 All orders for this user:');
      allUserOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order._id}:`);
        console.log(`   Payment: ${order.paymentStatus}, Status: ${order.status}`);
        console.log(`   Date: ${order.createdAt}`);
        console.log(`   Items: ${order.items.length} products`);
        order.items.forEach((item, itemIndex) => {
          console.log(`     Item ${itemIndex + 1}: Product ${item.product} (matches: ${item.product.toString() === productId})`);
        });
      });
    }
    
    return NextResponse.json({
      success: true,
      result: {
        user: { id: user._id, name: user.name, email: user.email },
        product: { id: product._id, name: product.name },
        purchaseVerification: {
          hasPurchased,
          purchaseDate,
          orderId: purchaseRecord?._id,
          verificationQuery: {
            user: userId,
            'items.product': productId,
            paymentStatus: 'completed',
            status: { $in: ['processing', 'delivered'] }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
