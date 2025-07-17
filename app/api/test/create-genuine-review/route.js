// Test API to create a genuine review for testing
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, productId } = await request.json();
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Please provide userId and productId' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Get product and user info
    const product = await Product.findById(productId);
    const user = await User.findById(userId);
    
    if (!product || !user) {
      return NextResponse.json(
        { error: 'Product or User not found' },
        { status: 404 }
      );
    }
    
    // Check if user has purchased this product
    const purchaseRecord = await Order.findOne({
      user: userId,
      'items.product': productId,
      paymentStatus: 'completed',
      status: { $in: ['processing', 'delivered'] }
    }).sort({ createdAt: -1 });
    
    const hasPurchased = !!purchaseRecord;
    const purchaseDate = purchaseRecord ? purchaseRecord.createdAt : null;
    
    // Create a genuine review text
    const genuineReview = {
      comment: "This product is really good quality. I ordered it last month and received it quickly. The packaging was nice and the product works exactly as described. Good value for money and I would recommend it to others.",
      rating: 5
    };
    
    console.log('Creating genuine review for testing...');
    console.log('- User:', user.name);
    console.log('- Product:', product.name);
    console.log('- Has Purchased:', hasPurchased);
    console.log('- Purchase Date:', purchaseDate);
    
    // Initialize ML analysis service
    const analysisService = new ReviewAnalysisService();
    
    // Analyze the review
    const mlAnalysis = await analysisService.analyzeReview({
      comment: genuineReview.comment,
      rating: genuineReview.rating,
      productName: product.name,
      productDescription: product.description,
      productCategory: product.category,
      productPrice: `₹${product.price}`,
      hasPurchased: hasPurchased,
      purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
      reviewDate: new Date().toISOString()
    });
    
    console.log('AI Analysis Result:');
    console.log('- Classification:', mlAnalysis.classification);
    console.log('- Flags:', mlAnalysis.flags);
    console.log('- Purchase verification score:', mlAnalysis.scores?.purchaseVerificationScore);
    
    // Create review in database
    const review = await Review.create({
      user: userId,
      product: productId,
      rating: genuineReview.rating,
      comment: genuineReview.comment,
      aiAnalysis: mlAnalysis,
      status: mlAnalysis.classification === 'suspicious' ? 'flagged' : 'published'
    });
    
    // Get populated review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('product', 'name');
    
    return NextResponse.json({
      success: true,
      message: 'Genuine review created successfully',
      review: populatedReview,
      aiAnalysis: mlAnalysis,
      purchaseInfo: {
        hasPurchased,
        purchaseDate,
        orderId: purchaseRecord?._id
      }
    });
    
  } catch (error) {
    console.error('Create genuine review error:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
}
