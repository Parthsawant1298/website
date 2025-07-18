import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { processReviewComplete } from '../../../lib/reviewAnalysis';
import Product from '../../../models/product';
import Review from '../../../models/review';
import User from '../../../models/user';

// GET /api/reviews - Get reviews for a product
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get reviews for the product with user and product data populated
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email profilePicture')
      .populate('product', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reviews: reviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reviews',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { productId, userId, rating, comment, images = [] } = body;

    // Validate required fields
    if (!productId || !userId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create review data
    const reviewData = {
      product: productId,
      user: userId,
      rating: parseInt(rating),
      comment: comment.trim(),
      images: images || [],
      createdAt: new Date()
    };

    // Process review with AI agent (includes analysis + approval)
    const processedReview = await processReviewComplete(reviewData);
    
    // Save the review with AI analysis and agent approval
    const review = new Review(processedReview);
    await review.save();

    // Update product statistics
    const allReviews = await Review.find({ product: productId });
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews;
    
    await Product.findByIdAndUpdate(productId, {
      ratings: averageRating,
      numReviews: totalReviews
    });

    // Populate the saved review for response
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email profilePicture')
      .populate('product', 'name');

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT /api/reviews - Update an existing review
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reviewId, rating, comment, images = [] } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update review data
    const updateData = {
      rating: rating || review.rating,
      comment: comment || review.comment,
      images: images,
      updatedAt: new Date()
    };

    // Re-process with AI agent if content changed
    if (comment && comment !== review.comment) {
      const reprocessedReview = await processReviewComplete({
        ...review.toObject(),
        ...updateData
      });
      Object.assign(updateData, {
        aiAnalysis: reprocessedReview.aiAnalysis
      });
    }

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate('user', 'name email profilePicture')
     .populate('product', 'name');

    // Update product statistics
    const allReviews = await Review.find({ product: review.product });
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews;
    
    await Product.findByIdAndUpdate(review.product, {
      ratings: averageRating,
      numReviews: totalReviews
    });

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews - Delete a review
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the review
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update product statistics
    const allReviews = await Review.find({ product: review.product });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews 
      : 0;
    
    await Product.findByIdAndUpdate(review.product, {
      ratings: averageRating,
      numReviews: totalReviews
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
