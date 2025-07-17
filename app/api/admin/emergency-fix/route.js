// Emergency fix for specific user's purchase verification
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userName, productName } = await request.json();
    
    console.log(`🔧 Emergency fix for user: ${userName}, product: ${productName}`);
    
    await connectDB();
    
    // Find the user
    const user = await User.findOne({ name: userName });
    if (!user) {
      return NextResponse.json({ error: `User ${userName} not found` }, { status: 404 });
    }
    
    // Find the product
    let product = null;
    if (productName) {
      product = await Product.findOne({ name: { $regex: productName, $options: 'i' } });
    }
    
    // Find the review(s)
    const query = { user: user._id };
    if (product) {
      query.product = product._id;
    }
    
    const reviews = await Review.find(query)
      .populate('product')
      .populate('user');
    
    console.log(`📋 Found ${reviews.length} reviews for ${userName}`);
    
    if (reviews.length === 0) {
      return NextResponse.json({ error: 'No reviews found for this user' }, { status: 404 });
    }
    
    const analysisService = new ReviewAnalysisService();
    const results = [];
    
    for (const review of reviews) {
      console.log(`\n🔍 Processing review for product: ${review.product.name}`);
      
      // FORCE CHECK purchase verification
      const purchaseRecord = await Order.findOne({
        user: user._id,
        'items.product': review.product._id,
        paymentStatus: 'completed',
        status: { $in: ['processing', 'delivered'] }
      }).sort({ createdAt: -1 });
      
      const hasPurchased = !!purchaseRecord;
      const purchaseDate = purchaseRecord ? purchaseRecord.createdAt : null;
      
      console.log(`💰 PURCHASE VERIFICATION RESULTS:`);
      console.log(`- User: ${user.name} (${user._id})`);
      console.log(`- Product: ${review.product.name} (${review.product._id})`);
      console.log(`- Has Purchased: ${hasPurchased}`);
      console.log(`- Purchase Record: ${purchaseRecord ? purchaseRecord._id : 'NONE'}`);
      
      if (purchaseRecord) {
        console.log(`- Order ID: ${purchaseRecord._id}`);
        console.log(`- Payment Status: ${purchaseRecord.paymentStatus}`);
        console.log(`- Order Status: ${purchaseRecord.status}`);
        console.log(`- Purchase Date: ${purchaseDate}`);
      }
      
      // Re-analyze with CORRECTED purchase verification
      const analysisResult = await analysisService.analyzeReview({
        comment: review.comment,
        rating: review.rating,
        productName: review.product.name,
        productDescription: review.product.description,
        productCategory: review.product.category,
        productPrice: `₹${review.product.price}`,
        hasPurchased: hasPurchased,
        purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
        reviewDate: review.createdAt ? review.createdAt.toISOString() : new Date().toISOString()
      });
      
      // Update the review
      await Review.findByIdAndUpdate(review._id, {
        aiAnalysis: analysisResult,
        status: analysisResult.classification === 'suspicious' ? 'flagged' : 'published'
      });
      
      console.log(`✅ ANALYSIS RESULTS:`);
      console.log(`- Classification: ${analysisResult.classification}`);
      console.log(`- Confidence: ${analysisResult.confidence}`);
      console.log(`- Flags: ${analysisResult.flags.join(', ')}`);
      console.log(`- Purchase Verification Score: ${analysisResult.scores?.purchaseVerificationScore}`);
      console.log(`- Has 'no_purchase_record' flag: ${analysisResult.flags.includes('no_purchase_record')}`);
      console.log(`- Has 'unverified_reviewer' flag: ${analysisResult.flags.includes('unverified_reviewer')}`);
      
      results.push({
        reviewId: review._id,
        product: review.product.name,
        originalComment: review.comment,
        hasPurchased,
        purchaseOrderId: purchaseRecord?._id,
        newClassification: analysisResult.classification,
        newFlags: analysisResult.flags,
        purchaseVerificationScore: analysisResult.scores?.purchaseVerificationScore,
        fixed: hasPurchased && !analysisResult.flags.includes('no_purchase_record')
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${results.length} reviews for ${userName}`,
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Emergency fix error:', error);
    return NextResponse.json(
      { error: 'Fix failed', details: error.message },
      { status: 500 }
    );
  }
}
