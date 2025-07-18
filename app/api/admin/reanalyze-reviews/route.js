// API endpoint to re-analyze all existing reviews
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Review from '@/models/review';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔄 Starting batch re-analysis of all existing reviews...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Get ALL reviews - force re-analysis of everything
    console.log('🔍 Searching for reviews in database...');
    const reviews = await Review.find({})
      .populate('product')
      .populate('user');
    
    console.log(`📊 Found ${reviews.length} total reviews to re-analyze (forcing all)`);
    
    if (reviews.length === 0) {
      console.log('❌ No reviews found in database!');
      
      // Debug: Check if reviews exist without populate
      const reviewsWithoutPopulate = await Review.find({});
      console.log(`🐛 Debug: Found ${reviewsWithoutPopulate.length} reviews without populate`);
      
      return NextResponse.json({
        success: true,
        message: 'No reviews found in database',
        summary: { total: 0, analyzed: 0, failed: 0 },
        results: [],
        debug: {
          reviewsWithoutPopulate: reviewsWithoutPopulate.length,
          reviewsWithPopulate: reviews.length
        }
      });
    }
    
    const analysisService = new ReviewAnalysisService();
    let analyzed = 0;
    let failed = 0;
    let results = [];
    
    for (const review of reviews) {
      try {
        console.log(`\n🔍 Analyzing review ${analyzed + 1}/${reviews.length}`);
        console.log(`Review ID: ${review._id}`);
        console.log(`Product: ${review.product.name}`);
        console.log(`User: ${review.user.name}`);
        
        // Check purchase verification for this review
        const purchaseRecord = await Order.findOne({
          user: review.user._id,
          'items.product': review.product._id,
          paymentStatus: 'completed',
          status: { $in: ['processing', 'delivered'] }
        }).sort({ createdAt: -1 });
        
        const hasPurchased = !!purchaseRecord;
        const purchaseDate = purchaseRecord ? purchaseRecord.createdAt : null;
        
        console.log(`🔍 PURCHASE VERIFICATION DEBUG:`);
        console.log(`- User ID: ${review.user._id}`);
        console.log(`- Product ID: ${review.product._id}`);
        console.log(`- Purchase verified: ${hasPurchased}`);
        console.log(`- Purchase record exists: ${!!purchaseRecord}`);
        if (purchaseRecord) {
          console.log(`- Purchase date: ${purchaseDate}`);
          console.log(`- Order ID: ${purchaseRecord._id}`);
          console.log(`- Payment status: ${purchaseRecord.paymentStatus}`);
          console.log(`- Order status: ${purchaseRecord.status}`);
        }
        
        // Prepare analysis data with explicit debugging
        const analysisData = {
          comment: review.comment,
          rating: review.rating,
          productName: review.product.name,
          productDescription: review.product.description,
          productCategory: review.product.category,
          productPrice: `₹${review.product.price}`,
          hasPurchased: hasPurchased,
          purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
          reviewDate: review.createdAt ? review.createdAt.toISOString() : new Date().toISOString(),
          user: review.user.name || 'Anonymous'
        };
        
        console.log(`📊 Analysis data being sent to AI:`);
        console.log(`- hasPurchased: ${analysisData.hasPurchased} (type: ${typeof analysisData.hasPurchased})`);
        console.log(`- purchaseDate: ${analysisData.purchaseDate}`);
        console.log(`- hasImages: ${review.images && review.images.length > 0}`);
        
        // Check if review has images and use appropriate analysis method
        let analysisResult;
        if (review.images && review.images.length > 0 && review.images[0].url) {
          console.log(`🖼️ Review has ${review.images.length} images - using image analysis`);
          console.log(`🖼️ Image URL: ${review.images[0].url.substring(0, 50)}...`);
          try {
            // For reviews with images, use image analysis - pass URL string, not object
            analysisResult = await analysisService.analyzeReviewWithImage(analysisData, review.images[0].url);
          } catch (imageError) {
            console.warn(`⚠️ Image analysis failed, falling back to text-only:`, imageError.message);
            // Fallback to text-only analysis if image processing fails
            analysisResult = await analysisService.analyzeReview(analysisData);
          }
        } else {
          console.log(`📝 Review has no images or invalid image URL - using text-only analysis`);
          // For text-only reviews, use standard analysis
          analysisResult = await analysisService.analyzeReview(analysisData);
        }
        
        // Update the review with new analysis
        await Review.findByIdAndUpdate(review._id, {
          aiAnalysis: analysisResult,
          status: analysisResult.classification === 'suspicious' ? 'flagged' : 'published'
        });
        
        console.log(`✅ Updated - Classification: ${analysisResult.classification}`);
        console.log(`Flags: ${analysisResult.flags.join(', ')}`);
        console.log(`Purchase verification score: ${analysisResult.scores?.purchaseVerificationScore}`);
        if (analysisResult.imageAnalysis) {
          console.log(`🖼️ Image analysis - Product match: ${analysisResult.imageAnalysis.productMatch}`);
          console.log(`🖼️ Image flags: ${analysisResult.flags.filter(f => f.includes('image')).join(', ') || 'none'}`);
        }
        
        results.push({
          reviewId: review._id,
          product: review.product.name,
          user: review.user.name,
          hasPurchased,
          hasImages: review.images && review.images.length > 0,
          classification: analysisResult.classification,
          flags: analysisResult.flags,
          purchaseVerificationScore: analysisResult.scores?.purchaseVerificationScore,
          imageProductMatch: analysisResult.imageAnalysis?.productMatch
        });
        
        analyzed++;
        
      } catch (error) {
        console.error(`❌ Failed to analyze review ${review._id}:`, error);
        failed++;
        
        results.push({
          reviewId: review._id,
          error: error.message
        });
      }
    }
    
    console.log(`\n📈 Batch Analysis Complete!`);
    console.log(`✅ Successfully analyzed: ${analyzed} reviews`);
    console.log(`❌ Failed: ${failed} reviews`);
    
    return NextResponse.json({
      success: true,
      message: `Re-analyzed ${analyzed} reviews successfully, ${failed} failed`,
      summary: {
        total: reviews.length,
        analyzed,
        failed
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Batch analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Batch analysis failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
