// app/api/admin/reviews/route.js
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
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
      }).limit(100); // Process in batches

      const analysisService = new ReviewAnalysisService();
      let updatedCount = 0;

      for (const review of reviews) {
        try {
          const analysis = await analysisService.analyzeReview({
            comment: review.comment,
            rating: review.rating,
            user: review.user
          });

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
