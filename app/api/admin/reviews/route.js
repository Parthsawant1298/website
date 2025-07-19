// app/api/admin/reviews/route.js
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET all reviews with filtering options
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    await connectDB();
    
    // Ensure models are registered (required for populate to work)
    const productModel = Product;
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'all', 'published', 'flagged', 'hidden', 'under_review'
    const classification = searchParams.get('classification'); // 'all', 'genuine', 'suspicious', 'pending'
    const needsReview = searchParams.get('needsReview'); // 'true', 'false'
    const statsOnly = searchParams.get('statsOnly'); // 'true' for stats only
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    // If only stats are requested
    if (statsOnly === 'true') {
      const allReviews = await Review.find({});
      const totalReviews = allReviews.length;
      
      let analyzedCount = 0;
      let authenticCount = 0;
      let suspiciousCount = 0;
      let flaggedCount = 0;
      let totalConfidence = 0;
      let confidenceCount = 0;
      let productMismatchCount = 0;
      let noPurchaseCount = 0;
      let totalProductRelevance = 0;
      let productRelevanceCount = 0;
      let totalPurchaseVerification = 0;
      let purchaseVerificationCount = 0;

      allReviews.forEach(review => {
        if (review.aiAnalysis) {
          if (review.aiAnalysis.classification && review.aiAnalysis.classification !== 'pending') {
            analyzedCount++;
          }
          if (review.aiAnalysis.classification === 'genuine' || review.aiAnalysis.classification === 'legitimate') {
            authenticCount++;
          }
          if (review.aiAnalysis.classification === 'suspicious') {
            suspiciousCount++;
          }
          if (review.aiAnalysis.needsManualReview || review.status === 'flagged') {
            flaggedCount++;
          }
          if (review.aiAnalysis.confidence !== undefined) {
            totalConfidence += review.aiAnalysis.confidence;
            confidenceCount++;
          }
          
          // Enhanced metrics
          if (review.aiAnalysis.flags && review.aiAnalysis.flags.includes('product_mismatch')) {
            productMismatchCount++;
          }
          if (review.aiAnalysis.flags && review.aiAnalysis.flags.includes('no_purchase_verification')) {
            noPurchaseCount++;
          }
          if (review.aiAnalysis.productRelevanceScore !== undefined) {
            totalProductRelevance += review.aiAnalysis.productRelevanceScore;
            productRelevanceCount++;
          }
          if (review.aiAnalysis.purchaseVerificationScore !== undefined) {
            totalPurchaseVerification += review.aiAnalysis.purchaseVerificationScore;
            purchaseVerificationCount++;
          }
        }
      });

      // Get recent analysis
      const recentAnalysis = await Review.find({
        'aiAnalysis.analyzedAt': { $exists: true }
      })
        .populate('user', 'name')
        .populate('product', 'name')
        .sort({ 'aiAnalysis.analyzedAt': -1 })
        .limit(5)
        .select('aiAnalysis user product createdAt');

      const stats = {
        total: totalReviews,
        analyzed: analyzedCount,
        authentic: authenticCount,
        suspicious: suspiciousCount,
        flagged: flaggedCount,
        averageScore: confidenceCount > 0 ? (totalConfidence / confidenceCount) : 0,
        // Enhanced metrics
        productMismatch: productMismatchCount,
        noPurchaseVerification: noPurchaseCount,
        averageProductRelevance: productRelevanceCount > 0 ? (totalProductRelevance / productRelevanceCount) : 0,
        averagePurchaseVerification: purchaseVerificationCount > 0 ? (totalPurchaseVerification / purchaseVerificationCount) : 0,
        recentAnalysis: recentAnalysis.map(review => ({
          productName: review.product?.name || 'Unknown Product',
          userName: review.user?.name || 'Anonymous',
          classification: review.aiAnalysis.classification,
          confidence: review.aiAnalysis.confidence,
          productRelevance: review.aiAnalysis.productRelevanceScore ? (review.aiAnalysis.productRelevanceScore * 100).toFixed(0) + '%' : 'N/A',
          purchaseVerified: review.aiAnalysis.purchaseVerificationScore ? (review.aiAnalysis.purchaseVerificationScore * 100).toFixed(0) + '%' : 'N/A',
          createdAt: review.createdAt
        }))
      };

      return NextResponse.json({
        success: true,
        stats
      });
    }

    // Build query for reviews
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (classification && classification !== 'all') {
      query['aiAnalysis.classification'] = classification;
    }
    
    if (needsReview === 'true') {
      query['aiAnalysis.needsManualReview'] = true;
    }

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate({
        path: 'user',
        select: 'name email profilePicture'
      })
      .populate({
        path: 'product',
        select: 'name mainImage'
      })
      .populate({
        path: 'moderatedBy',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalReviews = await Review.countDocuments(query);
    
    // Get analytics
    const analysisService = new ReviewAnalysisService();
    const analytics = analysisService.getAnalytics(await Review.find({}));

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      },
      analytics
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Batch analyze existing reviews
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

    const { action, reviewIds } = await request.json();

    if (action === 'batch_analyze') {
      // Get reviews that need analysis
      const reviews = await Review.find({
        $or: [
          { 'aiAnalysis.classification': 'pending' },
          { aiAnalysis: { $exists: false } }
        ]
      })
      .populate('user', 'name email')
      .populate('product', 'name description category price')
      .limit(100); // Process in batches

      const analysisService = new ReviewAnalysisService();
      let updatedCount = 0;

      for (const review of reviews) {
        try {
          // Get purchase verification and product details (using same logic as analyze-all-reviews)
          let hasPurchased = false;
          let purchaseDetails = null;
          let product = null;

          // Check if user has purchased this product
          if (review.user && review.product) {
            // Use comprehensive purchase verification logic
            const paidOrders = await Order.find({
              user: review.user._id,
              'items.product': review.product._id,
              paymentStatus: { $in: ['completed', 'paid', 'success'] }
            }).populate('items.product');
            
            const deliveredOrders = await Order.find({
              user: review.user._id,
              'items.product': review.product._id,
              status: 'delivered',
              paymentStatus: { $in: ['completed', 'paid', 'success'] }
            }).populate('items.product');
            
            const completedOrders = await Order.find({
              user: review.user._id,
              'items.product': review.product._id,
              status: 'completed',
              paymentStatus: 'completed'
            }).populate('items.product');

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
            }

            // Get product details
            product = review.product;
          }

          // Prepare comprehensive analysis data (matching analyze-all-reviews logic)
          const analysisData = {
            comment: review.comment,
            rating: review.rating,
            user: review.user?.name || review.user?.email || 'Anonymous',
            hasPurchased,
            purchaseDate: purchaseDetails?.latestOrder,
            purchaseDetails,
            productName: product?.name || 'Unknown Product',
            productDescription: product?.description || 'No description available', 
            productCategory: product?.category || 'Unknown Category',
            productPrice: product?.price ? `₹${product.price}` : 'Unknown Price',
            reviewDate: review.createdAt,
            reviewId: review._id
          };

          // Check if review has images and use appropriate analysis method
          let analysis;
          if (review.images && review.images.length > 0 && review.images[0].url) {
            console.log(`🖼️ Review ${review._id} has ${review.images.length} images - using image analysis`);
            console.log(`🖼️ Image URL: ${review.images[0].url.substring(0, 50)}...`);
            try {
              // For reviews with images, use image analysis - pass URL string, not object
              analysis = await analysisService.analyzeReviewWithImage(analysisData, review.images[0].url);
            } catch (imageError) {
              console.warn(`⚠️ Image analysis failed for review ${review._id}, falling back to text-only:`, imageError.message);
              // Fallback to text-only analysis if image processing fails
              analysis = await analysisService.analyzeReview(analysisData);
            }
          } else {
            console.log(`📝 Review ${review._id} has no images or invalid image URL - using text-only analysis`);
            // For text-only reviews, use standard analysis
            analysis = await analysisService.analyzeReview(analysisData);
          }

          await Review.findByIdAndUpdate(review._id, {
            aiAnalysis: analysis,
            status: analysis.classification === 'suspicious' ? 'flagged' : review.status
          });

          updatedCount++;
        } catch (error) {
          console.error(`Failed to analyze review ${review._id}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Analyzed ${updatedCount} reviews`,
        processedCount: updatedCount
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Review batch operation error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch operation' },
      { status: 500 }
    );
  }
}
