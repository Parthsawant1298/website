// app/api/user/reviews/route.js
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET user's reviews
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to view your reviews' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    let query = { user: userId };
    if (productId) {
      query.product = productId;
    }

    const reviews = await Review.find(query)
      .populate({
        path: 'product',
        select: 'name mainImage price'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Add new review
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to add a review' },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    // Validation
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review comment must be at least 10 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product. You can edit your existing review.' },
        { status: 409 }
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

    // Get user info for AI analysis
    const user = await User.findById(userId);

    // Get product details for enhanced AI analysis
    const productDetails = await Product.findById(productId).select('name description category price');
    
    // Check if user has purchased this product
    const userOrders = await Order.find({ 
      user: userId,
      'items.product': productId,
      status: { $in: ['delivered', 'completed'] }
    });
    
    const hasPurchased = userOrders.length > 0;
    const latestPurchase = userOrders.length > 0 ? 
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

    // Create review
    const review = new Review({
      user: userId,
      product: productId,
      rating: parseInt(rating),
      comment: comment.trim()
    });

    await review.save();

    // Run AI analysis in background with enhanced context
    const analysisService = new ReviewAnalysisService();
    try {
      const analysis = await analysisService.analyzeReview({
        comment: comment.trim(),
        rating: parseInt(rating),
        user: user.name || user.email || 'User',
        // Enhanced product context
        productName: productDetails?.name || 'Unknown Product',
        productDescription: productDetails?.description || 'No description available',
        productCategory: productDetails?.category || 'Unknown Category', 
        productPrice: productDetails?.price || 'Unknown Price',
        // Purchase verification
        hasPurchased: hasPurchased,
        purchaseDate: latestPurchase?.createdAt?.toISOString() || null,
        reviewDate: review.createdAt.toISOString()
      });

      // Update review with AI analysis
      await Review.findByIdAndUpdate(review._id, {
        aiAnalysis: analysis,
        status: analysis.classification === 'suspicious' ? 'under_review' : 'published'
      });
      
      console.log('Enhanced AI analysis completed for new review:', review._id, {
        classification: analysis.classification,
        hasPurchased: hasPurchased,
        productRelevance: analysis.productRelevanceScore
      });
    } catch (analysisError) {
      console.error('AI analysis failed for review:', review._id, analysisError);
      // Review remains published even if analysis fails
    }

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'product',
        select: 'name mainImage price'
      })
      .populate({
        path: 'user',
        select: 'name'
      });

    return NextResponse.json({
      success: true,
      message: 'Review added successfully',
      review: populatedReview
    });

  } catch (error) {
    console.error('Add review error:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}
