// background.js - AI Review Analyzer Service Worker

console.log('🚀 AI Review Analyzer background script loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      maxReviews: 20,
      autoAnalyze: false,
      apiEndpoint: 'http://localhost:3000/api/amazon-analysis'
    });
  }
});

// Message handling from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request.action);
  
  switch (request.action) {
    case 'getSettings':
      chrome.storage.sync.get(['enabled', 'maxReviews', 'autoAnalyze', 'apiEndpoint'])
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep message channel open
      
    case 'updateSettings':
      chrome.storage.sync.set(request.settings)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'showNotification':
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: request.title || 'AI Review Analyzer',
        message: request.message || 'Analysis complete!'
      }).then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Notification error:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    default:
      sendResponse({ error: 'Unknown action: ' + request.action });
  }
});

// Tab update listener for badge
if (chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const isAmazonProduct = tab.url.includes('amazon.') && tab.url.includes('/dp/');
      
      if (isAmazonProduct) {
        chrome.action.setBadgeText({
          tabId: tabId,
          text: 'AI'
        });
        chrome.action.setBadgeBackgroundColor({
          tabId: tabId,
          color: '#4F46E5'
        });
      } else {
        chrome.action.setBadgeText({
          tabId: tabId,
          text: ''
        });
      }
    }
  });
}

console.log('✅ Background script initialized successfully');
