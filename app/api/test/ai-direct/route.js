// Direct AI test API - bypasses database and tests AI directly
import ReviewAnalysisService from '@/lib/reviewAnalysis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { 
      comment = "Great product! I love it. Fast delivery and excellent quality.",
      rating = 5,
      hasPurchased = true 
    } = await request.json();
    
    console.log('🧪 Testing AI directly with sample data...');
    
    const analysisService = new ReviewAnalysisService();
    
    const testData = {
      comment,
      rating,
      productName: "Test Product",
      productDescription: "Test product for AI analysis",
      productCategory: "Electronics",
      productPrice: "₹1999",
      hasPurchased: hasPurchased,
      purchaseDate: hasPurchased ? new Date('2025-07-01').toISOString() : null,
      reviewDate: new Date().toISOString()
    };
    
    console.log('📝 Test Data:', testData);
    
    const result = await analysisService.analyzeReview(testData);
    
    console.log('🤖 AI Result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'AI test completed',
      testData,
      aiResult: result,
      analysis: {
        working: result.classification !== undefined,
        correctPurchaseVerification: hasPurchased ? !result.flags.includes('no_purchase_record') : result.flags.includes('no_purchase_record'),
        modelVersion: result.modelVersion
      }
    });
    
  } catch (error) {
    console.error('❌ Direct AI test failed:', error);
    return NextResponse.json(
      { 
        error: 'AI test failed', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
