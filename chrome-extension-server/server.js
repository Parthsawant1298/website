// server.js - Chrome Extension Backend (Standalone)
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001; // Different port to avoid conflict with Next.js

// ✅ FIXED CORS - Allow Amazon.com requests
app.use(cors({
  origin: [
    'https://www.amazon.com',
    'https://amazon.com', 
    'https://m.amazon.com',
    'https://www.amazon.com/dp/B09B8V1LZ3', // Your specific product page
    'http://localhost:3000', // Keep your Next.js port
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'chrome-extension://*' // Allow Chrome extension requests
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

// Chrome Extension Analysis Endpoint
app.post('/api/amazon-analysis', async (req, res) => {
  // Add CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  const startTime = Date.now();
  
  try {
    console.log('🔍 Chrome Extension: Starting Amazon analysis...');
    
    const { reviews, productInfo } = req.body;
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        error: 'No reviews provided for analysis'
      });
    }
    
    console.log(`📊 Analyzing ${reviews.length} reviews for: ${productInfo.title.substring(0, 50)}...`);
    console.log('📝 Review content preview:', reviews[0]?.text?.substring(0, 100) + '...');
    
    // ✅ WORKING TEST RESPONSE - Your Chrome extension will display this
    const analysisResponse = {
      totalReviews: reviews.length,
      genuineReviews: Math.floor(reviews.length * 0.3), // 30% genuine
      suspiciousReviews: Math.ceil(reviews.length * 0.7), // 70% suspicious
      errorReviews: 0,
      overallTrustScore: 35, // Low trust score for demo
      recommendationSafety: '🚨 High Risk - Many Suspicious Reviews Detected!',
      analysis: reviews.map((review, index) => ({
        classification: Math.random() > 0.3 ? 'suspicious' : 'genuine',
        confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        displayIndicator: Math.random() > 0.3 ? 'red' : 'green',
        trustScore: Math.floor(Math.random() * 40) + 20, // 20-60% trust
        userDisplayStatus: Math.random() > 0.3 ? 'Flagged Suspicious' : 'Appears Genuine',
        originalReview: review,
        analysisReasons: [
          Math.random() > 0.5 ? 'Generic language patterns' : 'Unusual posting frequency',
          Math.random() > 0.5 ? 'Similar to other reviews' : 'Unverified purchase'
        ]
      })),
      processingStats: {
        successCount: reviews.length,
        errorCount: 0,
        totalProcessed: reviews.length,
        originalReviewCount: reviews.length,
        limitApplied: false
      },
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        serverVersion: '1.0.0',
        processingTimeMs: Date.now() - startTime
      }
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ Chrome Extension analysis completed in ${duration}ms`);
    console.log(`📊 Results: ${analysisResponse.genuineReviews} genuine, ${analysisResponse.suspiciousReviews} suspicious`);
    
    res.json(analysisResponse);
    
  } catch (error) {
    console.error('❌ Chrome Extension analysis error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: Date.now(),
      serverInfo: 'Chrome Extension Backend v1.0'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chrome Extension AI Review Analyzer Backend',
    cors: 'Configured for Amazon.com + Chrome Extensions',
    port: port,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Chrome Extension AI Review Analyzer',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      analysis: '/api/amazon-analysis',
      health: '/health'
    },
    documentation: 'This server handles AI review analysis for the Chrome extension'
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 Chrome Extension AI Review Analyzer Backend');
  console.log(`📡 Server running on: http://localhost:${port}`);
  console.log(`✅ CORS configured for Amazon.com + Chrome Extensions`);
  console.log(`📊 API endpoint: http://localhost:${port}/api/amazon-analysis`);
  console.log(`🔍 Health check: http://localhost:${port}/health`);
  console.log(`📝 Service info: http://localhost:${port}/`);
  console.log('\n🎯 Ready to receive Chrome extension requests!');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Chrome Extension backend server...');
  process.exit(0);
});
