// Test API to validate the Review model enum
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// Force clear mongoose models cache
import mongoose from 'mongoose';
delete mongoose.models.Review;

import Review from '@/models/review';

export async function POST(request) {
  try {
    await connectDB();
    
    const testFlags = ['no_purchase_record', 'unverified_reviewer', 'generic_review'];
    
    console.log('Testing Review model validation with flags:', testFlags);
    
    // Try to create a test review with these flags
    const testReviewData = {
      user: new mongoose.Types.ObjectId(),
      product: new mongoose.Types.ObjectId(),
      rating: 3,
      comment: "Test review for validation",
      aiAnalysis: {
        classification: 'suspicious',
        confidence: 0.7,
        flags: testFlags,
        reasoning: 'Test analysis',
        analyzedAt: new Date(),
        needsManualReview: true,
        modelVersion: 'gemini-2.0-flash',
        riskLevel: 'medium'
      },
      status: 'flagged'
    };
    
    // Validate without saving
    const testReview = new Review(testReviewData);
    await testReview.validate();
    
    return NextResponse.json({
      success: true,
      message: 'Model validation passed!',
      testedFlags: testFlags,
      modelInfo: {
        modelName: Review.modelName,
        schemaPath: Review.schema.path('aiAnalysis.flags')?.enumValues || 'Not found'
      }
    });
    
  } catch (error) {
    console.error('Model validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      validationErrors: error.errors || null,
      testedFlags: ['no_purchase_record', 'unverified_reviewer', 'generic_review']
    }, { status: 400 });
  }
}
