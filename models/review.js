// models/review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    trim: true
  },
  // Review Images with validation
  images: [{
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid image URL format'
      }
    },
    filename: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || !/[<>:"/\\|?*]/.test(v); // Prevent path traversal
        },
        message: 'Invalid filename characters'
      }
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Edit History Tracking
  editHistory: [{
    previousComment: String,
    previousRating: Number,
    editedAt: {
      type: Date,
      default: Date.now
    },
    editReason: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  lastEditedAt: Date,
  // ML Analysis Fields
  aiAnalysis: {
    classification: {
      type: String,
      enum: ['genuine', 'suspicious', 'pending'],
      default: 'pending'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    flags: [{
      type: String,
      enum: [
        'spam',
        'fake',
        'inappropriate',
        'helpful',
        'verified_purchase',
        'long_text',
        'short_text',
        'positive_sentiment',
        'negative_sentiment',
        'neutral_sentiment',
        'high_sentiment_mismatch',
        'moderate_sentiment_mismatch',
        'generic_language',
        'suspiciously_short',
        'ai_flagged_suspicious',
        'safety_filter_triggered',
        'batch_analysis_error',
        'product_mismatch',
        'no_purchase_verification',
        'purchase_timing_suspicious',
        'product_irrelevant_content',
        'unverified_purchase',
        'generic_review',
        'potential_fake_review',
        'suspicious_language_patterns',
        'lack_product_specificity',
        'rating_content_mismatch',
        'promotional_content',
        'copy_paste_indicators',
        'bot_like_patterns',
        'emotional_authenticity_low',
        'timeline_suspicious',
        'multiple_edits_suspicious',
        'technical_inaccuracies',
        'price_expectation_mismatch',
        'no_purchase_record',
        'lack_of_personal_experience',
        'insufficient_product_details',
        'overly_generic_language',
        'timing_analysis_suspicious',
        'authenticity_concerns',
        'product_knowledge_lacking',
        'review_pattern_suspicious',
        'language_style_inconsistent',
        'emotional_tone_mismatch',
        'product_feature_mismatch',
        'experience_timeline_inconsistent',
        'unverified_reviewer',
        'future_review_date', // NEW: Flag for reviews with future timestamps
        // Image Analysis Flags
        'image_mismatch',
        'stock_photo',
        'low_quality_image',
        'sentiment_image_mismatch',
        'promotional_style',
        'watermark_detected',
        'image_generic',
        'image_processing_error',
        'image_analysis_failed',
        'image_analysis_error',
        'json_parse_error',
        'complete_analysis_failure',
        'no_purchase_image'
      ]
    }],
    reasoning: String,
    analyzedAt: Date,
    needsManualReview: {
      type: Boolean,
      default: false
    },
    // Gemini-specific analysis fields
    sentimentScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    authenticityScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    productRelevanceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    purchaseVerificationScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    // NEW: Nested scores object for enhanced analysis
    scores: {
      sentimentScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      authenticityScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      productRelevanceScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      purchaseVerificationScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      overallRiskScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      }
    },
    // Enhanced analysis fields
    detailedAnalysis: {
      purchaseVerificationAnalysis: String,
      productRelevanceAnalysis: String,
      authenticityAssessment: String,
      linguisticAnalysis: String,
      suspiciousPatterns: String,
      timelineAnalysis: String,
      specificConcerns: String
    },
    // Image Analysis Fields
    imageAnalysis: {
      hasImages: {
        type: Boolean,
        default: false
      },
      imageCount: {
        type: Number,
        default: 0
      },
      productMatch: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      imageQuality: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      authenticity: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      sentimentMatch: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      analysis: String,
      flags: [String]
    },
    recommendations: {
      action: {
        type: String,
        enum: ['approve', 'reject', 'manual_review']
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      explanation: String
    },
    keyInsights: [String],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    modelVersion: String
  },
  // NEW: AI Agent Approval System
  agentApproval: {
    agentDecision: {
      type: String,
      enum: ['approve', 'reject', 'manual_review'],
      default: 'manual_review'
    },
    displayIndicator: {
      type: String,
      enum: ['green', 'yellow', 'red'],
      default: 'yellow'
    },
    userDisplayStatus: {
      type: String,
      enum: ['Verified Genuine', 'Under Review', 'Flagged Suspicious', 'Needs Attention'],
      default: 'Under Review'
    },
    agentConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    agentReasoning: String,
    processedAt: {
      type: Date,
      default: Date.now
    },
    agentModelVersion: {
      type: String,
      default: 'gemini-2.0-flash-agent'
    },
    adminNotes: String,
    isAutomatedDecision: {
      type: Boolean,
      default: true
    }
  },
  // Review Status
  status: {
    type: String,
    enum: ['published', 'flagged', 'hidden', 'under_review'],
    default: 'published'
  },
  // Admin moderation
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Production-ready index to prevent duplicate reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Pre-save hook to sync old and new score formats for data consistency
reviewSchema.pre('save', function() {
  // If new scores format exists, sync to old format for backwards compatibility
  if (this.aiAnalysis && this.aiAnalysis.scores) {
    this.aiAnalysis.sentimentScore = this.aiAnalysis.scores.sentimentScore;
    this.aiAnalysis.authenticityScore = this.aiAnalysis.scores.authenticityScore;
    this.aiAnalysis.productRelevanceScore = this.aiAnalysis.scores.productRelevanceScore;
    this.aiAnalysis.purchaseVerificationScore = this.aiAnalysis.scores.purchaseVerificationScore;
  }
  // If old format exists but new doesn't, sync to new format
  else if (this.aiAnalysis && !this.aiAnalysis.scores) {
    this.aiAnalysis.scores = {
      sentimentScore: this.aiAnalysis.sentimentScore || 0.5,
      authenticityScore: this.aiAnalysis.authenticityScore || 0.5,
      productRelevanceScore: this.aiAnalysis.productRelevanceScore || 0.5,
      purchaseVerificationScore: this.aiAnalysis.purchaseVerificationScore || 0.5,
      overallRiskScore: 0.5
    };
  }
});

// TEMPORARILY DISABLED FOR ML TESTING
// Remove this comment and uncomment below line when ready for production
// reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: result[0]?.averageRating || 0,
      numReviews: result[0]?.numReviews || 0
    });
  } catch (error) {
    console.error('Error updating product ratings:', error);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating after remove
reviewSchema.post('remove', async function() {
  await this.constructor.calculateAverageRating(this.product);
});

// Clear any existing model to ensure fresh schema compilation
if (mongoose.connection.models.Review) {
  delete mongoose.connection.models.Review;
}

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;