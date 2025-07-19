// app/api/products/[id]/reviews/route.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { processReviewComplete } from '../../../../../lib/reviewAnalysis';
import Order from '../../../../../models/order';
import Product from '../../../../../models/product';
import Review from '../../../../../models/review';
import User from '../../../../../models/user';

// GET reviews for a specific product
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    
    await connectDB();
    
    const reviews = await Review.find({ 
      product: id,
      status: { $ne: 'hidden' } // Exclude hidden reviews from public display
    })
      .populate({
        path: 'user',
        select: 'name profilePicture'
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST a new review
export async function POST(request, context) {
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
    const { id: productId } = params;
    
    const { rating, comment, images } = await request.json();
    
    if (!rating || !comment) {
      return NextResponse.json(
        { error: 'Please provide rating and comment' },
        { status: 400 }
      );
    }

    // Validate images if provided
    if (images && images.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed per review' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // TEMPORARILY DISABLED FOR ML TESTING
    // Remove this comment and uncomment below code when ready for production
    /*
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    */
    
    // Check if user has purchased this product (PURCHASE VERIFICATION)
    console.log('Checking purchase verification for user:', userId, 'product:', productId);
    
    const purchaseRecord = await Order.findOne({
      user: userId,
      'items.product': productId,
      paymentStatus: 'completed',
      status: { $in: ['processing', 'delivered'] }
    }).sort({ createdAt: -1 }); // Get most recent purchase
    
    let hasPurchased = false;
    let purchaseDate = null;
    let daysBetween = null;
    
    if (purchaseRecord) {
      hasPurchased = true;
      purchaseDate = purchaseRecord.createdAt;
      
      // Calculate days between purchase and review
      const purchaseDateObj = new Date(purchaseDate);
      const reviewDateObj = new Date();
      const diffTime = Math.abs(reviewDateObj - purchaseDateObj);
      daysBetween = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log('Purchase verified! Order found:', purchaseRecord._id, 'Date:', purchaseDate);
      console.log('Days between purchase and review:', daysBetween);
    } else {
      console.log('No purchase record found for this user-product combination');
      daysBetween = 'N/A';
    }
    
    // Create new review
    const reviewData = {
      user: userId,
      product: productId,
      rating: Number(rating),
      comment,
      // Add images if provided
      ...(images && images.length > 0 && { images })
    };

    // Use AI agent for complete analysis and approval
    console.log('🔍 Purchase verification status before AI analysis:');
    console.log('- hasPurchased:', hasPurchased);
    console.log('- purchaseDate:', purchaseDate);
    console.log('- daysBetween:', daysBetween);
    console.log('- purchaseRecord ID:', purchaseRecord?._id);
    console.log('- hasImages:', !!(images && images.length > 0));
    console.log('- imageCount:', images?.length || 0);
    
    // Process review with AI agent (includes analysis + approval)
    const processedReview = await processReviewComplete({
      ...reviewData,
      hasPurchased,
      purchaseDate,
      daysBetween
    });
    
    console.log('🤖 AI Agent Processing Complete:');
    console.log('- Classification:', processedReview.classification);
    console.log('- Agent Decision:', processedReview.agentApproval?.agentDecision);
    console.log('- Display Indicator:', processedReview.agentApproval?.displayIndicator);
    console.log('🔍 DEBUG: agentApproval nested in processedReview:', !!processedReview.agentApproval);

    // Extract agentApproval to save it as separate field
    const { agentApproval, ...aiAnalysisData } = processedReview;

    // Create review with AI analysis and agent approval in correct structure
    const review = new Review({
      ...reviewData,
      aiAnalysis: {
        ...aiAnalysisData,
        agentApproval: agentApproval  // Keep it nested for UI compatibility
      },
      agentApproval: agentApproval,  // Save as separate field as per schema
      createdAt: new Date()
    });

    // FORCE the nested agentApproval to be set (in case destructuring didn't work)
    review.aiAnalysis.agentApproval = agentApproval;

    console.log('🔍 DEBUG: review.aiAnalysis.agentApproval before save:', !!review.aiAnalysis.agentApproval);
    console.log('🔍 DEBUG: review.aiAnalysis.agentApproval.displayIndicator:', review.aiAnalysis.agentApproval?.displayIndicator);
    console.log('🔍 DEBUG: review.agentApproval before save:', !!review.agentApproval);
    console.log('🔍 DEBUG: review.agentApproval.displayIndicator:', review.agentApproval?.displayIndicator);

    // Save the review
    await review.save();
    
    // Get the populated review
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'user',
        select: 'name profilePicture'
      });
    
    return NextResponse.json({
      success: true,
      message: 'Review added successfully with AI analysis',
      review: populatedReview
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create review error:', error);
    
    // Handle duplicate review error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
}