// Script to analyze all existing reviews in the database
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// MongoDB connection
const mongoUri = 'mongodb+srv://sawaleparth:parth123@cluster0.qdqxh.mongodb.net/housekeeping?retryWrites=true&w=majority&appName=Cluster0';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyB9R0bZQZlWYyIfxw9y97wL6HnrZ5fLYjA');

class ReviewAnalysisService {
  constructor() {
    this.model = null;
  }

  async initializeModel() {
    try {
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      console.log('✅ Gemini 2.0 Flash model initialized');
    } catch (error) {
      console.error('❌ Model initialization failed:', error);
      throw error;
    }
  }

  calculateDaysBetween(purchaseDate, reviewDate) {
    try {
      if (!purchaseDate || !reviewDate) {
        return 'Unknown';
      }
      
      const purchase = new Date(purchaseDate);
      const review = new Date(reviewDate);
      
      if (isNaN(purchase.getTime()) || isNaN(review.getTime())) {
        return 'Invalid dates';
      }
      
      const diffTime = Math.abs(review - purchase);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Date calculation error:', error);
      return 'Error calculating days';
    }
  }

  async analyzeReview(reviewData) {
    try {
      if (!this.model) {
        await this.initializeModel();
      }

      const prompt = `You are an advanced AI review fraud detection system. Analyze this product review for authenticity and potential fraud patterns.

REVIEW TO ANALYZE:
- Comment: "${reviewData.comment}"
- Rating: ${reviewData.rating}/5 stars
- Review Date: ${reviewData.reviewDate || new Date().toISOString()}

PRODUCT CONTEXT:
- Product Name: "${reviewData.productName || 'Unknown Product'}"
- Product Description: "${reviewData.productDescription || 'No description available'}"
- Product Category: "${reviewData.productCategory || 'Unknown Category'}"
- Product Price: "${reviewData.productPrice || 'Unknown Price'}"

PURCHASE VERIFICATION:
- User Has Purchased Product: ${reviewData.hasPurchased === true ? 'YES - VERIFIED PURCHASER ✅' : reviewData.hasPurchased === false ? 'NO - NOT A PURCHASER (MAJOR RED FLAG) ❌' : 'UNKNOWN ⚠️'}
- Purchase Date: ${reviewData.purchaseDate || 'No purchase record found'}
- Review Date: ${reviewData.reviewDate || new Date().toISOString()}
- Days Between Purchase and Review: ${this.calculateDaysBetween(reviewData.purchaseDate, reviewData.reviewDate)} days

CRITICAL INSTRUCTION FOR PURCHASE VERIFICATION:
${reviewData.hasPurchased === true ? 
  '🟢 THIS USER IS A VERIFIED PURCHASER - DO NOT FLAG AS "no_purchase_record" OR "unverified_reviewer". They have legitimate purchase history.' : 
  '🔴 THIS USER HAS NOT PURCHASED - FLAG AS "no_purchase_record" AND "unverified_reviewer". This is a major red flag for fake reviews.'
}

Respond with this JSON structure:
{
  "classification": "genuine" | "suspicious" | "pending",
  "confidence": 0.85,
  "flags": ["Array of specific flags"],
  "reasoning": "Explanation of the decision",
  "needsManualReview": true/false,
  "scores": {
    "sentimentScore": 0.75,
    "authenticityScore": 0.60,
    "productRelevanceScore": 0.80,
    "purchaseVerificationScore": 0.90,
    "overallRiskScore": 0.65
  },
  "riskLevel": "low" | "medium" | "high"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        classification: analysis.classification || 'pending',
        confidence: Number(analysis.confidence) || 0.5,
        flags: Array.isArray(analysis.flags) ? analysis.flags : [],
        reasoning: String(analysis.reasoning || 'Analysis completed'),
        needsManualReview: Boolean(analysis.needsManualReview),
        analyzedAt: new Date().toISOString(),
        modelVersion: 'gemini-2.0-flash',
        scores: analysis.scores || {
          sentimentScore: 0.5,
          authenticityScore: 0.5,
          productRelevanceScore: 0.5,
          purchaseVerificationScore: reviewData.hasPurchased ? 0.9 : 0.1,
          overallRiskScore: 0.5
        },
        riskLevel: analysis.riskLevel || 'medium'
      };

    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        classification: 'pending',
        confidence: 0.5,
        flags: ['analysis_failed'],
        reasoning: 'Analysis failed due to technical error',
        needsManualReview: true,
        analyzedAt: new Date().toISOString(),
        modelVersion: 'gemini-2.0-flash-fallback',
        riskLevel: 'medium'
      };
    }
  }
}

async function analyzeAllReviews() {
  const client = new MongoClient(mongoUri);
  const analysisService = new ReviewAnalysisService();
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('housekeeping');
    const reviewsCollection = db.collection('reviews');
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');
    
    console.log('✅ Connected to MongoDB');
    
    // Get all reviews that need analysis
    const reviews = await reviewsCollection.find({
      $or: [
        { aiAnalysis: { $exists: false } },
        { 'aiAnalysis.modelVersion': { $ne: 'gemini-2.0-flash' } }
      ]
    }).toArray();
    
    console.log(`📊 Found ${reviews.length} reviews to analyze`);
    
    let analyzed = 0;
    let failed = 0;
    
    for (const review of reviews) {
      try {
        console.log(`\n🔍 Analyzing review ${analyzed + 1}/${reviews.length}`);
        console.log(`Review ID: ${review._id}`);
        
        // Get product details
        const product = await productsCollection.findOne({ _id: review.product });
        if (!product) {
          console.log('⚠️ Product not found, skipping');
          continue;
        }
        
        // Get user details
        const user = await usersCollection.findOne({ _id: review.user });
        if (!user) {
          console.log('⚠️ User not found, skipping');
          continue;
        }
        
        // Check purchase verification
        const purchaseRecord = await ordersCollection.findOne({
          user: review.user,
          'items.product': review.product,
          paymentStatus: 'completed',
          status: { $in: ['processing', 'delivered'] }
        });
        
        const hasPurchased = !!purchaseRecord;
        const purchaseDate = purchaseRecord ? purchaseRecord.createdAt : null;
        
        console.log(`- Product: ${product.name}`);
        console.log(`- User: ${user.name}`);
        console.log(`- Has Purchased: ${hasPurchased}`);
        console.log(`- Purchase Date: ${purchaseDate}`);
        
        // Analyze review
        const analysisResult = await analysisService.analyzeReview({
          comment: review.comment,
          rating: review.rating,
          productName: product.name,
          productDescription: product.description,
          productCategory: product.category,
          productPrice: `₹${product.price}`,
          hasPurchased: hasPurchased,
          purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
          reviewDate: review.createdAt ? review.createdAt.toISOString() : new Date().toISOString()
        });
        
        // Update review with analysis
        await reviewsCollection.updateOne(
          { _id: review._id },
          { 
            $set: { 
              aiAnalysis: analysisResult,
              status: analysisResult.classification === 'suspicious' ? 'flagged' : 'published'
            } 
          }
        );
        
        console.log(`✅ Analysis complete - Classification: ${analysisResult.classification}`);
        console.log(`Flags: ${analysisResult.flags.join(', ')}`);
        
        analyzed++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to analyze review ${review._id}:`, error);
        failed++;
      }
    }
    
    console.log(`\n📈 Analysis Complete!`);
    console.log(`✅ Successfully analyzed: ${analyzed} reviews`);
    console.log(`❌ Failed: ${failed} reviews`);
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the analysis
analyzeAllReviews();
