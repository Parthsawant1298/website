// app/api/ai-validation-free/route.js - FREE AI Validation API
import FreeAIValidationService from '@/lib/aiValidationFree';
import connectDB from '@/lib/mongodb';
import Product from '@/models/product';
import Review from '@/models/review';
import User from '@/models/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Get validation status and metrics
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Ensure models are registered (required for populate to work)
    const productModel = Product;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'quick', 'detailed', 'status'

    // Get reviews with AI analysis
    const reviews = await Review.find({
      'aiAnalysis.classification': { $exists: true, $ne: 'pending' }
    })
    .populate('user', 'name email')
    .populate('product', 'name category')
    .limit(type === 'quick' ? 50 : 200); // Limit for performance

    const validationService = new FreeAIValidationService();

    if (type === 'status') {
      // Quick status overview
      const quickMetrics = validationService.calculateQuickMetrics(reviews);
      const sampleSize = reviews.length;
      
      return NextResponse.json({
        success: true,
        status: {
          sampleSize,
          accuracy: quickMetrics.accuracy,
          precision: quickMetrics.precision,
          recall: quickMetrics.recall,
          f1Score: quickMetrics.f1Score,
          lastUpdated: new Date().toISOString(),
          isProduction: quickMetrics.accuracy >= 0.85 && quickMetrics.f1Score >= 0.80
        }
      });
    }

    if (type === 'quick') {
      // Quick validation with basic statistics
      const confusionMatrix = validationService.generateConfusionMatrix(
        reviews.map(r => r.aiAnalysis.classification),
        reviews.map(r => validationService.determineGroundTruth(r))
      );
      
      const bootstrapResults = validationService.performBootstrapValidation(reviews.slice(0, 30));
      
      return NextResponse.json({
        success: true,
        quickValidation: {
          sampleSize: reviews.length,
          confusionMatrix: confusionMatrix.confusionMatrix,
          metrics: confusionMatrix.metrics,
          bootstrapConfidence: bootstrapResults.confidenceInterval95,
          grade: validationService.assignGrade(confusionMatrix.metrics.accuracy),
          recommendations: validationService.generateRecommendations(
            confusionMatrix.metrics.accuracy, 
            confusionMatrix.metrics
          )
        }
      });
    }

    // Default: Comprehensive validation report
    const comprehensiveReport = await validationService.generateComprehensiveReport(reviews);
    
    return NextResponse.json({
      success: true,
      validation: comprehensiveReport
    });

  } catch (error) {
    console.error('AI Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform validation', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Run new validation tests
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { validationType, sampleSize = 100 } = await request.json();

    // Get fresh data for validation
    const reviews = await Review.find({
      'aiAnalysis.classification': { $exists: true, $ne: 'pending' }
    })
    .populate('user', 'name email')
    .populate('product', 'name category')
    .sort({ createdAt: -1 })
    .limit(sampleSize);

    const validationService = new FreeAIValidationService();

    let result;

    switch (validationType) {
      case 'cross_validation':
        result = await validationService.performCrossValidation(reviews);
        break;
        
      case 'bootstrap':
        result = validationService.performBootstrapValidation(reviews);
        break;
        
      case 'roc_analysis':
        const predictions = reviews.map(r => r.aiAnalysis.classification);
        const confidences = reviews.map(r => r.aiAnalysis.confidence || 0.5);
        const actuals = reviews.map(r => validationService.determineGroundTruth(r));
        result = validationService.calculateROCCurve(predictions, confidences, actuals);
        break;
        
      case 'calibration':
        const predsCal = reviews.map(r => r.aiAnalysis.classification);
        const confsCal = reviews.map(r => r.aiAnalysis.confidence || 0.5);
        const actualsCal = reviews.map(r => validationService.determineGroundTruth(r));
        result = validationService.performCalibrationAnalysis(predsCal, confsCal, actualsCal);
        break;
        
      case 'comprehensive':
      default:
        result = await validationService.generateComprehensiveReport(reviews);
        break;
    }

    return NextResponse.json({
      success: true,
      validationType,
      sampleSize: reviews.length,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Validation execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute validation', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update validation settings
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { benchmarks } = await request.json();

    const validationService = new FreeAIValidationService();
    
    // Update benchmark metrics
    if (benchmarks) {
      validationService.benchmarkMetrics = {
        ...validationService.benchmarkMetrics,
        ...benchmarks
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Validation settings updated',
      benchmarks: validationService.benchmarkMetrics
    });

  } catch (error) {
    console.error('Update validation settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// DELETE - Clear validation cache
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const validationService = new FreeAIValidationService();
    validationService.validationHistory = [];

    return NextResponse.json({
      success: true,
      message: 'Validation cache cleared'
    });

  } catch (error) {
    console.error('Clear validation cache error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
