// Admin Turing Test Dashboard
// Shows test results, accuracy metrics, and detailed analysis

"use client";
import { useState } from 'react';

export default function TuringTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  const runTuringTest = async (mockMode = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/turing-test?mock=${mockMode}`, {
        method: 'GET'
      });
      const data = await response.json();
      setTestResults(data);
      console.log('🧪 Turing Test Results:', data);
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed: ' + error.message);
    }
    setLoading(false);
  };

  const runSelectedTests = async (testIds) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/turing-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testIds })
      });
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Selected tests failed:', error);
      alert('Selected tests failed: ' + error.message);
    }
    setLoading(false);
  };

  const getFilteredResults = () => {
    if (!testResults?.results) return [];
    
    switch (selectedCategory) {
      case 'passed':
        return testResults.results.filter(r => r.isCorrect);
      case 'failed':
        return testResults.results.filter(r => !r.isCorrect);
      case 'genuine':
        return testResults.results.filter(r => r.expected.classification === 'genuine');
      case 'suspicious':
        return testResults.results.filter(r => r.expected.classification === 'suspicious');
      case 'a2a':
        return testResults.results.filter(r => r.a2aPerformed);
      default:
        return testResults.results;
    }
  };

  const getResultColor = (result) => {
    if (result.actual.error) return 'bg-gray-100';
    return result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getIndicatorBadge = (indicator) => {
    const colors = {
      green: 'bg-green-500 text-white',
      red: 'bg-red-500 text-white',
      yellow: 'bg-yellow-500 text-white'
    };
    return colors[indicator] || 'bg-gray-500 text-white';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Turing Test Dashboard</h1>
      
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => runTuringTest(false)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Running Tests...' : '🚀 Run All 100 Tests (Live API)'}
          </button>
          
          <button
            onClick={() => runTuringTest(true)}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '🔄 Running Tests...' : '🎭 Mock Test (No API Calls)'}
          </button>
          
          <button
            onClick={() => runSelectedTests(['test_001', 'test_002', 'test_003', 'test_004', 'test_005'])}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Quick Test (5 cases)
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {testResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900">Overall Accuracy</h3>
              <p className="text-2xl font-bold text-blue-600">{testResults.summary.accuracy}%</p>
              <p className="text-sm text-blue-700">{testResults.summary.correctPredictions}/{testResults.summary.totalTests}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900">Genuine Detection</h3>
              <p className="text-2xl font-bold text-green-600">{testResults.metrics?.classification.genuineAccuracy}%</p>
              <p className="text-sm text-green-700">{testResults.metrics?.classification.genuineTests} tests</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900">Suspicious Detection</h3>
              <p className="text-2xl font-bold text-red-600">{testResults.metrics?.classification.suspiciousAccuracy}%</p>
              <p className="text-sm text-red-700">{testResults.metrics?.classification.suspiciousTests} tests</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900">A2A Usage</h3>
              <p className="text-2xl font-bold text-purple-600">{testResults.metrics?.a2aSystem.usageRate}%</p>
              <p className="text-sm text-purple-700">{testResults.metrics?.a2aSystem.totalA2ACases} cases</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          {testResults.metrics && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📊 Detailed Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Display Indicator Accuracy</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        Green
                      </span>
                      <span>{testResults.metrics.displayIndicator.greenAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        Red
                      </span>
                      <span>{testResults.metrics.displayIndicator.redAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        Yellow
                      </span>
                      <span>{testResults.metrics.displayIndicator.yellowAccuracy}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Special Cases</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Image Mismatch Detection</span>
                      <span>{testResults.metrics.specialCases.imageMismatchAccuracy}%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Image Mismatch Tests</span>
                      <span>{testResults.metrics.specialCases.imageMismatchTests}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Time</span>
                      <span>{(testResults.summary.totalTime / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg per Test</span>
                      <span>{(testResults.summary.averageTimePerTest / 1000).toFixed(2)}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {['all', 'passed', 'failed', 'genuine', 'suspicious', 'a2a'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  {category === 'all' && ` (${testResults.results?.length || 0})`}
                  {category === 'passed' && ` (${testResults.results?.filter(r => r.isCorrect).length || 0})`}
                  {category === 'failed' && ` (${testResults.results?.filter(r => !r.isCorrect).length || 0})`}
                  {category === 'a2a' && ` (${testResults.results?.filter(r => r.a2aPerformed).length || 0})`}
                </button>
              ))}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">🧪 Test Results ({getFilteredResults().length})</h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {getFilteredResults().map((result, index) => (
                <div key={index} className={`p-4 border-b ${getResultColor(result)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {result.testId}
                        </span>
                        <span className={`w-3 h-3 rounded-full ${result.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {result.a2aPerformed && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">A2A</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                      
                      {showDetails && (
                        <div className="text-xs space-y-1">
                          <p><strong>Review:</strong> {result.reviewData.comment}</p>
                          <p><strong>Rating:</strong> {result.reviewData.rating}/5 | <strong>Purchased:</strong> {result.reviewData.hasPurchased ? 'Yes' : 'No'} | <strong>Images:</strong> {result.reviewData.hasImages ? 'Yes' : 'No'}</p>
                          {result.flags?.length > 0 && (
                            <p><strong>Flags:</strong> {result.flags.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-700">Expected</p>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs ${getIndicatorBadge(result.expected.displayIndicator)}`}>
                            {result.expected.displayIndicator}
                          </span>
                          <span className="text-xs text-gray-500">
                            {result.expected.classification}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold text-gray-700">Actual</p>
                        {result.actual.error ? (
                          <span className="text-xs text-red-600">Error</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded text-xs ${getIndicatorBadge(result.actual.displayIndicator)}`}>
                              {result.actual.displayIndicator}
                            </span>
                            <span className="text-xs text-gray-500">
                              {result.actual.classification}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* No Results State */}
      {!testResults && !loading && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🧪</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Test AI System</h2>
          <p className="text-gray-600 mb-6">
            Run Turing tests to evaluate Gemini + A2A review analysis accuracy
          </p>
          <button
            onClick={() => runTuringTest(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            🎭 Start Mock Testing
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Running Tests...</h2>
          <p className="text-blue-600">
            Processing test cases through Gemini AI + A2A system
          </p>
          <div className="mt-4 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
          </div>
        </div>
      )}
    </div>
  );
}
