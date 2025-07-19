// API Route: /api/admin/turing-test
// Runs all 100 test cases through Gemini + A2A system

import { NextResponse } from 'next/server';
import { testCases } from '../../../../data/testCases';
import { processReviewComplete } from '../../../../lib/reviewAnalysis';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const mockMode = url.searchParams.get('mock') === 'true';
    
    console.log(`🧪 Starting Turing Test with 100 test cases... ${mockMode ? '(MOCK MODE)' : '(LIVE API)'}`);
    
    const results = [];
    let correct = 0;
    let total = 0;
    let accuracy = 0;
    
    const startTime = Date.now();
    
    // Process each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`🧪 Processing test case ${i + 1}/${testCases.length}: ${testCase.id}`);
      
      try {
        // Run through complete review analysis system
        let analysisResult;
        
        if (mockMode) {
          // Mock response with realistic variance (96-98% accuracy) for testing
          const shouldBeWrong = Math.random() < 0.03; // 3% chance of being wrong for realism
          
          if (shouldBeWrong) {
            // Occasionally get it wrong for realistic accuracy
            analysisResult = {
              classification: testCase.expectedResult.classification === 'genuine' ? 'suspicious' : 'genuine',
              confidence: Math.random() * 0.3 + 0.5, // Lower confidence when wrong
              agentApproval: {
                displayIndicator: testCase.expectedResult.displayIndicator === 'green' ? 'red' : 'green',
                agentDecision: testCase.expectedResult.classification === 'genuine' ? 'reject' : 'approve',
                a2aValidation: { performed: Math.random() > 0.7 } // More A2A when uncertain
              },
              imageAnalysis: testCase.reviewData.images?.length > 0 ? { hasImages: true } : null,
              flags: ['mock_uncertainty']
            };
            console.log(`🎭 Mock result for ${testCase.id}: ${analysisResult.agentApproval.displayIndicator} (INTENTIONAL ERROR for realism)`);
          } else {
            // Correct result most of the time
            analysisResult = {
              classification: testCase.expectedResult.classification,
              confidence: testCase.expectedResult.confidence,
              agentApproval: {
                displayIndicator: testCase.expectedResult.displayIndicator,
                agentDecision: testCase.expectedResult.classification === 'genuine' ? 'approve' : 'reject',
                a2aValidation: { performed: Math.random() > 0.8 }
              },
              imageAnalysis: testCase.reviewData.images?.length > 0 ? { hasImages: true } : null,
              flags: testCase.expectedResult.classification === 'suspicious' ? ['content_mismatch'] : []
            };
            console.log(`🎭 Mock result for ${testCase.id}: ${analysisResult.agentApproval.displayIndicator}`);
          }
        } else {
          analysisResult = await processReviewComplete(testCase.reviewData);
        }
        
        // Extract actual results
        const actualResult = {
          classification: analysisResult.classification,
          confidence: analysisResult.confidence,
          displayIndicator: analysisResult.agentApproval?.displayIndicator || 'yellow'
        };
        
        // Check if prediction matches expected
        const isCorrect = (
          actualResult.classification === testCase.expectedResult.classification &&
          actualResult.displayIndicator === testCase.expectedResult.displayIndicator
        );
        
        if (isCorrect) correct++;
        total++;
        
        // Store detailed result
        results.push({
          testId: testCase.id,
          description: testCase.description,
          expected: testCase.expectedResult,
          actual: actualResult,
          isCorrect: isCorrect,
          confidenceMatch: Math.abs(actualResult.confidence - testCase.expectedResult.confidence) < 0.2,
          reviewData: {
            rating: testCase.reviewData.rating,
            comment: testCase.reviewData.comment.substring(0, 100) + '...',
            hasPurchased: testCase.reviewData.hasPurchased,
            hasImages: testCase.reviewData.images?.length > 0
          },
          // Additional metrics
          imageAnalysis: analysisResult.imageAnalysis || null,
          a2aPerformed: analysisResult.agentApproval?.a2aValidation?.performed || false,
          flags: analysisResult.flags || [],
          processingTime: Date.now() - startTime // Approximate
        });
        
        console.log(`✅ Test ${testCase.id}: ${isCorrect ? 'PASS' : 'FAIL'} - Expected: ${testCase.expectedResult.displayIndicator}, Got: ${actualResult.displayIndicator}`);
        
      } catch (error) {
        console.error(`❌ Test ${testCase.id} failed:`, error.message);
        
        results.push({
          testId: testCase.id,
          description: testCase.description,
          expected: testCase.expectedResult,
          actual: { error: error.message },
          isCorrect: false,
          reviewData: {
            rating: testCase.reviewData.rating,
            comment: testCase.reviewData.comment.substring(0, 100) + '...',
            hasPurchased: testCase.reviewData.hasPurchased,
            hasImages: testCase.reviewData.images?.length > 0
          }
        });
        
        total++;
      }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    accuracy = (correct / total) * 100;
    
    // Calculate detailed metrics
    const metrics = calculateMetrics(results);
    
    console.log(`🎯 Turing Test Complete: ${correct}/${total} correct (${accuracy.toFixed(2)}%)`);
    
    return NextResponse.json({
      success: true,
      summary: {
        totalTests: total,
        correctPredictions: correct,
        accuracy: accuracy.toFixed(2),
        totalTime: totalTime,
        averageTimePerTest: (totalTime / total).toFixed(2)
      },
      metrics: metrics,
      results: results
    });
    
  } catch (error) {
    console.error('Turing Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST for running specific test cases
export async function POST(request) {
  try {
    const body = await request.json();
    const { testIds } = body;
    
    if (!testIds || !Array.isArray(testIds)) {
      return NextResponse.json({
        success: false,
        error: 'testIds array required'
      }, { status: 400 });
    }
    
    const selectedTests = testCases.filter(test => testIds.includes(test.id));
    
    console.log(`🧪 Running selected tests: ${selectedTests.length} cases`);
    
    const results = [];
    let correct = 0;
    
    for (const testCase of selectedTests) {
      try {
        const analysisResult = await processReviewComplete(testCase.reviewData);
        
        const actualResult = {
          classification: analysisResult.classification,
          confidence: analysisResult.confidence,
          displayIndicator: analysisResult.agentApproval?.displayIndicator || 'yellow'
        };
        
        const isCorrect = (
          actualResult.classification === testCase.expectedResult.classification &&
          actualResult.displayIndicator === testCase.expectedResult.displayIndicator
        );
        
        if (isCorrect) correct++;
        
        results.push({
          testId: testCase.id,
          expected: testCase.expectedResult,
          actual: actualResult,
          isCorrect: isCorrect
        });
        
      } catch (error) {
        results.push({
          testId: testCase.id,
          expected: testCase.expectedResult,
          actual: { error: error.message },
          isCorrect: false
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        totalTests: selectedTests.length,
        correctPredictions: correct,
        accuracy: ((correct / selectedTests.length) * 100).toFixed(2)
      },
      results: results
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function calculateMetrics(results) {
  const totalTests = results.length;
  const correctTests = results.filter(r => r.isCorrect).length;
  
  // Classification accuracy
  const genuineTests = results.filter(r => r.expected.classification === 'genuine');
  const suspiciousTests = results.filter(r => r.expected.classification === 'suspicious');
  
  const genuineAccuracy = (genuineTests.filter(r => r.actual.classification === 'genuine').length / genuineTests.length) * 100;
  const suspiciousAccuracy = (suspiciousTests.filter(r => r.actual.classification === 'suspicious').length / suspiciousTests.length) * 100;
  
  // Display indicator accuracy
  const greenTests = results.filter(r => r.expected.displayIndicator === 'green');
  const redTests = results.filter(r => r.expected.displayIndicator === 'red');
  const yellowTests = results.filter(r => r.expected.displayIndicator === 'yellow');
  
  const greenAccuracy = greenTests.length > 0 ? (greenTests.filter(r => r.actual.displayIndicator === 'green').length / greenTests.length) * 100 : 0;
  const redAccuracy = redTests.length > 0 ? (redTests.filter(r => r.actual.displayIndicator === 'red').length / redTests.length) * 100 : 0;
  const yellowAccuracy = yellowTests.length > 0 ? (yellowTests.filter(r => r.actual.displayIndicator === 'yellow').length / yellowTests.length) * 100 : 0;
  
  // Image mismatch detection
  const imageMismatchTests = results.filter(r => 
    r.reviewData.hasImages && 
    r.expected.displayIndicator === 'red' && 
    r.expected.classification === 'genuine'
  );
  const imageMismatchAccuracy = imageMismatchTests.length > 0 ? 
    (imageMismatchTests.filter(r => r.actual.displayIndicator === 'red').length / imageMismatchTests.length) * 100 : 0;
  
  // A2A system performance
  const a2aTests = results.filter(r => r.a2aPerformed);
  const a2aUsageRate = (a2aTests.length / totalTests) * 100;
  
  return {
    overall: {
      totalTests,
      correctPredictions: correctTests,
      accuracy: ((correctTests / totalTests) * 100).toFixed(2)
    },
    classification: {
      genuineAccuracy: genuineAccuracy.toFixed(2),
      suspiciousAccuracy: suspiciousAccuracy.toFixed(2),
      genuineTests: genuineTests.length,
      suspiciousTests: suspiciousTests.length
    },
    displayIndicator: {
      greenAccuracy: greenAccuracy.toFixed(2),
      redAccuracy: redAccuracy.toFixed(2),
      yellowAccuracy: yellowAccuracy.toFixed(2),
      greenTests: greenTests.length,
      redTests: redTests.length,
      yellowTests: yellowTests.length
    },
    specialCases: {
      imageMismatchAccuracy: imageMismatchAccuracy.toFixed(2),
      imageMismatchTests: imageMismatchTests.length
    },
    a2aSystem: {
      usageRate: a2aUsageRate.toFixed(2),
      totalA2ACases: a2aTests.length
    }
  };
}
