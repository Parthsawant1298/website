// app/api/admin/analyze-all-reviews/route.js
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get ALL reviews for re-analysis (force re-analyze everything)
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name price category')
      .limit(50); // Process in batches of 50

    console.log(`Found ${reviews.length} reviews for re-analysis`);

    const analysisService = new ReviewAnalysisService();
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const review of reviews) {
      try {
        // Get purchase verification and product details
        let hasPurchased = false;
        let purchaseDetails = null;
        let product = null;

        // Check if user has purchased this product
        if (review.user && review.product) {
          console.log(`🔍 DEBUG: Checking purchase for user ${review.user._id} and product ${review.product}`);
          
          // First, let's check what orders exist for this user (ANY status)
          const allUserOrders = await Order.find({
            user: review.user._id
          }).populate('items.product');
          
          console.log(`📊 User has ${allUserOrders.length} total orders`);
          allUserOrders.forEach((order, index) => {
            console.log(`Order ${index + 1}: Status=${order.status}, PaymentStatus=${order.paymentStatus}, Items=${order.items.length}`);
            order.items.forEach((item, itemIndex) => {
              console.log(`  Item ${itemIndex + 1}: Product=${item.product?._id || item.product}, Name=${item.product?.name || 'Unknown'}`);
            });
          });
          
          // Now check specifically for this product with broad criteria
          const ordersForProduct = await Order.find({
            user: review.user._id,
            'items.product': review.product
          }).populate('items.product');
          
          console.log(`📦 Found ${ordersForProduct.length} orders containing this specific product`);
          
          // Try different status combinations
          const completedOrders = await Order.find({
            user: review.user._id,
            'items.product': review.product,
            status: 'completed',
            paymentStatus: 'completed'
          }).populate('items.product');
          
          const deliveredOrders = await Order.find({
            user: review.user._id,
            'items.product': review.product,
            status: 'delivered',
            paymentStatus: { $in: ['completed', 'paid', 'success'] }
          }).populate('items.product');
          
          const paidOrders = await Order.find({
            user: review.user._id,
            'items.product': review.product,
            paymentStatus: { $in: ['completed', 'paid', 'success'] }
          }).populate('items.product');
          
          console.log(`Orders found - Completed: ${completedOrders.length}, Delivered: ${deliveredOrders.length}, Paid: ${paidOrders.length}`);

          // Use the most inclusive criteria for purchase verification
          const validOrders = paidOrders.length > 0 ? paidOrders : 
                            deliveredOrders.length > 0 ? deliveredOrders : 
                            completedOrders.length > 0 ? completedOrders : [];

          hasPurchased = validOrders.length > 0;
          if (hasPurchased) {
            purchaseDetails = {
              orderCount: validOrders.length,
              latestOrder: validOrders[validOrders.length - 1].createdAt,
              totalSpent: validOrders.reduce((sum, order) => sum + order.total, 0)
            };
            console.log(`✅ PURCHASE VERIFIED! Found ${validOrders.length} valid orders`);
          } else {
            console.log(`❌ NO PURCHASE FOUND despite checking multiple criteria`);
          }

          // Get product details
          product = await Product.findById(review.product);
        }

        // DEBUG: Log the data being passed to AI analysis
        console.log(`🚀 Sending to AI analysis:`, {
          reviewId: review._id,
          user: review.user?.name || review.user?.email || 'Anonymous',
          comment: review.comment.substring(0, 50) + '...',
          rating: review.rating,
          hasPurchased: hasPurchased,
          hasPurchasedType: typeof hasPurchased,
          productName: product?.name || 'Unknown Product'
        });

        // Run AI analysis with full context
        const analysis = await analysisService.analyzeReview({
          comment: review.comment,
          rating: review.rating,
          user: review.user?.name || review.user?.email || 'Anonymous',
          hasPurchased,
          purchaseDate: purchaseDetails?.latestOrder,
          purchaseDetails,
          productName: product?.name || 'Unknown Product',
          productDescription: product?.description || 'No description available', 
          productCategory: product?.category || 'Unknown Category',
          productPrice: product?.price || 'Unknown Price',
          reviewDate: review.createdAt,
          reviewId: review._id
        });

        // DEBUG: Log what came back from AI analysis
        console.log(`🤖 AI Analysis Result:`, {
          reviewId: review._id,
          classification: analysis.classification,
          confidence: analysis.confidence,
          scores: analysis.scores,
          flags: analysis.flags?.slice(0, 3) // Just first 3 flags
        });

        // Update the review with AI analysis
        await Review.findByIdAndUpdate(review._id, {
          aiAnalysis: analysis,
          status: analysis.classification === 'suspicious' ? 'under_review' : 'published'
        });

        successCount++;
        results.push({
          reviewId: review._id,
          success: true,
          classification: analysis.classification,
          confidence: analysis.confidence
        });

        console.log(`✅ Review ${review._id} analyzed: ${analysis.classification} (Purchase verified: ${hasPurchased})`);

        // Add small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Failed to analyze review ${review._id}:`, error.message);
        
        // Set fallback analysis for failed reviews
        await Review.findByIdAndUpdate(review._id, {
          aiAnalysis: {
            classification: 'pending',
            confidence: 0,
            flags: ['analysis_failed'],
            reasoning: `Analysis failed: ${error.message}`,
            needsManualReview: true,
            analyzedAt: new Date(),
            sentimentScore: 0.5,
            authenticityScore: 0.5
          }
        });
        
        errorCount++;
        results.push({
          reviewId: review._id,
          success: false,
          error: error.message
        });
      }
    }

    // Get updated stats
    const allReviews = await Review.find({});
    const totalAnalyzed = allReviews.filter(r => 
      r.aiAnalysis && r.aiAnalysis.classification !== 'pending'
    ).length;
    const genuine = allReviews.filter(r => 
      r.aiAnalysis && r.aiAnalysis.classification === 'genuine'
    ).length;
    const suspicious = allReviews.filter(r => 
      r.aiAnalysis && r.aiAnalysis.classification === 'suspicious'
    ).length;

    return NextResponse.json({
      success: true,
      message: `Re-analysis completed: ${successCount} analyzed, ${errorCount} failed`,
      stats: {
        processed: reviews.length,
        successful: successCount,
        failed: errorCount,
        totalReviews: allReviews.length,
        totalAnalyzed,
        genuine,
        suspicious
      },
      results
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to run batch analysis' },
      { status: 500 }
    );
  }
}
