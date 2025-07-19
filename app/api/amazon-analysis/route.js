import { NextResponse } from 'next/server';
import ReviewAnalysisService from '../../../lib/reviewAnalysis.js';

// Maximum reviews to analyze (cost and time optimization)
const MAX_REVIEWS = 20;

export async function POST(request) {
  try {
    const { reviews, productInfo } = await request.json();
    
    // Validation
    if (!reviews || !Array.isArray(reviews)) {
      return NextResponse.json(
        { success: false, error: 'Reviews array is required' },
        { status: 400 }
      );
    }

    if (reviews.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No reviews found to analyze' },
        { status: 400 }
      );
    }

    // Limit reviews for performance and cost optimization
    const limitedReviews = reviews.slice(0, MAX_REVIEWS);
    
    console.log(`🔍 Starting Amazon analysis:`, {
      productTitle: productInfo?.title || 'Unknown Product',
      totalReviewsFound: reviews.length,
      reviewsToAnalyze: limitedReviews.length,
      productUrl: productInfo?.url || 'Unknown URL'
    });

    // Initialize the review analysis service
    const analysisService = new ReviewAnalysisService();
    const analysisResults = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < limitedReviews.length; i++) {
      const review = limitedReviews[i];
      
      try {
        console.log(`📝 Analyzing review ${i + 1}/${limitedReviews.length}:`, {
          rating: review.rating,
          textLength: review.text?.length || 0,
          isVerified: review.verifiedPurchase,
          author: review.author
        });

        // Prepare review data for AI analysis using your existing structure
        const reviewData = {
          comment: review.text || review.comment || '',
          rating: parseInt(review.rating) || 5,
          user: review.author || `Amazon User ${i + 1}`,
          reviewDate: review.date || new Date().toISOString(),
          productName: productInfo?.title || 'Amazon Product',
          productDescription: productInfo?.description || '',
          productCategory: productInfo?.category || 'General',
          productPrice: productInfo?.price || 'Unknown',
          hasPurchased: review.verifiedPurchase === true ? true : false, // Amazon verified purchase
          images: review.images || []
        };

        // Use your existing processReviewComplete method
        const analysis = await analysisService.processReviewComplete(reviewData);
        
        // Format result for Chrome extension
        const result = {
          originalReview: review,
          aiAnalysis: analysis,
          reviewIndex: i,
          displayIndicator: analysis.agentApproval?.displayIndicator || 
                           analysis.finalStatus?.displayIndicator || 
                           'yellow',
          userDisplayStatus: analysis.agentApproval?.userDisplayStatus || 
                            analysis.finalStatus?.userDisplayStatus || 
                            'Under Review',
          trustScore: Math.round((analysis.confidence || 0.5) * 100),
          flags: analysis.flags || [],
          isGenuine: analysis.classification === 'genuine',
          confidence: analysis.confidence || 0.5,
          reasoning: analysis.reasoning || 'Analysis completed'
        };

        analysisResults.push(result);
        successCount++;

        console.log(`✅ Review ${i + 1} analyzed:`, {
          classification: analysis.classification,
          confidence: analysis.confidence,
          displayIndicator: result.displayIndicator,
          trustScore: result.trustScore
        });

        // Add delay between requests to respect rate limits
        if (i < limitedReviews.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
        }

      } catch (reviewError) {
        console.error(`❌ Error analyzing review ${i + 1}:`, reviewError.message);
        errorCount++;
        
        // Add error result
        analysisResults.push({
          originalReview: review,
          reviewIndex: i,
          error: reviewError.message,
          displayIndicator: 'red',
          userDisplayStatus: 'Analysis Failed',
          trustScore: 0,
          isGenuine: false,
          confidence: 0,
          reasoning: `Analysis failed: ${reviewError.message}`
        });
      }
    }

    // Calculate overall trust metrics
    const genuineCount = analysisResults.filter(r => r.isGenuine).length;
    const suspiciousCount = analysisResults.filter(r => r.displayIndicator === 'red' && !r.error).length;
    const errorAnalysisCount = analysisResults.filter(r => r.error).length;
    const overallTrustScore = analysisResults.length > 0 ? 
      Math.round((genuineCount / analysisResults.length) * 100) : 0;

    // Determine safety recommendation
    let recommendationSafety;
    if (overallTrustScore >= 75) {
      recommendationSafety = '✅ Safe to buy - High trust reviews';
    } else if (overallTrustScore >= 50) {
      recommendationSafety = '⚠️ Buy with caution - Mixed signals';
    } else {
      recommendationSafety = '🚨 High risk - Many suspicious reviews';
    }

    const summary = {
      totalReviews: analysisResults.length,
      genuineReviews: genuineCount,
      suspiciousReviews: suspiciousCount,
      errorReviews: errorAnalysisCount,
      overallTrustScore: overallTrustScore,
      recommendationSafety: recommendationSafety,
      processingStats: {
        successCount,
        errorCount,
        totalProcessed: limitedReviews.length,
        originalReviewCount: reviews.length,
        limitApplied: reviews.length > MAX_REVIEWS
      }
    };

    console.log(`🏁 Amazon analysis complete:`, summary);

    return NextResponse.json({
      success: true,
      analysis: analysisResults,
      summary: summary,
      productInfo: productInfo,
      analyzedAt: new Date().toISOString(),
      apiVersion: '1.0',
      maxReviewsLimit: MAX_REVIEWS
    });

  } catch (error) {
    console.error('❌ Amazon analysis API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze Amazon reviews',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle CORS for development
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
