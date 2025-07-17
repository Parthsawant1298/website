// app/api/admin/reviews/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import User from '@/models/user';

// PUT - Update review status or moderation
export async function PUT(request, context) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: reviewId } = params;

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { action, status, moderationNotes } = await request.json();

    const updateData = {
      moderatedBy: userId,
      moderatedAt: new Date()
    };

    switch (action) {
      case 'approve':
        updateData.status = 'published';
        updateData.moderationNotes = moderationNotes || 'Approved by admin';
        break;
        
      case 'flag':
        updateData.status = 'flagged';
        updateData.moderationNotes = moderationNotes || 'Flagged for suspicious content';
        break;
        
      case 'hide':
        updateData.status = 'hidden';
        updateData.moderationNotes = moderationNotes || 'Hidden by admin';
        break;
        
      case 'review':
        updateData.status = 'under_review';
        updateData.moderationNotes = moderationNotes || 'Under manual review';
        break;
        
      default:
        if (status) {
          updateData.status = status;
          if (moderationNotes) {
            updateData.moderationNotes = moderationNotes;
          }
        }
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate([
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'name' },
      { path: 'moderatedBy', select: 'name' }
    ]);

    if (!updatedReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request, context) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: reviewId } = params;

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

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
