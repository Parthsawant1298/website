// Test file to demonstrate web search integration with review analysis
// This shows how the web search automatically integrates with existing AI analysis

import ReviewAnalysisService from '../lib/reviewAnalysis.js';

// Example of how web search now integrates automatically
async function testWebSearchIntegration() {
  const reviewService = new ReviewAnalysisService();
  
  // Example review that might be copied from the web
  const testReview = {
    comment: "This product is amazing! Great quality and fast delivery. Highly recommend to everyone!",
    rating: 5,
    user: "TestUser",
    productName: "Test Product",
    hasPurchased: true, // Even verified purchasers can copy content
    purchaseDate: new Date('2024-01-15'),
    reviewDate: new Date('2024-01-20')
  };
  
  // Method 1: Text-only analysis (now includes web search automatically)
  console.log('🔍 Testing text-only analysis with web search...');
  const textAnalysis = await reviewService.analyzeReview(testReview);
  
  console.log('Text Analysis Results:');
  console.log('- Classification:', textAnalysis.classification);
  console.log('- Confidence:', textAnalysis.confidence);
  console.log('- Flags:', textAnalysis.flags);
  console.log('- Web Search Found:', textAnalysis.webSearch?.found);
  console.log('- Is Copied:', textAnalysis.webSearch?.isCopied);
  console.log('- Copy Confidence:', textAnalysis.webSearch?.confidence);
  console.log('- Sources Found:', textAnalysis.webSearch?.sources?.length || 0);
  
  // Method 2: Image analysis (also includes web search automatically)
  console.log('\n🖼️ Testing image analysis with web search...');
  const imageAnalysis = await reviewService.analyzeReviewWithImage(
    testReview, 
    'https://example.com/product-image.jpg'
  );
  
  console.log('Image Analysis Results:');
  console.log('- Classification:', imageAnalysis.classification);
  console.log('- Confidence:', imageAnalysis.confidence);
  console.log('- Flags:', imageAnalysis.flags);
  console.log('- Web Search Found:', imageAnalysis.webSearch?.found);
  console.log('- Is Copied:', imageAnalysis.webSearch?.isCopied);
  console.log('- Copy Confidence:', imageAnalysis.webSearch?.confidence);
  console.log('- Image Authenticity:', imageAnalysis.imageAnalysis?.authenticity);
  
  // The web search results are now automatically included in:
  // 1. All admin analysis endpoints
  // 2. Both text and image analysis methods
  // 3. Fallback analysis scenarios
  // 4. The reasoning and detailed analysis text
  
  console.log('\n✅ Web search integration complete!');
  console.log('📝 Key Features:');
  console.log('- Single API key support (100 searches/day)');
  console.log('- Automatic error handling and fallbacks');
  console.log('- Integrated with ALL existing analysis logic');
  console.log('- Works for both genuine and suspicious reviews');
  console.log('- Preserves all existing AI analysis behavior');
  console.log('- Adds copied content detection without changing classifications');
}

// Example of the new web search API response structure
const exampleWebSearchResponse = {
  "webSearch": {
    "found": true,
    "isCopied": true,
    "confidence": 0.85,
    "analysis": "POTENTIAL COPIED CONTENT: High similarity (85.0%) found with content from amazon.com. Review text appears to be copied or very similar to existing web content.",
    "sources": [
      {
        "url": "https://amazon.com/product-reviews/example",
        "domain": "amazon.com",
        "similarity": 0.85,
        "matchType": "content"
      }
    ],
    "bestMatch": {
      "url": "https://amazon.com/product-reviews/example",
      "domain": "amazon.com", 
      "similarity": 0.85
    },
    "searchInfo": {
      "query": "This product is amazing! Great quality and fast delivery...",
      "totalUsage": 45,
      "searchTime": 0.234
    }
  }
};

console.log('Example response includes web search data:', exampleWebSearchResponse);

// Run test (uncomment to test)
// testWebSearchIntegration().catch(console.error);
