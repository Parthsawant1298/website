// app/api/products/[id]/reviews/route.js
import connectDB from '@/lib/mongodb';
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import Order from '@/models/order';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
    
    if (purchaseRecord) {
      hasPurchased = true;
      purchaseDate = purchaseRecord.createdAt;
      console.log('Purchase verified! Order found:', purchaseRecord._id, 'Date:', purchaseDate);
    } else {
      console.log('No purchase record found for this user-product combination');
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

    // Initialize ML analysis service
    const analysisService = new ReviewAnalysisService();
    
    // Analyze the review with complete context including purchase verification
    // Get ML analysis with enhanced purchase verification data
    console.log('🔍 Purchase verification status before AI analysis:');
    console.log('- hasPurchased:', hasPurchased);
    console.log('- purchaseDate:', purchaseDate);
    console.log('- purchaseRecord ID:', purchaseRecord?._id);
    console.log('- hasImages:', !!(images && images.length > 0));
    console.log('- imageCount:', images?.length || 0);
    
    let mlAnalysis;
    
    // Use image analysis if images are provided
    if (images && images.length > 0) {
      console.log('🖼️ Using image analysis for review with', images.length, 'images');
      
      // For now, we'll analyze with the first image (can be enhanced to analyze multiple)
      // Convert the first image URL to base64 if needed, or use the URL directly
      // Note: For this implementation, we'll pass the image URL to the analysis service
      mlAnalysis = await analysisService.analyzeReviewWithImage({
        comment,
        rating,
        productName: product.name,
        productDescription: product.description,
        productCategory: product.category,
        productPrice: `₹${product.price}`,
        hasPurchased: hasPurchased,
        purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
        reviewDate: new Date().toISOString()
      }, images[0]?.url); // Pass the first image URL for analysis
    } else {
      console.log('📝 Using text-only analysis (no images)');
      mlAnalysis = await analysisService.analyzeReview({
        comment,
        rating,
        productName: product.name,
        productDescription: product.description,
        productCategory: product.category,
        productPrice: `₹${product.price}`,
        hasPurchased: hasPurchased,
        purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
        reviewDate: new Date().toISOString()
      });
    }
    
    console.log('🤖 AI Analysis Result:');
    console.log('- Classification:', mlAnalysis.classification);
    console.log('- Flags:', mlAnalysis.flags);
    console.log('- Has no_purchase_record flag:', mlAnalysis.flags?.includes('no_purchase_record'));
    console.log('- Has unverified_reviewer flag:', mlAnalysis.flags?.includes('unverified_reviewer'));

    // Create review with ML analysis
    const review = await Review.create({
      ...reviewData,
      aiAnalysis: mlAnalysis,
      status: mlAnalysis.classification === 'suspicious' ? 'flagged' : 'published'
    });
    
    // Get the populated review
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'user',
        select: 'name profilePicture'
      });
    
    return NextResponse.json({
      success: true,
      message: 'Review added successfully',
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