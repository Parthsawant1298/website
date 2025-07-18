import { NextResponse } from 'next/server';

// Single Google Custom Search API configuration
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Track API key usage
let apiKeyStats = {
  used: 0,
  lastReset: Date.now(),
  failed: false
};

// Reset daily counters (Google allows 100 searches per day per key)
function resetDailyCounters() {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (now - apiKeyStats.lastReset > oneDayMs) {
    apiKeyStats.used = 0;
    apiKeyStats.lastReset = now;
    apiKeyStats.failed = false;
    console.log(`🔄 Reset daily counter for API key`);
  }
}

// Get available API key
function getAvailableApiKey() {
  resetDailyCounters();
  
  // Check if API key is available
  if (!apiKeyStats.failed && apiKeyStats.used < 95) { // Keep 5 searches buffer
    return { key: GOOGLE_API_KEY };
  }
  
  return null; // No API key available
}

// Mark API key as failed/exhausted
function markApiKeyFailed(reason = 'quota_exceeded') {
  apiKeyStats.failed = true;
  console.log(`❌ API key marked as failed: ${reason}`);
}

// Core web search function
async function searchWeb(query, maxResults = 10) {
  console.log('🔍 Starting web search for review content:', query.substring(0, 100) + '...');
  
  if (!GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error('Google Search Engine ID not configured');
  }

  if (!GOOGLE_API_KEY) {
    throw new Error('Google Search API key not configured');
  }

  const availableKey = getAvailableApiKey();
  if (!availableKey) {
    throw new Error('Google Search API key is exhausted or failed');
  }

  const { key } = availableKey;
  console.log(`🔑 Using API key, usage: ${apiKeyStats.used}/100`);

  try {
    // Clean and prepare search query
    const cleanQuery = query
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .substring(0, 200); // Limit query length

    if (cleanQuery.length < 10) {
      throw new Error('Search query too short after cleaning');
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent('"' + cleanQuery + '"')}&num=${maxResults}`;
    
    console.log('🌐 Making Google Search API request...');
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ReviewAnalysisService/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429 || response.status === 403) {
        // Quota exceeded or forbidden
        markApiKeyFailed(`HTTP ${response.status}`);
        apiKeyStats.used = 100; // Mark as exhausted
        
        throw new Error(`API key exhausted: ${response.status} - ${errorText}`);
      }
      
      throw new Error(`Search API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Increment usage counter
    apiKeyStats.used++;
    
    // Check if we're getting close to limit
    if (apiKeyStats.used >= 95) {
      console.log(`⚠️ API key approaching daily limit (${apiKeyStats.used}/100)`);
    }

    if (!data.items || data.items.length === 0) {
      return {
        found: false,
        matches: [],
        totalResults: 0,
        searchInfo: {
          query: cleanQuery,
          totalUsage: apiKeyStats.used
        }
      };
    }

    // Process search results
    const matches = data.items.map(item => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink || '',
      similarity: calculateTextSimilarity(cleanQuery, item.snippet || item.title || '')
    })).filter(match => match.similarity > 0.7); // Only high similarity matches

    const found = matches.length > 0;
    
    console.log(`✅ Search completed - Found ${matches.length} potential matches`);
    
    return {
      found,
      matches: matches.slice(0, 5), // Limit to top 5 matches
      totalResults: data.searchInformation?.totalResults || 0,
      searchInfo: {
        query: cleanQuery,
        totalUsage: apiKeyStats.used,
        searchTime: data.searchInformation?.searchTime || 0
      }
    };

  } catch (error) {
    console.error(`❌ Web search failed:`, error.message);
    
    // If this key failed, mark it as failed
    if (!error.message.includes('API key exhausted')) {
      markApiKeyFailed(error.message);
    }
    
    throw error;
  }
}

// Calculate text similarity (simple implementation)
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = (commonWords.length * 2) / (words1.length + words2.length);
  
  return similarity;
}

