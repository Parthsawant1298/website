// Test script to verify the analytics fix works
const { getProductAnalytics } = require('./lib/reviewAnalysis.js');

// Test with sample reviews
const testReviews = [
  { rating: 5, comment: "Great product!", hasPurchased: true },
  { rating: 4, comment: "Good quality", hasPurchased: true },
  { rating: 3, comment: "Average", hasPurchased: false }
];

console.log('Testing analytics generation...');
const analytics = getProductAnalytics(testReviews, 'test-product-123');

console.log('Analytics result:', {
  totalReviews: analytics.totalReviews,
  averageRating: analytics.averageRating,
  hasAverageRating: analytics.averageRating !== undefined,
  averageRatingType: typeof analytics.averageRating
});

// Verify the critical field exists
if (analytics.averageRating !== undefined) {
  console.log('✅ SUCCESS: averageRating field is present:', analytics.averageRating);
  console.log('✅ Can call toFixed():', analytics.averageRating.toFixed(1));
} else {
  console.log('❌ ERROR: averageRating field is missing');
}
