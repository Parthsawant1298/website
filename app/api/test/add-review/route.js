// app/api/test/add-review/route.js
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST - Add test review for demo purposes
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to add a test review' },
        { status: 401 }
      );
    }

    const { productId, rating, comment, isTestReview } = await request.json();

    await connectDB();

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // For testing, allow multiple reviews from same user
    if (!isTestReview) {
      const existingReview = await Review.findOne({
        user: userId,
        product: productId
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 409 }
        );
      }
    }

    // Create review
    const review = new Review({
      user: userId,
      product: productId,
      rating: parseInt(rating),
      comment: comment.trim()
    });

    await review.save();

    console.log('Test review created, starting AI analysis...');

    // Enhanced AI analysis with product context and purchase verification
    const analysisService = new ReviewAnalysisService();
    try {
      // Get product details for enhanced AI analysis
      const productDetails = await Product.findById(productId).select('name description category price');
      
      // Check if user has purchased this product (for demo, assume they have)
      const userOrders = await Order.find({ 
        user: userId,
        'items.product': productId,
        status: { $in: ['delivered', 'completed'] }
      });
      
      const hasPurchased = userOrders.length > 0 || isTestReview; // Allow test reviews even without purchase
      const latestPurchase = userOrders.length > 0 ? 
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

      const analysis = await analysisService.analyzeReview({
        comment: comment.trim(),
        rating: parseInt(rating),
        user: user.name || user.email || 'Test User',
        // Enhanced product context
        productName: productDetails?.name || product.name || 'Test Product',
        productDescription: productDetails?.description || product.description || 'Test product description',
        productCategory: productDetails?.category || product.category || 'Test Category',
        productPrice: productDetails?.price || product.price || 'Test Price',
        // Purchase verification (allow test data)
        hasPurchased: hasPurchased,
        purchaseDate: latestPurchase?.createdAt?.toISOString() || (isTestReview ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null),
        reviewDate: review.createdAt.toISOString()
      });

      console.log('Enhanced AI Analysis Result:', {
        classification: analysis.classification,
        confidence: analysis.confidence,
        hasDetailedAnalysis: !!analysis.detailedAnalysis,
        hasPurchased: hasPurchased,
        productRelevance: analysis.scores?.productRelevanceScore || analysis.productRelevanceScore
      });

      // Update review with AI analysis
      await Review.findByIdAndUpdate(review._id, {
        aiAnalysis: analysis,
        status: analysis.classification === 'suspicious' ? 'under_review' : 'published'
      });
      
      console.log('Review updated with AI analysis');
    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      // Review remains but without analysis
    }

    // Get the updated review with analysis
    const updatedReview = await Review.findById(review._id)
      .populate('product', 'name mainImage')
      .populate('user', 'name');

    return NextResponse.json({
      success: true,
      message: 'Test review added successfully',
      review: updatedReview,
      analysis: updatedReview.aiAnalysis
    });

  } catch (error) {
    console.error('Add test review error:', error);
    return NextResponse.json(
      { error: 'Failed to add test review: ' + error.message },
      { status: 500 }
    );
  }
}
