// scripts/analyzeExistingReviews.js
// Run this script to analyze all existing reviews in the database

import connectDB from '../lib/mongodb.js';
import Review from '../models/review.js';
import ReviewAnalysisService from '../lib/reviewAnalysis.js';

async function analyzeAllExistingReviews() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all reviews that haven't been analyzed or have pending status
    const reviews = await Review.find({
      $or: [
        { 'aiAnalysis.classification': 'pending' },
        { 'aiAnalysis.classification': { $exists: false } },
        { aiAnalysis: { $exists: false } }
      ]
    }).populate('user', 'name email').populate('product', 'name');

    console.log(`Found ${reviews.length} reviews that need analysis`);

    const analysisService = new ReviewAnalysisService();
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      console.log(`Analyzing review ${i + 1}/${reviews.length} - ${review._id}`);

      try {
        // Run AI analysis
        const analysis = await analysisService.analyzeReview({
          comment: review.comment,
          rating: review.rating,
          user: review.user?.name || review.user?.email || 'Anonymous'
        });

        // Update the review with AI analysis
        await Review.findByIdAndUpdate(review._id, {
          aiAnalysis: analysis,
          status: analysis.classification === 'suspicious' ? 'under_review' : 'published'
        });

        successCount++;
        console.log(`✅ Review ${review._id} analyzed: ${analysis.classification} (${Math.round(analysis.confidence * 100)}%)`);

        // Add small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to analyze review ${review._id}:`, error.message);
        
        // Set fallback analysis for failed reviews
        await Review.findByIdAndUpdate(review._id, {
          aiAnalysis: {
            classification: 'pending',
            confidence: 0,
            flags: ['analysis_failed'],
            reasoning: `Analysis failed: ${error.message}`,
            needsManualReview: true,
            analyzedAt: new Date(),
            sentimentScore: 0.5,
            authenticityScore: 0.5
          }
        });
        
        errorCount++;
      }
    }

    console.log(`\n🎉 Batch analysis completed!`);
    console.log(`✅ Successfully analyzed: ${successCount} reviews`);
    console.log(`❌ Failed to analyze: ${errorCount} reviews`);

    // Get final stats
    const allReviews = await Review.find({});
    const analyzed = allReviews.filter(r => r.aiAnalysis && r.aiAnalysis.classification !== 'pending');
    const genuine = allReviews.filter(r => r.aiAnalysis && r.aiAnalysis.classification === 'genuine');
    const suspicious = allReviews.filter(r => r.aiAnalysis && r.aiAnalysis.classification === 'suspicious');

    console.log(`\n📊 Final Statistics:`);
    console.log(`Total reviews: ${allReviews.length}`);
    console.log(`Analyzed: ${analyzed.length}`);
    console.log(`Genuine: ${genuine.length}`);
    console.log(`Suspicious: ${suspicious.length}`);

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
analyzeAllExistingReviews();
