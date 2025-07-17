// app/api/user/reviews/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import User from '@/models/user';
import ReviewAnalysisService from '@/lib/reviewAnalysis';

// GET single review
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to view review' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const review = await Review.findOne({
      _id: params.id,
      user: userId
    }).populate({
      path: 'product',
      select: 'name mainImage price'
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Get review error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT - Edit review
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to edit review' },
        { status: 401 }
      );
    }

    const { rating, comment, editReason } = await request.json();

    // Validation
    if (!rating || !comment) {
      return NextResponse.json(
        { error: 'Rating and comment are required' },
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

    // Find the review and verify ownership
    const existingReview = await Review.findOne({
      _id: params.id,
      user: userId
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Check if content actually changed
    if (existingReview.rating === parseInt(rating) && 
        existingReview.comment.trim() === comment.trim()) {
      return NextResponse.json(
        { error: 'No changes detected in the review' },
        { status: 400 }
      );
    }

    // Save edit history
    const editHistoryEntry = {
      previousComment: existingReview.comment,
      previousRating: existingReview.rating,
      editedAt: new Date(),
      editReason: editReason || 'User edit'
    };

    // Get user info for AI analysis
    const user = await User.findById(userId);

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      params.id,
      {
        rating: parseInt(rating),
        comment: comment.trim(),
        isEdited: true,
        lastEditedAt: new Date(),
        $push: { editHistory: editHistoryEntry },
        // Reset AI analysis for re-analysis
        'aiAnalysis.classification': 'pending',
        'aiAnalysis.needsManualReview': true
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'product',
      select: 'name mainImage price'
    });

    // Run AI analysis on edited review
    const analysisService = new ReviewAnalysisService();
    try {
      // Get product details for enhanced AI analysis
      const productDetails = await Product.findById(updatedReview.product._id || updatedReview.product).select('name description category price');
      
      // Check if user has purchased this product
      const Order = require('@/models/order');
      const userOrders = await Order.find({ 
        user: userId,
        'items.product': updatedReview.product._id || updatedReview.product,
        status: { $in: ['delivered', 'completed'] }
      });
      
      const hasPurchased = userOrders.length > 0;
      const latestPurchase = userOrders.length > 0 ? 
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

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
        reviewDate: updatedReview.createdAt.toISOString(),
        // Include edit history for pattern detection
        editHistory: updatedReview.editHistory
      });

      // Update with new AI analysis
      await Review.findByIdAndUpdate(params.id, {
        aiAnalysis: {
          ...analysis,
          editedReview: true,
          editCount: existingReview.editHistory.length + 1
        },
        status: analysis.classification === 'suspicious' ? 'under_review' : 'published'
      });
      
      console.log('Enhanced AI re-analysis completed for edited review:', params.id, {
        classification: analysis.classification,
        hasPurchased: hasPurchased,
        productRelevance: analysis.productRelevanceScore,
        editCount: existingReview.editHistory.length + 1
      });
    } catch (analysisError) {
      console.error('AI analysis failed for edited review:', params.id, analysisError);
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Edit review error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE review
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to delete review' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find and verify ownership
    const review = await Review.findOne({
      _id: params.id,
      user: userId
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the review
    await Review.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
