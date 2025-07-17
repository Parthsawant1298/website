// Debug script to test purchase verification logic
import mongoose from 'mongoose';
import Order from '../models/order.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sawaleparth:parth123@cluster0.qdqxh.mongodb.net/housekeeping?retryWrites=true&w=majority&appName=Cluster0';

async function debugPurchaseVerification() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // The user mentioned Order ID: 686d38d75d59456fc57c9ed3
    const orderId = '686d38d75d59456fc57c9ed3';
    
    console.log('\n🔍 Looking for Order ID:', orderId);
    
    // Find the specific order
    const order = await Order.findById(orderId).populate('user').populate('items.product');
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('\n📦 Order Details:');
    console.log('- Order ID:', order._id);
    console.log('- User ID:', order.user._id);
    console.log('- User Name:', order.user.name);
    console.log('- Payment Status:', order.paymentStatus);
    console.log('- Order Status:', order.status);
    console.log('- Created Date:', order.createdAt);
    console.log('- Items Count:', order.items.length);
    
    console.log('\n🛍️ Items in Order:');
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. Product ID: ${item.product._id}`);
      console.log(`     Product Name: ${item.product.name}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: ₹${item.price}`);
    });
    
    // Test purchase verification logic for each product
    console.log('\n🔍 Testing Purchase Verification Logic:');
    
    for (const item of order.items) {
      const productId = item.product._id;
      const userId = order.user._id;
      
      console.log(`\n--- Testing for Product: ${item.product.name} ---`);
      
      // This is the exact query from the API
      const purchaseRecord = await Order.findOne({
        user: userId,
        'items.product': productId,
        paymentStatus: 'completed',
        status: { $in: ['processing', 'delivered'] }
      }).sort({ createdAt: -1 });
      
      console.log('Query Results:');
      console.log('- User ID:', userId);
      console.log('- Product ID:', productId);
      console.log('- Purchase Record Found:', !!purchaseRecord);
      
      if (purchaseRecord) {
        console.log('✅ PURCHASE VERIFIED!');
        console.log('- Order ID:', purchaseRecord._id);
        console.log('- Payment Status:', purchaseRecord.paymentStatus);
        console.log('- Order Status:', purchaseRecord.status);
        console.log('- Purchase Date:', purchaseRecord.createdAt);
      } else {
        console.log('❌ NO PURCHASE RECORD FOUND');
        
        // Debug why it failed
        console.log('\n🐛 Debugging why query failed:');
        
        // Check each condition separately
        const userOrders = await Order.find({ user: userId });
        console.log('- Total orders by this user:', userOrders.length);
        
        const ordersWithProduct = await Order.find({
          user: userId,
          'items.product': productId
        });
        console.log('- Orders with this product:', ordersWithProduct.length);
        
        const completedOrders = await Order.find({
          user: userId,
          'items.product': productId,
          paymentStatus: 'completed'
        });
        console.log('- Completed payment orders:', completedOrders.length);
        
        const validStatusOrders = await Order.find({
          user: userId,
          'items.product': productId,
          paymentStatus: 'completed',
          status: { $in: ['processing', 'delivered'] }
        });
        console.log('- Orders with valid status:', validStatusOrders.length);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

debugPurchaseVerification();
