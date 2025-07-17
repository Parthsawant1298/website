// Simple test script to run purchase verification
const mongoose = require('mongoose');

// Define schemas inline to avoid import issues
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['processing', 'delivered', 'payment failed'], default: 'processing' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number
});

// MongoDB URI
const mongoUri = 'mongodb+srv://sawaleparth:parth123@cluster0.qdqxh.mongodb.net/housekeeping?retryWrites=true&w=majority&appName=Cluster0';

async function testPurchaseVerification() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create models
    const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    // The order ID the user mentioned
    const orderId = '686d38d75d59456fc57c9ed3';
    
    console.log('\n🔍 Looking for Order ID:', orderId);
    
    // Find the specific order
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('❌ Order not found with ID:', orderId);
      
      // Let's search for recent orders to see what's in the database
      console.log('\n📋 Searching for recent orders...');
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
      console.log('Recent orders found:', recentOrders.length);
      
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order._id}`);
        console.log(`   User: ${order.user}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment: ${order.paymentStatus}`);
        console.log(`   Date: ${order.createdAt}`);
        console.log(`   Items: ${order.items.length}`);
        console.log('');
      });
      
      return;
    }
    
    console.log('\n📦 Order found!');
    console.log('- Order ID:', order._id);
    console.log('- User ID:', order.user);
    console.log('- Payment Status:', order.paymentStatus);
    console.log('- Order Status:', order.status);
    console.log('- Created Date:', order.createdAt);
    console.log('- Items Count:', order.items.length);
    
    // Test the purchase verification query for each item
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const productId = item.product;
      const userId = order.user;
      
      console.log(`\n--- Testing Item ${i + 1} ---`);
      console.log('Product ID:', productId);
      console.log('User ID:', userId);
      
      // This is the exact query from the API
      const purchaseRecord = await Order.findOne({
        user: userId,
        'items.product': productId,
        paymentStatus: 'completed',
        status: { $in: ['processing', 'delivered'] }
      }).sort({ createdAt: -1 });
      
      if (purchaseRecord) {
        console.log('✅ PURCHASE VERIFIED!');
        console.log('Found Order ID:', purchaseRecord._id);
        console.log('Payment Status:', purchaseRecord.paymentStatus);
        console.log('Order Status:', purchaseRecord.status);
      } else {
        console.log('❌ NO PURCHASE RECORD FOUND');
        
        // Debug each condition
        console.log('\n🐛 Debugging conditions:');
        
        const step1 = await Order.find({ user: userId });
        console.log('1. Orders by user:', step1.length);
        
        const step2 = await Order.find({ user: userId, 'items.product': productId });
        console.log('2. Orders with product:', step2.length);
        
        const step3 = await Order.find({ user: userId, 'items.product': productId, paymentStatus: 'completed' });
        console.log('3. Completed orders:', step3.length);
        
        const step4 = await Order.find({ user: userId, 'items.product': productId, paymentStatus: 'completed', status: { $in: ['processing', 'delivered'] } });
        console.log('4. Valid status orders:', step4.length);
        
        // Show what the current order's status actually is
        console.log('\nCurrent order details:');
        console.log('- Payment Status:', order.paymentStatus);
        console.log('- Order Status:', order.status);
        console.log('- Matches payment=completed?', order.paymentStatus === 'completed');
        console.log('- Matches status in [processing,delivered]?', ['processing', 'delivered'].includes(order.status));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testPurchaseVerification();
