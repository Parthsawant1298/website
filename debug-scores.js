// debug-scores.js
const mongoose = require('mongoose');
require('dotenv').config();

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  comment: String,
  rating: Number,
  aiAnalysis: {
    classification: String,
    confidence: Number,
    scores: {
      sentimentScore: Number,
      authenticityScore: Number,
      productRelevanceScore: Number,
      purchaseVerificationScore: Number,
      overallRiskScore: Number
    },
    sentimentScore: Number,
    authenticityScore: Number,
    productRelevanceScore: Number,
    purchaseVerificationScore: Number,
    reasoning: String,
    analyzedAt: Date
  }
});

const Review = mongoose.model('Review', reviewSchema);

async function debugScores() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const reviews = await Review.find({ 'aiAnalysis.classification': { $exists: true } })
                                .populate('user', 'name')
                                .limit(5)
                                .sort({ 'aiAnalysis.analyzedAt': -1 });
    
    console.log(`\n📊 Found ${reviews.length} analyzed reviews:\n`);
    
    reviews.forEach((review, index) => {
      console.log(`--- Review ${index + 1} ---`);
      console.log('User:', review.user?.name || 'Unknown');
      console.log('Comment:', review.comment.substring(0, 50) + '...');
      console.log('Rating:', review.rating);
      console.log('Classification:', review.aiAnalysis?.classification);
      console.log('Confidence:', review.aiAnalysis?.confidence);
      console.log('Analyzed At:', review.aiAnalysis?.analyzedAt);
      
      console.log('\n🆕 NEW SCORES OBJECT:');
      if (review.aiAnalysis?.scores) {
        console.log('  scores.sentimentScore:', review.aiAnalysis.scores.sentimentScore);
        console.log('  scores.authenticityScore:', review.aiAnalysis.scores.authenticityScore);
        console.log('  scores.productRelevanceScore:', review.aiAnalysis.scores.productRelevanceScore);
        console.log('  scores.purchaseVerificationScore:', review.aiAnalysis.scores.purchaseVerificationScore);
        console.log('  scores.overallRiskScore:', review.aiAnalysis.scores.overallRiskScore);
      } else {
        console.log('  ❌ NO scores object found!');
      }
      
      console.log('\n🔄 LEGACY SCORES:');
      console.log('  sentimentScore:', review.aiAnalysis?.sentimentScore);
      console.log('  authenticityScore:', review.aiAnalysis?.authenticityScore);
      console.log('  productRelevanceScore:', review.aiAnalysis?.productRelevanceScore);
      console.log('  purchaseVerificationScore:', review.aiAnalysis?.purchaseVerificationScore);
      
      console.log('\n💭 Reasoning:', review.aiAnalysis?.reasoning?.substring(0, 100) + '...');
      console.log('\n' + '='.repeat(60) + '\n');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

debugScores();
