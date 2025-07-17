// lib/reviewAnalysis.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class ReviewAnalysisService {
 constructor() {
   // Initialize Gemini AI
   this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   // Use Gemini 2.0 Flash - stable release
   this.model = this.genAI.getGenerativeModel({ 
     model: "gemini-2.0-flash",
     generationConfig: {
       temperature: 0.1, // Low temperature for consistent analysis
       topP: 0.8,
       topK: 40,
       maxOutputTokens: 2048,
     }
   });
 }

 // Initialize model method for retry scenarios
 async initializeModel() {
   try {
     this.model = this.genAI.getGenerativeModel({ 
       model: "gemini-2.0-flash",
       generationConfig: {
         temperature: 0.1,
         topP: 0.8,
         topK: 40,
         maxOutputTokens: 2048,
       }
     });
     console.log('Gemini 2.0 Flash model initialized successfully');
   } catch (error) {
     console.error('Failed to initialize Gemini model:', error);
     throw error;
   }
 }

 // Calculate days between two dates
 calculateDaysBetween(purchaseDate, reviewDate) {
   try {
     if (!purchaseDate || !reviewDate) {
       return 'N/A';
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
     console.error('Error calculating days between dates:', error);
     return 'Error calculating';
   }
 }

 async analyzeReview(reviewData) {
   console.log('🔍 Starting enhanced review analysis with product context:', {
     hasPurchased: reviewData.hasPurchased,
     purchaseDate: reviewData.purchaseDate,
     comment: reviewData.comment?.substring(0, 100) + '...',
     rating: reviewData.rating,
     productName: reviewData.productName
   });

   try {
     // Ensure model is initialized
     if (!this.model) {
       console.log('Model not initialized. Initializing now...');
       await this.initializeModel();
     }

     // Validate input data
     if (!reviewData || !reviewData.comment || reviewData.rating === undefined) {
       throw new Error('Invalid review data: missing comment or rating');
     }

     // Ultra-detailed AI analysis prompt for comprehensive review assessment
     const prompt = `
You are an EXPERT AI review fraud detection system with advanced analytical capabilities and real-world business intelligence.

REVIEW DATA:
- Rating: ${reviewData.rating}/5 stars
- Comment: "${reviewData.comment.trim()}"
- User: ${reviewData.user || 'Anonymous'}
- Review Date: ${reviewData.reviewDate || new Date().toISOString()}

PRODUCT CONTEXT:
- Product Name: "${reviewData.productName || 'Unknown Product'}"
- Product Description: "${reviewData.productDescription || 'No description available'}"
- Product Category: "${reviewData.productCategory || 'Unknown Category'}"
- Product Price: "${reviewData.productPrice || 'Unknown Price'}"

PURCHASE VERIFICATION STATUS:
- User Has Purchased Product: ${reviewData.hasPurchased === true ? 'YES - VERIFIED PURCHASER WITH COMPLETED ORDER ✅' : reviewData.hasPurchased === false ? 'NO - UNVERIFIED USER ❌' : 'UNKNOWN STATUS ⚠️'}
- Purchase Date: ${reviewData.purchaseDate || 'No purchase record found'}
- Review Date: ${reviewData.reviewDate || new Date().toISOString()}
- Days Between Purchase and Review: ${this.calculateDaysBetween(reviewData.purchaseDate, reviewData.reviewDate)} days

🧠 INTELLIGENT ANALYSIS RULES:

VERIFIED PURCHASERS (hasPurchased = true):
✅ AUTOMATIC BENEFITS:
- Classification: "genuine" (unless extreme bot behavior detected)
- Confidence: 0.85-0.95 (high confidence)
- Purchase Verification Score: 0.95 (verified buyer)
- Authenticity Score: 0.80-0.90 (real customer)
- Sentiment Score: Based on actual review content (can be low if disappointed)
- Product Relevance Score: 0.80-0.90 (bought the product)
- Overall Risk Score: 0.10-0.25 (low risk)
- Remove flags: "no_purchase_record", "unverified_reviewer"

REAL-WORLD LOGIC FOR VERIFIED PURCHASERS:
- 1-star + negative comment = GENUINE (disappointed customer)
- 5-star + positive comment = GENUINE (satisfied customer)
- 5-star + negative comment = GENUINE (rating system confusion or sarcasm)
- 1-star + positive comment = GENUINE (rating system confusion)
- Generic language = STILL GENUINE (not everyone writes detailed reviews)
- Quick review timing = GENUINE (excited to share experience)
- Delayed review timing = GENUINE (took time to test product)
- Sentiment-rating mismatch = GENUINE (customer confusion, not fraud)

UNVERIFIED USERS (hasPurchased = false):
❌ AUTOMATIC PENALTIES:
- Classification: "suspicious" (high probability of fake)
- Confidence: 0.20-0.40 (low confidence)
- Purchase Verification Score: 0.10-0.20 (no purchase proof)
- Must include flags: "no_purchase_record", "unverified_reviewer"
- Higher scrutiny for all other metrics

NON-PURCHASER RED FLAGS:
- 5-star + generic positive = FAKE PROMOTIONAL REVIEW
- 5-star + negative comment = HIGHLY SUSPICIOUS (coordinated attack)
- 1-star + positive comment = HIGHLY SUSPICIOUS (review manipulation)
- Overly detailed product knowledge without purchase = SUSPICIOUS
- Perfect grammar + promotional language = BOT REVIEW
- Generic timing patterns = COORDINATED ATTACK

UNKNOWN STATUS (hasPurchased = null/undefined):
⚠️ MODERATE APPROACH:
- Classification: "pending" (needs manual review)
- Confidence: 0.40-0.60 (moderate)
- Include flag: "unverified_reviewer"
- Analyze content more carefully

ADVANCED PATTERN RECOGNITION:

1. SENTIMENT-RATING INTELLIGENCE:
  - Verified buyer + ANY rating mismatch = GENUINE (honest opinion or confusion)
  - Non-buyer + rating mismatch = SUSPICIOUS (fake review)
  - Perfect 5-star + generic praise = Check purchase status first

2. CONTENT QUALITY ANALYSIS:
  - Verified buyer + brief review = GENUINE (busy customer)
  - Non-buyer + brief review = SUSPICIOUS (lazy fake)
  - Verified buyer + detailed review = GENUINE (engaged customer)
  - Non-buyer + detailed review = SUSPICIOUS (over-compensation)

3. TIMING INTELLIGENCE:
  - Same day purchase + review = GENUINE (immediate feedback)
  - No purchase + quick review = SUSPICIOUS (fake timing)
  - Long delay + purchase = GENUINE (tested thoroughly)
  - Long delay + no purchase = SUSPICIOUS (coordinated campaign)

4. PRODUCT RELEVANCE INTELLIGENCE:
  - Verified buyer + product mismatch = GENUINE (confused but real)
  - Non-buyer + perfect product match = SUSPICIOUS (researched fake)

5. EDIT PATTERN INTELLIGENCE:
  - Verified buyer + edits = GENUINE (correcting honest mistakes)
  - Non-buyer + edits = SUSPICIOUS (refining fake content)

SCORING INTELLIGENCE:

FOR VERIFIED PURCHASERS:
{
 "sentimentScore": 0.70-0.90, // Based on actual content sentiment
 "authenticityScore": 0.85-0.95, // High authenticity due to purchase
 "productRelevanceScore": 0.80-0.90, // They bought it, so relevant
 "purchaseVerificationScore": 0.95, // Maximum score for verified buyers
 "overallRiskScore": 0.10-0.25 // Low risk due to purchase proof
}

FOR NON-PURCHASERS:
{
 "sentimentScore": 0.30-0.60, // Question the sentiment authenticity
 "authenticityScore": 0.15-0.35, // Low authenticity without purchase
 "productRelevanceScore": 0.20-0.50, // How do they know without buying?
 "purchaseVerificationScore": 0.10-0.20, // No purchase proof
 "overallRiskScore": 0.70-0.90 // High risk without purchase
}

BUSINESS LOGIC PRIORITIES:
1. Purchase verification OVERRIDES everything else
2. Protect genuine customers (even if they're disappointed or confused)
3. Catch fake promotional reviews (non-buyers with generic praise)
4. Understand real customer behavior patterns (including rating confusion)
5. Balance automation with human judgment

${reviewData.editHistory && reviewData.editHistory.length > 0 ? `
EDIT HISTORY (CONTEXT FOR ANALYSIS):
- Number of Edits: ${reviewData.editHistory.length}
- Edit Details: ${reviewData.editHistory.map((edit, index) => `Edit ${index + 1}: ${edit.editedAt}, Previous Rating: ${edit.previousRating}`).join('; ')}
- Note: Verified buyers editing reviews = normal behavior, non-buyers editing = suspicious
` : 'EDIT HISTORY: No edits (Normal)'}

Respond with this EXACT JSON structure:

{
 "classification": "genuine" | "suspicious" | "pending",
 "confidence": 0.85,
 "detailedAnalysis": {
   "purchaseVerificationAnalysis": "Detailed analysis of purchase verification and its impact on authenticity",
   "productRelevanceAnalysis": "Analysis of how well the review content matches the specific product",
   "authenticityAssessment": "Overall assessment of review authenticity based on language and behavior patterns",
   "linguisticAnalysis": "Analysis of writing style, language patterns, and emotional authenticity",
   "suspiciousPatterns": "Identification and explanation of any suspicious patterns or red flags",
   "timelineAnalysis": "Analysis of timing patterns between purchase and review submission",
   "specificConcerns": "Specific concerns or positive indicators that influenced the final classification"
 },
 "flags": ["specific_flag_1", "specific_flag_2"],
 "reasoning": "Clear explanation of why this review received this classification based on the analysis",
 "needsManualReview": true/false,
 "scores": {
   "sentimentScore": 0.75,
   "authenticityScore": 0.85,
   "productRelevanceScore": 0.80,
   "purchaseVerificationScore": 0.95,
   "overallRiskScore": 0.20
 },
 "riskLevel": "low" | "medium" | "high",
 "recommendations": {
   "action": "approve" | "reject" | "manual_review",
   "priority": "low" | "medium" | "high", 
   "explanation": "Recommendation explanation"
 },
 "keyInsights": [
   "Key insight about purchase verification impact",
   "Key insight about content authenticity",
   "Key insight about overall risk assessment"
 ]
}

CRITICAL SUCCESS FACTORS:
- Purchase verification is the PRIMARY trust signal
- Real customers can be disappointed, confused, or sarcastic (still genuine if purchased)
- Generic language from verified buyers is acceptable
- Rating-sentiment mismatch from verified buyers is normal human behavior
- Non-buyers should be heavily scrutinized regardless of content quality
- Balance between automated detection and human-like judgment
- Focus on protecting legitimate customers while catching fake reviews

Provide intelligent, nuanced analysis that reflects real-world e-commerce review patterns and human behavior.`;

     let result;
     let attempts = 0;
     const maxAttempts = 3;

     while (attempts < maxAttempts) {
       try {
         console.log(`Gemini API attempt ${attempts + 1}/${maxAttempts}`);
         result = await this.model.generateContent(prompt);
         
         // Check if we got a valid response
         const response = await result.response;
         if (!response) {
           throw new Error('Empty response from Gemini API');
         }
         
         break;
       } catch (error) {
         attempts++;
         console.error(`Gemini API attempt ${attempts} failed:`, error.message);
         
         // Handle specific error types
         if (error.message.includes('SAFETY')) {
           console.warn('Safety filter triggered, adjusting analysis approach');
           // Return a conservative analysis for safety-filtered content
           return this.createSafetyFilteredAnalysis(reviewData);
         }
         
         if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('RATE_LIMIT')) {
           console.warn('Rate limit or quota exceeded, implementing backoff');
           const backoffTime = Math.min(1000 * Math.pow(2, attempts), 10000);
           await new Promise(resolve => setTimeout(resolve, backoffTime));
         }
         
         if (attempts < maxAttempts) {
           // Progressive retry strategy
           await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
           
           // Try reinitializing model on second retry
           if (attempts === 2) {
             try {
               await this.initializeModel();
             } catch (initError) {
               console.error('Model reinitialization failed:', initError);
             }
           }
         } else {
           throw error;
         }
       }
     }

     if (!result) {
       throw new Error('Failed to get response from Gemini after all attempts');
     }

     const response = await result.response;
     const text = response.text();
     
     if (!text || text.trim().length === 0) {
       throw new Error('Empty response text from Gemini');
     }
     
     try {
       // Clean and parse the JSON response
       const cleanedText = this.cleanJsonResponse(text);
       const analysis = JSON.parse(cleanedText);
       
       // Validate and sanitize the response
       const sanitizedAnalysis = this.sanitizeAnalysis(analysis);
       
       // POST-PROCESSING: Override for verified purchasers
       console.log('🔍 DEBUG: Post-processing check:', {
         hasPurchased: reviewData.hasPurchased,
         hasPurchasedType: typeof reviewData.hasPurchased,
         hasPurchasedStrict: reviewData.hasPurchased === true
       });
       
       if (reviewData.hasPurchased === true) {
         console.log('🔄 Applying verified purchaser overrides...');
         
         // Force high purchase verification score for verified purchasers
         if (sanitizedAnalysis.scores) {
           console.log('📊 Before override:', sanitizedAnalysis.scores);
           sanitizedAnalysis.scores.purchaseVerificationScore = 0.95;
           // Also boost other scores for verified purchasers
           sanitizedAnalysis.scores.authenticityScore = Math.max(0.8, sanitizedAnalysis.scores.authenticityScore);
           sanitizedAnalysis.scores.sentimentScore = Math.max(0.7, sanitizedAnalysis.scores.sentimentScore);
           sanitizedAnalysis.scores.productRelevanceScore = Math.max(0.8, sanitizedAnalysis.scores.productRelevanceScore);
           sanitizedAnalysis.scores.overallRiskScore = Math.min(0.3, sanitizedAnalysis.scores.overallRiskScore);
           console.log('📊 After override:', sanitizedAnalysis.scores);
         } else {
           console.log('📊 No scores object, creating new one');
           sanitizedAnalysis.purchaseVerificationScore = 0.95;
           sanitizedAnalysis.authenticityScore = Math.max(0.8, sanitizedAnalysis.authenticityScore || 0.5);
           sanitizedAnalysis.sentimentScore = Math.max(0.7, sanitizedAnalysis.sentimentScore || 0.5);
         }
         
         // Remove ALL purchase-related flags for verified purchasers
         if (sanitizedAnalysis.flags) {
           console.log('🏴 Before flag removal:', sanitizedAnalysis.flags);
           const flagsToRemove = ['no_purchase_record', 'unverified_reviewer', 'no_purchase', 'unverified', 'purchase_verification_failed'];
           sanitizedAnalysis.flags = sanitizedAnalysis.flags.filter(flag => 
             !flagsToRemove.some(removeFlag => flag.toLowerCase().includes(removeFlag.toLowerCase()))
           );
           console.log('🏴 After flag removal:', sanitizedAnalysis.flags);
         }
         
         // Force classification to genuine for verified purchasers unless there are EXTREME red flags
         const extremeFlags = ['bot_behavior', 'copy_paste', 'spam', 'promotional'];
         const hasExtremeFlags = sanitizedAnalysis.flags && 
           sanitizedAnalysis.flags.some(flag => 
             extremeFlags.some(extreme => flag.toLowerCase().includes(extreme.toLowerCase()))
           );
         
         if (!hasExtremeFlags) {
           console.log('🔄 Overriding classification to genuine for verified purchaser');
           sanitizedAnalysis.classification = 'genuine';
           sanitizedAnalysis.confidence = Math.max(0.8, sanitizedAnalysis.confidence);
           sanitizedAnalysis.riskLevel = 'low';
           sanitizedAnalysis.needsManualReview = false;
           
           // Update reasoning to reflect purchase verification
           sanitizedAnalysis.reasoning = `VERIFIED PURCHASER: User has completed purchase with order confirmation. ${sanitizedAnalysis.reasoning || ''} Purchase verification overrides other concerns.`;
         }
         
         console.log('✅ Verified purchaser overrides applied:', {
           classification: sanitizedAnalysis.classification,
           confidence: sanitizedAnalysis.confidence,
           purchaseVerificationScore: sanitizedAnalysis.scores?.purchaseVerificationScore || sanitizedAnalysis.purchaseVerificationScore,
           flagsRemaining: sanitizedAnalysis.flags?.length || 0
         });
       } else {
         console.log('❌ Not applying overrides - user not verified purchaser');
       }
       
       console.log('Gemini 2.0 Flash analysis successful:', {
         classification: sanitizedAnalysis.classification,
         confidence: sanitizedAnalysis.confidence,
         riskLevel: sanitizedAnalysis.riskLevel
       });
       
       return sanitizedAnalysis;
       
     } catch (parseError) {
       console.error('Failed to parse Gemini response as JSON:', parseError);
       console.log('Raw Gemini response:', text.substring(0, 500));
       
       // Enhanced fallback analysis
       return this.enhancedFallbackAnalysis(reviewData, text);
     }
     
   } catch (error) {
     console.error('Gemini API error:', error);
     
     // Return comprehensive fallback analysis
     return {
       classification: 'pending',
       confidence: 0,
       flags: ['analysis_failed'],
       reasoning: `AI analysis failed due to: ${error.message}. Manual review required for accurate assessment.`,
       needsManualReview: true,
       analyzedAt: new Date().toISOString(),
       error: error.message,
       riskLevel: 'medium'
     };
   }
 }

 // Clean JSON response from potential markdown formatting
 cleanJsonResponse(text) {
   // Remove markdown code blocks if present
   let cleaned = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
   
   // Remove any leading/trailing whitespace
   cleaned = cleaned.trim();
   
   // Find JSON object boundaries
   const startIndex = cleaned.indexOf('{');
   const endIndex = cleaned.lastIndexOf('}');
   
   if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
     cleaned = cleaned.substring(startIndex, endIndex + 1);
   }
   
   return cleaned;
 }

 // Validate and sanitize analysis response
 sanitizeAnalysis(analysis) {
   // Handle both old and new detailed analysis formats
   const sanitized = {
     classification: ['genuine', 'suspicious', 'pending', 'legitimate'].includes(analysis.classification) 
       ? analysis.classification : 'pending',
     confidence: Math.max(0, Math.min(1, parseFloat(analysis.confidence) || 0)),
     flags: Array.isArray(analysis.flags) ? analysis.flags.slice(0, 15) : [], // Increased flag limit
     reasoning: String(analysis.reasoning || 'Analysis completed').substring(0, 2000), // Increased length for detailed analysis
     needsManualReview: Boolean(analysis.needsManualReview),
     analyzedAt: new Date().toISOString(),
     modelVersion: 'gemini-2.0-flash'
   };

   // Handle detailed analysis structure if present
   if (analysis.detailedAnalysis) {
     sanitized.detailedAnalysis = {
       purchaseVerificationAnalysis: String(analysis.detailedAnalysis.purchaseVerificationAnalysis || '').substring(0, 1000),
       productRelevanceAnalysis: String(analysis.detailedAnalysis.productRelevanceAnalysis || '').substring(0, 1000),
       authenticityAssessment: String(analysis.detailedAnalysis.authenticityAssessment || '').substring(0, 1000),
       linguisticAnalysis: String(analysis.detailedAnalysis.linguisticAnalysis || '').substring(0, 1000),
       suspiciousPatterns: String(analysis.detailedAnalysis.suspiciousPatterns || '').substring(0, 1000),
       timelineAnalysis: String(analysis.detailedAnalysis.timelineAnalysis || '').substring(0, 1000),
       specificConcerns: String(analysis.detailedAnalysis.specificConcerns || '').substring(0, 1000)
     };
   }

   // Handle scores (both old and new format)
   if (analysis.scores) {
     sanitized.scores = {
       sentimentScore: Math.max(0, Math.min(1, parseFloat(analysis.scores.sentimentScore) || 0.5)),
       authenticityScore: Math.max(0, Math.min(1, parseFloat(analysis.scores.authenticityScore) || 0.5)),
       productRelevanceScore: Math.max(0, Math.min(1, parseFloat(analysis.scores.productRelevanceScore) || 0.5)),
       purchaseVerificationScore: Math.max(0, Math.min(1, parseFloat(analysis.scores.purchaseVerificationScore) || 0.5)),
       overallRiskScore: Math.max(0, Math.min(1, parseFloat(analysis.scores.overallRiskScore) || 0.5))
     };
   } else {
     // Fallback to old format
     sanitized.sentimentScore = Math.max(0, Math.min(1, parseFloat(analysis.sentimentScore) || 0.5));
     sanitized.authenticityScore = Math.max(0, Math.min(1, parseFloat(analysis.authenticityScore) || 0.5));
     sanitized.productRelevanceScore = Math.max(0, Math.min(1, parseFloat(analysis.productRelevanceScore) || 0.5));
     sanitized.purchaseVerificationScore = Math.max(0, Math.min(1, parseFloat(analysis.purchaseVerificationScore) || 0.5));
   }

   // Handle recommendations
   if (analysis.recommendations) {
     sanitized.recommendations = {
       action: ['approve', 'reject', 'manual_review'].includes(analysis.recommendations.action) 
         ? analysis.recommendations.action : 'manual_review',
       priority: ['low', 'medium', 'high'].includes(analysis.recommendations.priority) 
         ? analysis.recommendations.priority : 'medium',
       explanation: String(analysis.recommendations.explanation || '').substring(0, 500)
     };
   }

   // Handle key insights
   if (Array.isArray(analysis.keyInsights)) {
     sanitized.keyInsights = analysis.keyInsights.slice(0, 5).map(insight => String(insight).substring(0, 300));
   }

   // Risk level
   sanitized.riskLevel = ['low', 'medium', 'high'].includes(analysis.riskLevel) ? 
     analysis.riskLevel : 'medium';

   // Legacy fields for backwards compatibility
   sanitized.specificIssues = Array.isArray(analysis.specificIssues) ? 
     analysis.specificIssues.slice(0, 5).map(issue => String(issue).substring(0, 200)) : [];

   return sanitized;
 }

 // Handle safety-filtered content
 createSafetyFilteredAnalysis(reviewData) {
   return {
     classification: 'pending',
     confidence: 0.1,
     flags: ['safety_filter_triggered'],
     reasoning: 'Content triggered safety filters and requires manual review for policy compliance.',
     needsManualReview: true,
     analyzedAt: new Date().toISOString(),
     sentimentScore: 0.5,
     authenticityScore: 0.5,
     specificIssues: ['Content flagged by safety filters'],
     riskLevel: 'high',
     modelVersion: 'gemini-2.0-flash'
   };
 }

 // Enhanced fallback analysis when JSON parsing fails
 enhancedFallbackAnalysis(reviewData, geminiText) {
   const comment = reviewData.comment.toLowerCase();
   const rating = parseInt(reviewData.rating);
   let flags = [];
   let confidence = 0.5;
   let reasoning = 'Fallback analysis used due to parsing issues. ';
   
   // Extract insights from Gemini's text response even if not JSON
   if (geminiText.toLowerCase().includes('suspicious') || geminiText.toLowerCase().includes('fake')) {
     flags.push('ai_flagged_suspicious');
     confidence = Math.max(0.2, confidence - 0.3);
     reasoning += 'AI detected suspicious patterns. ';
   }
   
   if (geminiText.toLowerCase().includes('genuine') || geminiText.toLowerCase().includes('authentic')) {
     confidence = Math.min(0.8, confidence + 0.3);
     reasoning += 'AI detected authentic patterns. ';
   }
   
   // Enhanced pattern detection
   const words = comment.split(/\s+/);
   const uniqueWords = new Set(words);
   
   // Repetition analysis
   if (words.length > 5 && uniqueWords.size / words.length < 0.6) {
     flags.push('high_repetition');
     confidence -= 0.2;
     reasoning += 'High word repetition detected. ';
   }
   
   // Sentiment-rating mismatch (enhanced)
   const strongNegative = /terrible|awful|bad|hate|worst|horrible|disgusting|waste|useless/.test(comment);
   const strongPositive = /amazing|excellent|great|love|perfect|wonderful|fantastic|outstanding/.test(comment);
   const moderateNegative = /okay|average|meh|disappointing|mediocre/.test(comment);
   const moderatePositive = /good|nice|decent|satisfied|happy/.test(comment);
   
   // Check for sentiment-rating mismatches
   if ((rating >= 4 && strongNegative) || (rating <= 2 && strongPositive)) {
     flags.push('severe_sentiment_mismatch');
     confidence -= 0.4;
     reasoning += 'Severe sentiment-rating mismatch detected. ';
   } else if ((rating >= 4 && moderateNegative) || (rating <= 2 && moderatePositive)) {
     flags.push('moderate_sentiment_mismatch');
     confidence -= 0.2;
     reasoning += 'Moderate sentiment-rating mismatch detected. ';
   }
   
   // Generic language detection
   const genericPhrases = /highly recommend|amazing product|great value|must buy|five stars|excellent quality/;
   if (genericPhrases.test(comment) && comment.length < 100) {
     flags.push('generic_language');
     confidence -= 0.15;
     reasoning += 'Generic promotional language detected. ';
   }
   
   // Length analysis
   if (comment.length < 20 && rating >= 4) {
     flags.push('suspiciously_short');
     confidence -= 0.1;
     reasoning += 'Suspiciously short positive review. ';
   }
   
   const finalConfidence = Math.max(0, Math.min(1, confidence));
   
   return {
     classification: finalConfidence > 0.6 ? 'genuine' : finalConfidence > 0.3 ? 'suspicious' : 'pending',
     confidence: finalConfidence,
     flags,
     reasoning: reasoning + `Raw AI response: ${geminiText.substring(0, 200)}...`,
     needsManualReview: true,
     analyzedAt: new Date().toISOString(),
     sentimentScore: this.calculateSentimentScore(comment, rating),
     authenticityScore: finalConfidence,
     specificIssues: flags.map(flag => flag.replace(/_/g, ' ')),
     riskLevel: finalConfidence > 0.6 ? 'low' : finalConfidence > 0.3 ? 'medium' : 'high',
     modelVersion: 'gemini-2.0-flash-fallback'
   };
 }

 // Calculate sentiment score based on text and rating
 calculateSentimentScore(comment, rating) {
   const positiveWords = comment.match(/amazing|excellent|great|love|perfect|wonderful|fantastic|good|nice|happy|satisfied/g) || [];
   const negativeWords = comment.match(/terrible|awful|bad|hate|worst|horrible|disappointing|useless|waste/g) || [];
   
   const sentimentFromText = (positiveWords.length - negativeWords.length) / Math.max(1, positiveWords.length + negativeWords.length);
   const sentimentFromRating = (rating - 3) / 2; // Normalize rating to -1 to 1
   
   // Weighted average
   const combinedSentiment = (sentimentFromText * 0.6 + sentimentFromRating * 0.4);
   
   // Convert to 0-1 scale
   return Math.max(0, Math.min(1, (combinedSentiment + 1) / 2));
 }

 // Batch analysis with improved error handling and rate limiting
 async batchAnalyzeReviews(reviews, batchSize = 3) {
   const results = [];
   const delayBetweenBatches = 2000; // 2 seconds between batches for rate limiting
   
   console.log(`Starting batch analysis of ${reviews.length} reviews with batch size ${batchSize}`);
   
   for (let i = 0; i < reviews.length; i += batchSize) {
     const batch = reviews.slice(i, i + batchSize);
     const batchNumber = Math.floor(i / batchSize) + 1;
     const totalBatches = Math.ceil(reviews.length / batchSize);
     
     console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} reviews)`);
     
     const batchPromises = batch.map(async (review, index) => {
       try {
         // Add small delay between requests in the same batch
         if (index > 0) {
           await new Promise(resolve => setTimeout(resolve, 500));
         }
         
         const analysis = await this.analyzeReview({
           comment: review.comment,
           rating: review.rating,
           user: review.user || review.username || 'Anonymous'
         });
         
         return {
           reviewId: review._id || review.id,
           success: true,
           analysis
         };
       } catch (error) {
         console.error(`Error analyzing review ${review._id || review.id}:`, error);
         return {
           reviewId: review._id || review.id,
           success: false,
           error: error.message,
          analysis: {
            classification: 'pending',
            confidence: 0,
            flags: ['batch_analysis_error'],
            reasoning: `Batch analysis failed: ${error.message}`,
            needsManualReview: true,
            analyzedAt: new Date().toISOString(),
            riskLevel: 'medium',
            modelVersion: 'gemini-2.0-flash'
          }
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Progress logging
    const successCount = batchResults.filter(r => r.success).length;
    console.log(`Batch ${batchNumber} completed: ${successCount}/${batchResults.length} successful`);
    
    // Delay between batches to respect rate limits
    if (i + batchSize < reviews.length) {
      console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  const totalSuccess = results.filter(r => r.success).length;
  console.log(`Batch analysis completed: ${totalSuccess}/${results.length} reviews analyzed successfully`);
  
  return results;
}

// Enhanced analytics for admin dashboard
getAnalytics(reviews) {
  const totalReviews = reviews.length;
  let suspiciousCount = 0;
  let genuineCount = 0;
  let pendingCount = 0;
  let flaggedForManualReview = 0;
  let highRiskCount = 0;
  let avgConfidence = 0;
  let avgSentiment = 0;
  let avgAuthenticity = 0;
  
  const flagStats = {};
  const riskDistribution = { low: 0, medium: 0, high: 0 };
  const modelVersions = {};
  
  let analyzedCount = 0;
  
  reviews.forEach(review => {
    if (review.aiAnalysis) {
      analyzedCount++;
      
      // Classification counts
      switch (review.aiAnalysis.classification) {
        case 'suspicious':
          suspiciousCount++;
          break;
        case 'genuine':
          genuineCount++;
          break;
        case 'pending':
          pendingCount++;
          break;
      }
      
      // Manual review flags
      if (review.aiAnalysis.needsManualReview) flaggedForManualReview++;
      
      // Risk level distribution
      const riskLevel = review.aiAnalysis.riskLevel || 'medium';
      riskDistribution[riskLevel]++;
      if (riskLevel === 'high') highRiskCount++;
      
      // Average scores
      avgConfidence += review.aiAnalysis.confidence || 0;
      avgSentiment += review.aiAnalysis.sentimentScore || 0.5;
      avgAuthenticity += review.aiAnalysis.authenticityScore || 0.5;
      
      // Flag statistics
      if (review.aiAnalysis.flags) {
        review.aiAnalysis.flags.forEach(flag => {
          flagStats[flag] = (flagStats[flag] || 0) + 1;
        });
      }
      
      // Model version tracking
      const modelVersion = review.aiAnalysis.modelVersion || 'unknown';
      modelVersions[modelVersion] = (modelVersions[modelVersion] || 0) + 1;
    }
  });
  
  return {
    totalReviews,
    analyzedReviews: analyzedCount,
    analysisCoverage: totalReviews > 0 ? ((analyzedCount / totalReviews) * 100).toFixed(1) : '0',
    
    // Classification metrics
    genuineCount,
    suspiciousCount,
    pendingCount,
    flaggedForManualReview,
    highRiskCount,
    
    // Percentage metrics
    suspiciousPercentage: totalReviews > 0 ? ((suspiciousCount / totalReviews) * 100).toFixed(1) : '0',
    trustScore: totalReviews > 0 ? ((genuineCount / totalReviews) * 100).toFixed(1) : '0',
    riskPercentage: totalReviews > 0 ? ((highRiskCount / totalReviews) * 100).toFixed(1) : '0',
    
    // Average scores
    avgConfidence: analyzedCount > 0 ? (avgConfidence / analyzedCount).toFixed(3) : '0',
    avgSentiment: analyzedCount > 0 ? (avgSentiment / analyzedCount).toFixed(3) : '0.5',
    avgAuthenticity: analyzedCount > 0 ? (avgAuthenticity / analyzedCount).toFixed(3) : '0.5',
    
    // Detailed breakdowns
    flagStats,
    riskDistribution,
    modelVersions,
    
    // System info
    aiPowered: true,
    modelUsed: 'gemini-2.0-flash',
    lastUpdated: new Date().toISOString()
  };
}

// Health check method for monitoring
async healthCheck() {
  try {
    // Simple connectivity check without creating test reviews
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Test with a minimal prompt
    const result = await model.generateContent("Health check: respond with 'OK'");
    const response = await result.response;
    
    return {
      status: 'healthy',
      model: 'gemini-2.0-flash',
      responseTime: Date.now(),
      apiResponse: response.text() ? 'OK' : 'No response'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      model: 'gemini-2.0-flash',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
}

export default ReviewAnalysisService;