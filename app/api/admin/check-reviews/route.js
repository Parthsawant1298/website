// Simple API to check what reviews exist and their current analysis status
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get ALL reviews
    const allReviews = await Review.find({})
      .populate('product', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Total reviews in database: ${allReviews.length}`);
    
    const reviewAnalysis = allReviews.map(review => ({
      id: review._id,
      product: review.product?.name || 'Unknown',
      user: review.user?.name || 'Unknown',
      rating: review.rating,
      comment: review.comment?.substring(0, 100) + '...',
      hasAiAnalysis: !!review.aiAnalysis,
      modelVersion: review.aiAnalysis?.modelVersion || 'none',
      classification: review.aiAnalysis?.classification || 'none',
      flags: review.aiAnalysis?.flags || [],
      createdAt: review.createdAt
    }));
    
    const stats = {
      total: allReviews.length,
      withAiAnalysis: allReviews.filter(r => r.aiAnalysis).length,
      withoutAiAnalysis: allReviews.filter(r => !r.aiAnalysis).length,
      gemini2Flash: allReviews.filter(r => r.aiAnalysis?.modelVersion === 'gemini-2.0-flash').length,
      oldModels: allReviews.filter(r => r.aiAnalysis && r.aiAnalysis.modelVersion !== 'gemini-2.0-flash').length
    };
    
    return NextResponse.json({
      success: true,
      stats,
      reviews: reviewAnalysis
    });
    
  } catch (error) {
    console.error('Error checking reviews:', error);
    return NextResponse.json(
      { error: 'Failed to check reviews', details: error.message },
      { status: 500 }
    );
  }
}
