// app/admin/ai-validation-free/page.js - FREE AI Validation Admin Page
"use client";

import FreeAIValidationDashboard from '@/components/FreeAIValidationDashboard';
import { Activity, BarChart3, Brain, Shield, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function FreeAIValidationPage() {
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <a href="/admin/dashboard" className="hover:text-gray-700">Admin</a>
            <span className="mx-2">›</span>
            <span className="text-gray-900">AI Validation (FREE)</span>
          </nav>

          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  FREE Industry-Standard AI Validation
                </h1>
                <p className="text-gray-600 mt-1">
                  Statistical validation using free mathematical libraries - No paid APIs required
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              {showTechnicalInfo ? 'Hide' : 'Show'} Technical Info
            </button>
          </div>
        </div>
      </div>

      {/* Technical Information Panel */}
      {showTechnicalInfo && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Validation Methods */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  FREE Validation Methods
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Cross-Validation:</span>
                      <span className="text-gray-600 ml-1">K-fold statistical testing with confidence intervals</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Activity className="w-4 h-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Bootstrap Sampling:</span>
                      <span className="text-gray-600 ml-1">Robust statistics with 95% confidence intervals</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-4 h-4 text-orange-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">ROC Analysis:</span>
                      <span className="text-gray-600 ml-1">Receiver Operating Characteristic curves and AUC</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Calibration Analysis:</span>
                      <span className="text-gray-600 ml-1">Confidence reliability and Expected Calibration Error</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-green-600" />
                  FREE Technology Stack
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">simple-statistics</span>
                    <span className="text-green-600 text-sm">✓ Installed</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4 -mt-2">
                    Statistical functions: mean, std, quantiles, t-tests
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">ml-matrix</span>
                    <span className="text-green-600 text-sm">✓ Installed</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4 -mt-2">
                    Matrix operations: confusion matrix, PCA, eigenvalues
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">mathjs</span>
                    <span className="text-green-600 text-sm">✓ Installed</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4 -mt-2">
                    Mathematical computations: AUC, calibration metrics
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">recharts</span>
                    <span className="text-green-600 text-sm">✓ Installed</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4 -mt-2">
                    Free charting library: ROC curves, calibration plots
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Collection</h4>
                  <p className="text-sm text-gray-600">Fetches reviews with AI analysis from your database</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Statistical Testing</h4>
                  <p className="text-sm text-gray-600">Applies multiple validation methods using free libraries</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Benchmark Comparison</h4>
                  <p className="text-sm text-gray-600">Compares against industry standards and human performance</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Actionable Insights</h4>
                  <p className="text-sm text-gray-600">Provides recommendations and production readiness assessment</p>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-green-600 text-lg">💰</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">100% FREE</h4>
                    <p className="text-sm text-gray-600">No paid APIs or external services required</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-blue-600 text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Industry Standard</h4>
                    <p className="text-sm text-gray-600">Uses proven statistical validation methods</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-purple-600 text-lg">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time</h4>
                    <p className="text-sm text-gray-600">Instant validation results and metrics</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-orange-600 text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Actionable</h4>
                    <p className="text-sm text-gray-600">Clear recommendations for improvement</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-red-600 text-lg">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Secure</h4>
                    <p className="text-sm text-gray-600">All processing happens locally on your server</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-gray-600 text-lg">📈</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Production Ready</h4>
                    <p className="text-sm text-gray-600">Comprehensive readiness assessment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <FreeAIValidationDashboard />

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              FREE AI Validation System • No External APIs • Industry-Standard Methods
            </p>
            <p className="text-xs mt-1">
              Powered by: simple-statistics • ml-matrix • mathjs • recharts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
