// popup.js - AI Review Analyzer Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎛️ Popup loaded');
  
  // Get DOM elements
  const statusDiv = document.getElementById('status');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const enabledToggle = document.getElementById('enabledToggle');
  const maxReviewsInput = document.getElementById('maxReviews');
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const saveSettingsBtn = document.getElementById('saveSettings');
  
  // Load settings
  await loadSettings();
  
  // Check current tab
  await checkCurrentTab();
  
  // Event listeners
  analyzeBtn.addEventListener('click', startAnalysis);
  settingsBtn.addEventListener('click', toggleSettings);
  enabledToggle.addEventListener('click', toggleEnabled);
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Load settings from storage
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'enabled', 
        'maxReviews', 
        'apiEndpoint'
      ]);
      
      console.log('📥 Loaded settings:', settings);
      
      // Update UI
      enabledToggle.classList.toggle('active', settings.enabled !== false);
      maxReviewsInput.value = settings.maxReviews || 20;
      apiEndpointInput.value = settings.apiEndpoint || 'http://localhost:3000/api/amazon-analysis';
      
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    }
  }
  
  // Check if current tab is Amazon product page
  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url) {
        updateStatus('error', 'Unable to access current tab');
        return;
      }
      
      console.log('🔍 Checking tab:', tab.url);
      
      const isAmazonProduct = (tab.url.includes('amazon.com') || tab.url.includes('amazon.in')) && 
                             tab.url.includes('/dp/');
      
      if (isAmazonProduct) {
        updateStatus('active', 'Amazon Product Page Detected');
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🤖 Analyze Reviews';
      } else if (tab.url.includes('amazon.com') || tab.url.includes('amazon.in')) {
        updateStatus('warning', 'Amazon Site - Visit Product Page');
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Go to Product Page';
      } else {
        updateStatus('inactive', 'Not on Amazon Product Page');
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Visit Amazon Product';
      }
      
    } catch (error) {
      console.error('❌ Failed to check tab:', error);
      updateStatus('error', 'Error checking current page');
    }
  }
  
  // Update status display
  function updateStatus(type, message) {
    statusDiv.className = `status ${type}`;
    
    let emoji;
    switch (type) {
      case 'active':
        emoji = '✅';
        break;
      case 'warning':
        emoji = '⚠️';
        break;
      case 'error':
        emoji = '❌';
        break;
      default:
        emoji = '⚠️';
    }
    
    statusDiv.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 8px;">${emoji}</div>
      <div>${message}</div>
      <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">
        ${type === 'active' ? 'Ready to analyze customer reviews' : 
          type === 'warning' ? 'Navigate to a product with reviews' : 
          'Extension works only on Amazon product pages'}
      </div>
    `;
  }
  
  // Start analysis on current page
  async function startAnalysis() {
    if (analyzeBtn.disabled) return;
    
    try {
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = '🔄 Starting Analysis...';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to start analysis
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'startAnalysis'
      });
      
      if (response && response.success) {
        analyzeBtn.textContent = '✅ Analysis Started';
        setTimeout(() => {
          window.close(); // Close popup after starting
        }, 1000);
      } else {
        throw new Error(response?.error || 'Failed to start analysis');
      }
      
    } catch (error) {
      console.error('❌ Analysis start failed:', error);
      analyzeBtn.textContent = '❌ Failed to Start';
      
      // Try to inject content script if not present
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        analyzeBtn.textContent = '🔄 Extension Loaded - Try Again';
        analyzeBtn.disabled = false;
      } catch (injectionError) {
        analyzeBtn.textContent = '❌ Extension Error';
        console.error('❌ Script injection failed:', injectionError);
      }
    }
  }
  
  // Toggle settings panel
  function toggleSettings() {
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';
    settingsBtn.textContent = isVisible ? '⚙️ Settings' : '⬆️ Hide Settings';
  }
  
  // Toggle extension enabled state
  async function toggleEnabled() {
    const isCurrentlyEnabled = enabledToggle.classList.contains('active');
    const newState = !isCurrentlyEnabled;
    
    enabledToggle.classList.toggle('active', newState);
    
    try {
      await chrome.storage.sync.set({ enabled: newState });
      console.log('🔧 Extension enabled state changed to:', newState);
      
      // Update analyze button state
      if (!newState) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Extension Disabled';
      } else {
        checkCurrentTab(); // Re-check tab status
      }
      
    } catch (error) {
      console.error('❌ Failed to update enabled state:', error);
      // Revert UI change
      enabledToggle.classList.toggle('active', isCurrentlyEnabled);
    }
  }
  
  // Save settings
  async function saveSettings() {
    try {
      saveSettingsBtn.disabled = true;
      saveSettingsBtn.textContent = '💾 Saving...';
      
      const settings = {
        enabled: enabledToggle.classList.contains('active'),
        maxReviews: parseInt(maxReviewsInput.value) || 20,
        apiEndpoint: apiEndpointInput.value.trim() || 'http://localhost:3000/api/amazon-analysis'
      };
      
      // Validate settings
      if (settings.maxReviews < 5 || settings.maxReviews > 50) {
        throw new Error('Max reviews must be between 5 and 50');
      }
      
      if (!settings.apiEndpoint.startsWith('http')) {
        throw new Error('API endpoint must be a valid URL');
      }
      
      await chrome.storage.sync.set(settings);
      
      console.log('💾 Settings saved:', settings);
      
      saveSettingsBtn.textContent = '✅ Saved!';
      
      setTimeout(() => {
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.textContent = '💾 Save Settings';
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      saveSettingsBtn.textContent = '❌ Error';
      
      setTimeout(() => {
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.textContent = '💾 Save Settings';
      }, 2000);
    }
  }
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      startAnalysis();
    } else if (e.key === 'Escape') {
      window.close();
    }
  });
  
  console.log('✅ Popup initialized successfully');
});