// Enhanced similarity check for review content
function analyzeReviewSimilarity(reviewText, searchResults) {
  if (!searchResults.found || searchResults.matches.length === 0) {
    return {
      isCopied: false,
      confidence: 0,
      sources: [],
      analysis: 'No similar content found on the web'
    };
  }

  let highestSimilarity = 0;
  let bestMatch = null;
  const allSources = [];

  searchResults.matches.forEach(match => {
    // Calculate detailed similarity
    const titleSimilarity = calculateTextSimilarity(reviewText, match.title);
    const snippetSimilarity = calculateTextSimilarity(reviewText, match.snippet);
    const overallSimilarity = Math.max(titleSimilarity, snippetSimilarity);

    if (overallSimilarity > highestSimilarity) {
      highestSimilarity = overallSimilarity;
      bestMatch = match;
    }

    if (overallSimilarity > 0.7) {
      allSources.push({
        url: match.url,
        domain: match.displayLink,
        similarity: overallSimilarity,
        matchType: titleSimilarity > snippetSimilarity ? 'title' : 'content'
      });
    }
  });

  const isCopied = highestSimilarity > 0.8; // High threshold for copied content
  const confidence = highestSimilarity;

  let analysis = '';
  if (isCopied && bestMatch) {
    analysis = `POTENTIAL COPIED CONTENT: High similarity (${(confidence * 100).toFixed(1)}%) found with content from ${bestMatch.displayLink}. Review text appears to be copied or very similar to existing web content.`;
  } else if (highestSimilarity > 0.6) {
    analysis = `SIMILAR CONTENT DETECTED: Moderate similarity (${(confidence * 100).toFixed(1)}%) found with web content. May be partially copied or inspired by existing reviews.`;
  } else {
    analysis = 'ORIGINAL CONTENT: No significant similarity found with existing web content. Review appears to be original.';
  }

  return {
    isCopied,
    confidence,
    sources: allSources,
    analysis,
    bestMatch: bestMatch ? {
      url: bestMatch.url,
      domain: bestMatch.displayLink,
      similarity: confidence
    } : null
  };
}

// API Route Handler
export async function POST(request) {
  try {
    const { reviewText, productName } = await request.json();

    if (!reviewText || reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review text is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    console.log('🔍 Web search request for review:', reviewText.substring(0, 50) + '...');

    // Perform web search
    const searchResults = await searchWeb(reviewText, 10);
    
    // Analyze similarity
    const similarityAnalysis = analyzeReviewSimilarity(reviewText, searchResults);

    const response = {
      success: true,
      webSearch: {
        query: reviewText.substring(0, 100) + '...',
        found: searchResults.found,
        totalResults: searchResults.totalResults,
        matches: searchResults.matches.length,
        isCopied: similarityAnalysis.isCopied,
        confidence: similarityAnalysis.confidence,
        analysis: similarityAnalysis.analysis,
        sources: similarityAnalysis.sources,
        bestMatch: similarityAnalysis.bestMatch,
        searchInfo: searchResults.searchInfo
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Web search analysis completed:', {
      found: searchResults.found,
      isCopied: similarityAnalysis.isCopied,
      confidence: similarityAnalysis.confidence
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Web search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      webSearch: {
        found: false,
        isCopied: false,
        confidence: 0,
        analysis: `Web search failed: ${error.message}`,
        sources: [],
        searchInfo: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }, { status: 500 });
  }
}

// GET endpoint for API status
export async function GET() {
  resetDailyCounters();
  
  return NextResponse.json({
    status: 'active',
    apiKey: {
      available: !apiKeyStats.failed && apiKeyStats.used < 95,
      usage: `${apiKeyStats.used}/100`,
      lastReset: new Date(apiKeyStats.lastReset).toISOString()
    },
    totalAvailableSearches: apiKeyStats.failed ? 0 : 100 - apiKeyStats.used
  });
}
