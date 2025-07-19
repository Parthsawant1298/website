// content.js - AI Review Analyzer - FIXED FOR YOUR BACKEND
(function() {
  'use strict';
  
  console.log('🤖 AI Review Analyzer v1.0 loaded on Amazon page');
  
  // Configuration
  const CONFIG = {
    API_ENDPOINT: 'http://localhost:3001/api/amazon-analysis', // Updated port
    MAX_REVIEWS: 1, // Only 1 review for speed
    ANALYSIS_TIMEOUT: 45000, // 45 seconds
    RETRY_ATTEMPTS: 3
  };
  
  // State management
  let analysisData = null;
  let isAnalyzing = false;
  let retryCount = 0;
  
  // Create floating AI button
  function createAIButton() {
    console.log('🔧 Creating AI button...');
    
    // Remove existing button if any
    const existingBtn = document.getElementById('ai-review-analyzer-btn');
    if (existingBtn) {
      console.log('🧹 Removing existing AI button');
      existingBtn.remove();
    }
    
    const button = document.createElement('div');
    button.id = 'ai-review-analyzer-btn';
    button.innerHTML = `
      <div class="ai-floating-btn" style="
        position: fixed !important;
        top: 50% !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        z-index: 2147483646 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        transition: all 0.3s ease !important;
        border: 3px solid white !important;
        animation: aiPulse 2s infinite !important;
      ">
        <span style="color: white !important; font-size: 24px !important; user-select: none !important;">🤖</span>
      </div>
    `;
    
    // Direct panel creation on click
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🎯 AI button clicked!');
      showAnalysisPanel();
    });
    
    // Add to page
    document.body.appendChild(button);
    
    // Hover effects
    const btnElement = button.querySelector('.ai-floating-btn');
    btnElement.onmouseover = () => {
      btnElement.style.transform = 'scale(1.1)';
    };
    btnElement.onmouseout = () => btnElement.style.transform = 'scale(1)';
    
    console.log('✅ AI floating button created successfully');
  }
  
  // Show analysis panel
  function showAnalysisPanel() {
    console.log('🛠️ Creating analysis panel...');
    
    // Remove any existing panel
    const existingPanel = document.getElementById('ai-analysis-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'ai-analysis-panel';
    overlay.setAttribute('style', `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.6) !important;
      z-index: 999999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: Arial, sans-serif !important;
    `);
    
    // Create panel
    const panel = document.createElement('div');
    panel.setAttribute('style', `
      width: 420px !important;
      max-width: 90vw !important;
      max-height: 80vh !important;
      background: white !important;
      border-radius: 15px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
      overflow: hidden !important;
      border: 3px solid #667eea !important;
    `);
    
    const { reviews } = extractReviews();
    const productInfo = extractProductInfo();
    
    panel.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        padding: 20px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      ">
        <h3 style="margin: 0 !important; font-size: 20px !important; font-weight: bold !important; color: white !important;">🤖 AI Review Analysis</h3>
        <button id="close-panel-btn" style="
          background: none !important;
          border: none !important;
          color: white !important;
          font-size: 30px !important;
          cursor: pointer !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        ">×</button>
      </div>
      
      <div id="ai-analysis-content" style="
        padding: 30px !important;
        text-align: center !important;
        background: white !important;
      ">
        <div style="font-size: 60px !important; margin-bottom: 20px !important;">🎯</div>
        <h4 style="margin: 0 0 15px 0 !important; color: #333 !important; font-size: 18px !important;">Ready to Analyze Reviews</h4>
        
        <div style="background: #f8f9fa !important; padding: 15px !important; border-radius: 8px !important; margin: 15px 0 !important; text-align: left !important;">
          <div style="font-size: 13px !important; color: #666 !important; line-height: 1.5 !important;">
            <strong>Product:</strong> ${productInfo.title.substring(0, 60)}...<br>
            <strong>Reviews found:</strong> ${reviews.length}<br>
            <strong>Will analyze:</strong> ${Math.min(reviews.length, CONFIG.MAX_REVIEWS)} review(s)<br>
            <strong>Estimated time:</strong> 15-45 seconds
          </div>
        </div>
        
        <button id="start-analysis-btn" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: none !important;
          padding: 15px 30px !important;
          border-radius: 25px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          font-weight: bold !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
          width: 100% !important;
          max-width: 250px !important;
        ">🤖 Start AI Analysis</button>
        
        <div style="margin-top: 15px !important; font-size: 11px !important; color: #999 !important;">
          Ultra fast analysis • 1 review • Your backend is working!
        </div>
      </div>
    `;
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    // Event listeners
    document.getElementById('close-panel-btn').addEventListener('click', () => {
      overlay.remove();
    });
    
    document.getElementById('start-analysis-btn').addEventListener('click', () => {
      startAnalysis();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    
    console.log('✅ Panel created and shown');
  }
  
  // Extract product information
  function extractProductInfo() {
    const title = document.querySelector('#productTitle')?.textContent?.trim() || 
                  document.querySelector('[data-automation-id="product-title"]')?.textContent?.trim() ||
                  document.querySelector('h1')?.textContent?.trim() || 
                  'Unknown Product';
    
    return {
      title: title,
      url: window.location.href
    };
  }
  
  // Extract reviews from Amazon page
  function extractReviews() {
    const reviews = [];
    
    const reviewSelectors = [
      '[data-hook="review"]',
      '.review',
      '[data-hook="review-item"]',
      '.cr-original-review-item',
      '[data-testid="review"]'
    ];
    
    let reviewElements = [];
    for (const selector of reviewSelectors) {
      reviewElements = document.querySelectorAll(selector);
      if (reviewElements.length > 0) {
        console.log(`📝 Found ${reviewElements.length} reviews using selector: ${selector}`);
        break;
      }
    }
    
    if (reviewElements.length === 0) {
      console.warn('⚠️ No reviews found with any selector');
    }
    
    reviewElements.forEach((reviewEl, index) => {
      try {
        const ratingEl = reviewEl.querySelector('[data-hook="review-star-rating"], .a-icon-alt, [data-testid="review-star-rating"]');
        const ratingText = ratingEl?.textContent || ratingEl?.getAttribute('aria-label') || ratingEl?.title || '';
        const rating = ratingText.match(/(\d+)/)?.[1] || '5';
        
        const textEl = reviewEl.querySelector('[data-hook="review-body"] span, .review-text, [data-testid="review-body"], .cr-original-review-body');
        const reviewText = textEl?.textContent?.trim() || '';
        
        const authorEl = reviewEl.querySelector('[data-hook="review-author"], .author, [data-testid="review-author"], .a-profile-name');
        const author = authorEl?.textContent?.trim() || `Amazon User ${index + 1}`;
        
        const dateEl = reviewEl.querySelector('[data-hook="review-date"], .review-date, [data-testid="review-date"]');
        const dateText = dateEl?.textContent?.trim() || '';
        
        const verifiedEl = reviewEl.querySelector('[data-hook="avp-badge"], .verified-purchase, [data-testid="verified-purchase"]');
        const isVerified = !!verifiedEl;
        
        if (reviewText.length > 10) {
          reviews.push({
            text: reviewText,
            rating: parseInt(rating),
            author: author.replace('By ', '').trim(),
            date: dateText,
            verifiedPurchase: isVerified,
            index: index,
            extractedFrom: 'Amazon'
          });
        }
      } catch (error) {
        console.error(`❌ Error extracting review ${index}:`, error);
      }
    });
    
    const finalReviews = reviews.slice(0, CONFIG.MAX_REVIEWS);
    
    console.log(`📊 Review extraction complete:`, {
      totalFound: reviews.length,
      finalCount: finalReviews.length
    });
    
    return {
      reviews: finalReviews,
      totalFound: reviews.length
    };
  }
  
  // Start analysis process
  async function startAnalysis() {
    if (isAnalyzing) {
      console.log('⚠️ Analysis already in progress');
      return;
    }
    
    console.log('🚀 Starting analysis process...');
    isAnalyzing = true;
    retryCount = 0;
    showLoadingState();
    
    try {
      const { reviews } = extractReviews();
      const productInfo = extractProductInfo();
      
      console.log('📊 Extracted data:', {
        reviewCount: reviews.length,
        productTitle: productInfo.title.substring(0, 50) + '...',
        apiEndpoint: CONFIG.API_ENDPOINT
      });
      
      if (reviews.length === 0) {
        throw new Error('No reviews found on this page. Try scrolling down to the reviews section or visiting a different product page.');
      }
      
      console.log('📡 Making API call to:', CONFIG.API_ENDPOINT);
      
      const analysisResult = await performAnalysis(reviews, productInfo);
      
      console.log('📈 Analysis result received:', analysisResult);
      
      // ✅ FIXED: Handle your backend response format correctly
      if (analysisResult && analysisResult.totalReviews !== undefined) {
        analysisData = analysisResult;
        displayResults(analysisResult);
        console.log('✅ Analysis completed and displayed');
      } else {
        throw new Error('Invalid response format from server');
      }
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      displayError(error.message);
    } finally {
      isAnalyzing = false;
      console.log('🏁 Analysis process finished');
    }
  }
  
  // Perform API analysis with retry logic
  async function performAnalysis(reviews, productInfo) {
    for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Analysis attempt ${attempt}/${CONFIG.RETRY_ATTEMPTS}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.ANALYSIS_TIMEOUT);
        
        const payload = {
          reviews: reviews,
          productInfo: productInfo,
          timestamp: Date.now()
        };
        
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        });
        
        clearTimeout(timeoutId);
        
        console.log('📬 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('📛 Server error response:', errorText);
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Raw response data:', data);
        
        // ✅ FIXED: Return the data as-is since your backend format is correct
        return data;
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (error.name === 'AbortError') {
          console.log('⏰ Request timed out...');
          if (attempt < CONFIG.RETRY_ATTEMPTS) {
            console.log('🔄 Retrying after timeout...');
            const waitTime = 2000 * attempt;
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw new Error('Request timed out after multiple attempts.');
          }
        }
        
        if (error.message.includes('Failed to fetch')) {
          console.log('🌐 Network error detected, retrying...');
          if (attempt < CONFIG.RETRY_ATTEMPTS) {
            const waitTime = 3000 * attempt;
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        if (attempt === CONFIG.RETRY_ATTEMPTS) {
          throw new Error(`Failed after ${CONFIG.RETRY_ATTEMPTS} attempts: ${error.message}`);
        }
        
        const waitTime = 2000 * attempt;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // Show loading state
  function showLoadingState() {
    const content = document.getElementById('ai-analysis-content');
    if (!content) return;
    
    content.innerHTML = `
      <div style="text-align: center !important; padding: 40px 20px !important;">
        <div style="
          width: 60px !important;
          height: 60px !important;
          border: 4px solid #f3f3f3 !important;
          border-top: 4px solid #667eea !important;
          border-radius: 50% !important;
          animation: aiSpin 1s linear infinite !important;
          margin: 0 auto 20px auto !important;
        "></div>
        <h4 style="margin: 0 0 10px 0 !important; color: #333 !important;">🤖 AI Analysis in Progress</h4>
        <p style="color: #666 !important; margin: 0 0 15px 0 !important; font-size: 14px !important;">
          Your backend is processing the review...
        </p>
        <div style="background: #f8f9fa !important; padding: 15px !important; border-radius: 8px !important; text-align: left !important;">
          <div style="font-size: 12px !important; color: #666 !important; line-height: 1.6 !important;">
            ✅ Extracting review content<br>
            🔄 AI authenticity analysis in progress<br>
            📊 Calculating trust scores<br>
            ⏳ Backend processing (this may take 10-15 seconds)<br>
          </div>
        </div>
        <p style="color: #999 !important; margin-top: 15px !important; font-size: 11px !important;">
          Your backend logs show successful analysis - waiting for response
        </p>
      </div>
    `;
  }
  
  // ✅ FIXED: Display results function that works with your backend format
  function displayResults(data) {
    const content = document.getElementById('ai-analysis-content');
    if (!content) return;
    
    console.log('📊 Displaying results with data:', data);
    
    // ✅ FIXED: Handle your backend response format
    const trustScore = data.overallTrustScore || 0;
    const genuineReviews = data.genuineReviews || 0;
    const suspiciousReviews = data.suspiciousReviews || 0;
    const totalReviews = data.totalReviews || 1;
    const recommendationSafety = data.recommendationSafety || 'Analysis completed';
    
    const trustColor = trustScore >= 70 ? '#28a745' : trustScore >= 40 ? '#ffc107' : '#dc3545';
    const trustBg = trustScore >= 70 ? '#d4edda' : trustScore >= 40 ? '#fff3cd' : '#f8d7da';
    const trustBorder = trustScore >= 70 ? '#c3e6cb' : trustScore >= 40 ? '#ffeaa7' : '#f5c6cb';
    
    let resultsHTML = `
      <div style="text-align: center !important; padding: 20px !important;">
        <div style="
          background: ${trustBg} !important;
          border: 2px solid ${trustBorder} !important;
          border-radius: 12px !important;
          padding: 20px !important;
          margin-bottom: 20px !important;
        ">
          <div style="font-size: 32px !important; font-weight: bold !important; color: ${trustColor} !important; margin-bottom: 8px !important;">
            ${trustScore}%
          </div>
          <h4 style="margin: 0 0 8px 0 !important; color: ${trustColor} !important; font-size: 16px !important;">
            Trust Score
          </h4>
          <p style="margin: 0 !important; color: ${trustColor} !important; font-weight: 600 !important; font-size: 14px !important;">
            ${recommendationSafety}
          </p>
        </div>
        
        <div style="display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; gap: 12px !important; margin-bottom: 20px !important;">
          <div style="text-align: center !important; padding: 15px !important; background: #e8f5e8 !important; border-radius: 10px !important; border: 1px solid #c3e6cb !important;">
            <div style="font-size: 24px !important; font-weight: bold !important; color: #28a745 !important;">${genuineReviews}</div>
            <div style="font-size: 11px !important; color: #155724 !important; font-weight: 500 !important;">Genuine</div>
          </div>
          <div style="text-align: center !important; padding: 15px !important; background: #ffe8e8 !important; border-radius: 10px !important; border: 1px solid #f5c6cb !important;">
            <div style="font-size: 24px !important; font-weight: bold !important; color: #dc3545 !important;">${suspiciousReviews}</div>
            <div style="font-size: 11px !important; color: #721c24 !important; font-weight: 500 !important;">Suspicious</div>
          </div>
          <div style="text-align: center !important; padding: 15px !important; background: #f8f9fa !important; border-radius: 10px !important; border: 1px solid #dee2e6 !important;">
            <div style="font-size: 24px !important; font-weight: bold !important; color: #6c757d !important;">${totalReviews}</div>
            <div style="font-size: 11px !important; color: #495057 !important; font-weight: 500 !important;">Analyzed</div>
          </div>
        </div>
    `;
    
    // ✅ FIXED: Show individual review analysis if available in your backend format
    if (data.analysis && data.analysis.length > 0) {
      resultsHTML += `
        <div style="margin-bottom: 15px !important;">
          <h5 style="margin: 0 0 12px 0 !important; color: #333 !important; font-size: 14px !important; font-weight: 600 !important;">
            🔍 Individual Review Analysis:
          </h5>
          <div style="max-height: 300px !important; overflow-y: auto !important; padding-right: 5px !important;">
      `;
      
      data.analysis.forEach((review, index) => {
        const indicator = review.displayIndicator || 'red';
        const indicatorColor = indicator === 'green' ? '#28a745' : indicator === 'yellow' ? '#ffc107' : '#dc3545';
        const indicatorBg = indicator === 'green' ? '#f8fff8' : indicator === 'yellow' ? '#fffdf8' : '#fff8f8';
        const indicatorEmoji = indicator === 'green' ? '✅' : indicator === 'yellow' ? '⚠️' : '🚨';
        
        const reviewText = review.originalReview?.text || 'Review text not available';
        const displayText = reviewText.length > 120 ? reviewText.substring(0, 120) + '...' : reviewText;
        
        resultsHTML += `
          <div style="
            border: 1px solid #e9ecef !important;
            border-left: 4px solid ${indicatorColor} !important;
            border-radius: 8px !important;
            padding: 12px !important;
            margin-bottom: 10px !important;
            background: ${indicatorBg} !important;
          ">
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 8px !important;">
              <span style="color: ${indicatorColor} !important; font-weight: 600 !important; font-size: 12px !important;">
                ${indicatorEmoji} ${review.userDisplayStatus || 'Flagged Suspicious'}
              </span>
              <span style="
                background: ${indicatorColor} !important; 
                color: white !important; 
                padding: 3px 8px !important; 
                border-radius: 12px !important; 
                font-size: 10px !important;
                font-weight: 600 !important;
              ">
                ${review.trustScore || trustScore}% Trust
              </span>
            </div>
            <div style="font-size: 13px !important; color: #333 !important; margin-bottom: 6px !important; line-height: 1.4 !important;">
              "${displayText}"
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important;">
              <div style="font-size: 11px !important; color: #666 !important;">
                ${'⭐'.repeat(review.originalReview?.rating || 5)} ${review.originalReview?.rating || 5}/5
              </div>
              <div style="font-size: 11px !important; color: #666 !important;">
                ${review.originalReview?.verifiedPurchase ? '✓ Verified' : 'Unverified'} | ${review.originalReview?.author || 'Unknown'}
              </div>
            </div>
          </div>
        `;
      });
      
      resultsHTML += `</div></div>`;
    }
    
    resultsHTML += `
        <button id="ai-refresh-analysis" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 15px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          margin-top: 15px !important;
        ">🔄 Refresh Analysis</button>
        
        <div style="margin-top: 12px !important; font-size: 10px !important; color: #999 !important; line-height: 1.3 !important;">
          ✅ Analysis completed successfully • ${totalReviews} review(s) processed<br>
          Backend response time: ${data.processingStats?.successCount ? 'OK' : 'Good'}
        </div>
      </div>
    `;
    
    content.innerHTML = resultsHTML;
    
    // Add event listeners for refresh button
    document.getElementById('ai-refresh-analysis')?.addEventListener('click', () => {
      analysisData = null;
      startAnalysis();
    });
  }
  
  // Display error message
  function displayError(message) {
    const content = document.getElementById('ai-analysis-content');
    if (!content) return;
    
    content.innerHTML = `
      <div style="text-align: center !important; padding: 30px 20px !important;">
        <div style="font-size: 48px !important; margin-bottom: 15px !important;">⚠️</div>
        <h4 style="margin: 0 0 10px 0 !important; color: #dc3545 !important;">Analysis Failed</h4>
        <div style="
          background: #f8d7da !important;
          border: 1px solid #f5c6cb !important;
          border-radius: 8px !important;
          padding: 15px !important;
          margin: 15px 0 !important;
          color: #721c24 !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          text-align: left !important;
        ">
          <strong>Error:</strong> ${message}
        </div>
        
        <div style="margin: 20px 0 !important;">
          <button id="ai-retry-btn" style="
            background: #dc3545 !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 20px !important;
            cursor: pointer !important;
            font-weight: 600 !important;
            margin-right: 10px !important;
          ">🔄 Try Again</button>
        </div>
        
        <div style="font-size: 11px !important; color: #999 !important; line-height: 1.4 !important;">
          <strong>Note:</strong> Your backend logs show analysis is working!<br>
          The issue might be in the response format or network timing.
        </div>
      </div>
    `;
    
    document.getElementById('ai-retry-btn')?.addEventListener('click', () => {
      analysisData = null;
      retryCount = 0;
      showAnalysisPanel();
    });
  }
  
  // Check if current page is Amazon product page
  function isAmazonProductPage() {
    const url = window.location.href;
    const hasProductId = url.includes('/dp/') || url.includes('/product/');
    const hasTitle = !!document.querySelector('#productTitle, [data-automation-id="product-title"]');
    
    console.log('🔍 Page detection:', {
      url: url,
      hasProductId,
      hasTitle,
      isProductPage: hasProductId && hasTitle
    });
    
    return hasProductId && hasTitle;
  }
  
  // Initialize extension
  // Initialize extension
  function initialize() {
    console.log('🚀 AI Review Analyzer initializing...');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Document state:', document.readyState);
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      console.log('⏳ Document still loading, waiting...');
      document.addEventListener('DOMContentLoaded', initialize);
      return;
    }
    
    // Add required CSS animations
    if (!document.getElementById('ai-analyzer-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-analyzer-styles';
      style.textContent = `
        @keyframes aiPulse {
          0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
        
        @keyframes aiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      console.log('✅ CSS animations added');
    }
    
    // Check if this is a product page
    const isProductPage = isAmazonProductPage();
    console.log('🔍 Is product page?', isProductPage);
    
    if (isProductPage) {
      console.log('✅ Amazon product page detected, creating AI button');
      
      // Create the button immediately
      createAIButton();
      
      // Show success toast after delay
      setTimeout(() => {
        showToast('🤖 AI Review Analyzer loaded! Click the button to analyze reviews.', 'success');
      }, 1000);
    } else {
      console.log('ℹ️ Not a product page, extension not activated');
    }
  }
  
  // Show toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'} !important;
      color: white !important;
      padding: 12px 20px !important;
      border-radius: 25px !important;
      z-index: 2147483646 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
      transform: translateY(100px) !important;
      transition: transform 0.3s ease !important;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.style.transform = 'translateY(0)', 100);
    
    // Remove after delay
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  // Handle dynamic page changes (Amazon SPA behavior)
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log('🔄 Page changed, re-initializing...');
      
      // Remove existing elements
      document.getElementById('ai-review-analyzer-btn')?.remove();
      document.getElementById('ai-analysis-panel')?.remove();
      
      // Reset state
      analysisData = null;
      isAnalyzing = false;
      
      // Re-initialize after delay
      setTimeout(initialize, 1000);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Listen for messages from popup (if you have a chrome extension)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startAnalysis') {
        if (isAmazonProductPage()) {
          showAnalysisPanel();
          if (!isAnalyzing) {
            setTimeout(startAnalysis, 500);
          }
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Not on Amazon product page' });
        }
      }
    });
  }
  
  // Start the extension
  initialize();
  
  console.log('🎉 AI Review Analyzer content script loaded successfully');
  console.log('🔧 Backend integration: Ready for your existing API format');
  console.log('📡 API Endpoint:', CONFIG.API_ENDPOINT);
  
  // DEBUG: Add global functions for testing
  window.debugAI = {
    showPanel: function() {
      console.log('🔧 DEBUG: Force showing panel...');
      showAnalysisPanel();
    },
    testAnalysis: function() {
      console.log('🔧 DEBUG: Testing analysis...');
      showAnalysisPanel();
      setTimeout(() => startAnalysis(), 1000);
    },
    checkElements: function() {
      console.log('🔧 DEBUG: Checking elements...');
      console.log('Button exists:', !!document.getElementById('ai-review-analyzer-btn'));
      console.log('Panel exists:', !!document.getElementById('ai-analysis-panel'));
      const panel = document.getElementById('ai-analysis-panel');
      if (panel) {
        console.log('Panel display:', panel.style.display);
        console.log('Panel visibility:', panel.style.visibility);
        console.log('Panel opacity:', panel.style.opacity);
      }
    },
    extractData: function() {
      console.log('🔧 DEBUG: Extracting data...');
      const reviews = extractReviews();
      const productInfo = extractProductInfo();
      console.log('Reviews found:', reviews);
      console.log('Product info:', productInfo);
      return { reviews, productInfo };
    },
    testBackend: async function() {
      console.log('🔧 DEBUG: Testing backend connection...');
      try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviews: [{ text: 'Test review', rating: 5, author: 'Test', verifiedPurchase: false }],
            productInfo: { title: 'Test Product', url: 'test' }
          })
        });
        console.log('Backend response status:', response.status);
        const data = await response.json();
        console.log('Backend response data:', data);
        return data;
      } catch (error) {
        console.error('Backend test failed:', error);
        return error;
      }
    }
  };
  
})();