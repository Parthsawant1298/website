// components/FreeAIValidationDashboard.jsx - FREE Industry-Standard AI Validation Dashboard
"use client";

import {
    Activity,
    AlertTriangle,
    Award,
    BarChart3,
    Brain,
    CheckCircle,
    LineChart as LineIcon,
    RefreshCw,
    Shield,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend, ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

export default function FreeAIValidationDashboard() {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [quickStatus, setQuickStatus] = useState(null);
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  
  // NEW: Progress tracking state
  const [progressLog, setProgressLog] = useState([]);
  const [currentProgress, setCurrentProgress] = useState({ 
    stage: '', 
    percentage: 0, 
    details: '',
    isRunning: false 
  });

  useEffect(() => {
    fetchValidationStatus();
    // Listen to console logs for progress updates
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Capture Gemini progress messages
      if (message.includes('🚀') || message.includes('🔄') || message.includes('📈') || 
          message.includes('🧠') || message.includes('😊') || message.includes('✅') ||
          message.includes('🎯') || message.includes('🏆')) {
        
        setProgressLog(prev => [...prev.slice(-20), { // Keep last 20 messages
          timestamp: new Date().toLocaleTimeString(),
          message: message,
          type: message.includes('✅') ? 'success' : 
                message.includes('🔄') ? 'progress' : 
                message.includes('🏆') ? 'result' : 'info'
        }]);
        
        // Extract progress percentage if available
        const progressMatch = message.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
          const percentage = parseFloat(progressMatch[1]);
          setCurrentProgress(prev => ({
            ...prev,
            percentage: percentage,
            details: message,
            isRunning: true
          }));
        }
        
        // Extract stage information
        if (message.includes('BLEU')) {
          setCurrentProgress(prev => ({ ...prev, stage: 'BLEU Analysis' }));
        } else if (message.includes('Semantic')) {
          setCurrentProgress(prev => ({ ...prev, stage: 'Semantic Analysis' }));
        } else if (message.includes('Sentiment')) {
          setCurrentProgress(prev => ({ ...prev, stage: 'Sentiment Analysis' }));
        } else if (message.includes('FINAL VERDICT')) {
          setCurrentProgress(prev => ({ ...prev, stage: 'Complete', percentage: 100, isRunning: false }));
        }
      }
      
      originalLog.apply(console, args); // Call original console.log
    };
    
    // Cleanup
    return () => {
      console.log = originalLog;
    };
  }, []);

  const fetchValidationStatus = async () => {
    try {
      const response = await fetch('/api/ai-validation-free?type=status');
      const data = await response.json();
      if (data.success) {
        setQuickStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch validation status:', error);
    }
  };

  const fetchQuickValidation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-validation-free?type=quick');
      const data = await response.json();
      if (data.success) {
        setValidationData(data.quickValidation);
      }
    } catch (error) {
      console.error('Failed to fetch quick validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComprehensiveValidation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-validation-free?type=detailed');
      const data = await response.json();
      if (data.success) {
        setValidationData(data.validation);
      }
    } catch (error) {
      console.error('Failed to fetch comprehensive validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSpecificValidation = async (type) => {
    setIsRunningValidation(true);
    try {
      const response = await fetch('/api/ai-validation-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validationType: type, sampleSize: 100 })
      });
      const data = await response.json();
      if (data.success) {
        setValidationData(data.result);
        fetchValidationStatus(); // Refresh status
      }
    } catch (error) {
      console.error(`Failed to run ${type} validation:`, error);
    } finally {
      setIsRunningValidation(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return gradeColors[grade] || 'text-gray-600 bg-gray-100';
  };

  const StatusCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className={`w-8 h-8 ${color} mr-3`} />
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );

  const ConfusionMatrixDisplay = ({ matrix, metrics }) => {
    if (!matrix) return null;
    
    const [tn, fp, fn, tp] = matrix.flat();
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Confusion Matrix
        </h3>
        <div className="grid grid-cols-3 gap-2 max-w-md">
          <div></div>
          <div className="text-center font-medium text-sm bg-gray-100 p-2">Predicted Genuine</div>
          <div className="text-center font-medium text-sm bg-gray-100 p-2">Predicted Suspicious</div>
          
          <div className="text-center font-medium text-sm bg-gray-100 p-2">Actual Genuine</div>
          <div className="text-center p-4 bg-green-100 border border-green-300 rounded">
            <div className="font-bold text-green-800">{tp}</div>
            <div className="text-xs text-green-600">True Positive</div>
          </div>
          <div className="text-center p-4 bg-red-100 border border-red-300 rounded">
            <div className="font-bold text-red-800">{fn}</div>
            <div className="text-xs text-red-600">False Negative</div>
          </div>
          
          <div className="text-center font-medium text-sm bg-gray-100 p-2">Actual Suspicious</div>
          <div className="text-center p-4 bg-red-100 border border-red-300 rounded">
            <div className="font-bold text-red-800">{fp}</div>
            <div className="text-xs text-red-600">False Positive</div>
          </div>
          <div className="text-center p-4 bg-green-100 border border-green-300 rounded">
            <div className="font-bold text-green-800">{tn}</div>
            <div className="text-xs text-green-600">True Negative</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{(metrics.precision * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Precision</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{(metrics.recall * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Recall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(metrics.f1Score * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">F1-Score</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !validationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Initializing AI Validation</h2>
          <p className="text-gray-500">Running statistical analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Validation Dashboard</h1>
                <p className="text-gray-600">Industry-Standard FREE Validation System</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchQuickValidation}
                disabled={loading || isRunningValidation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Test
              </button>
              <button
                onClick={fetchComprehensiveValidation}
                disabled={loading || isRunningValidation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Activity className="w-4 h-4 mr-2" />
                Full Validation
              </button>
            </div>
          </div>
        </div>

        {/* Live Progress Panel - Show Real Gemini 2.0 Flash Benchmarking */}
        {(isRunningValidation || progressLog.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="w-5 h-5 mr-2 animate-pulse text-green-500" />
                Live Gemini 2.0 Flash Benchmarking Progress
              </h3>
              <div className="text-sm text-gray-500">
                Real-time validation in progress...
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{currentProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Live Progress Log */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="text-sm text-gray-600 mb-2 font-medium">
                🔴 LIVE: Gemini 2.0 Flash Validation Process
              </div>
              {progressLog.length === 0 ? (
                <div className="text-gray-500 italic">
                  Initializing validation system...
                </div>
              ) : (
                <div className="space-y-1">
                  {progressLog.slice(-10).map((log, index) => (
                    <div key={index} className="text-xs">
                      <span className="text-gray-400">[{log.timestamp}]</span>
                      <span className={`ml-2 ${
                        log.type === 'progress' ? 'text-blue-600 font-medium' :
                        log.type === 'success' ? 'text-green-600 font-medium' :
                        log.type === 'stage' ? 'text-purple-600 font-bold' :
                        'text-gray-700'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Status */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Status: {isRunningValidation ? 
                  <span className="text-green-600 font-medium">🔄 Running Real Validation</span> : 
                  <span className="text-blue-600 font-medium">✅ Validation Complete</span>
                }
              </div>
              <div className="text-xs text-gray-500">
                Open Browser Console (F12) for detailed progress
              </div>
            </div>
          </div>
        )}

        {/* Quick Status Overview */}
        {quickStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatusCard
              title="Overall Accuracy"
              value={`${(quickStatus.accuracy * 100).toFixed(1)}%`}
              subtitle={`Based on ${quickStatus.sampleSize} samples`}
              icon={Target}
              color="text-blue-600"
            />
            <StatusCard
              title="Precision"
              value={`${(quickStatus.precision * 100).toFixed(1)}%`}
              subtitle="Low false positives"
              icon={Shield}
              color="text-green-600"
            />
            <StatusCard
              title="Recall"
              value={`${(quickStatus.recall * 100).toFixed(1)}%`}
              subtitle="High detection rate"
              icon={Activity}
              color="text-orange-600"
            />
            <StatusCard
              title="Production Status"
              value={quickStatus.isProduction ? "Ready" : "Review"}
              subtitle={quickStatus.isProduction ? "Meets benchmarks" : "Needs improvement"}
              icon={quickStatus.isProduction ? CheckCircle : AlertTriangle}
              color={quickStatus.isProduction ? "text-green-600" : "text-yellow-600"}
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'statistical', label: 'Statistical Tests', icon: TrendingUp },
                { id: 'advanced', label: 'Advanced Analytics', icon: LineIcon },
                { id: 'benchmarks', label: 'Benchmarks', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && validationData && (
          <div className="space-y-6">
            {/* Grade and Recommendations */}
            {validationData.grade && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    AI Performance Grade
                  </h3>
                  <div className={`px-4 py-2 rounded-full text-lg font-bold ${getGradeColor(validationData.grade)}`}>
                    {validationData.grade}
                  </div>
                </div>
                {validationData.recommendations && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {validationData.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Confusion Matrix */}
            {validationData.confusionMatrix && validationData.metrics && (
              <ConfusionMatrixDisplay 
                matrix={validationData.confusionMatrix} 
                metrics={validationData.metrics} 
              />
            )}

            {/* Performance Metrics Chart */}
            {validationData.metrics && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Metrics
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { metric: 'Accuracy', value: validationData.metrics.accuracy * 100, benchmark: 85 },
                    { metric: 'Precision', value: validationData.metrics.precision * 100, benchmark: 80 },
                    { metric: 'Recall', value: validationData.metrics.recall * 100, benchmark: 80 },
                    { metric: 'F1-Score', value: validationData.metrics.f1Score * 100, benchmark: 78 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" name="AI Performance" />
                    <Bar dataKey="benchmark" fill="#EF4444" name="Industry Benchmark" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Statistical Tests Tab */}
        {activeTab === 'statistical' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <button
                onClick={() => runSpecificValidation('cross_validation')}
                disabled={isRunningValidation}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-blue-400"
              >
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Validation</h3>
                  <p className="text-gray-600 text-sm">K-fold cross-validation with statistical significance testing</p>
                </div>
              </button>

              <button
                onClick={() => runSpecificValidation('bootstrap')}
                disabled={isRunningValidation}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-green-400"
              >
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Bootstrap Validation</h3>
                  <p className="text-gray-600 text-sm">Bootstrap sampling with confidence intervals</p>
                </div>
              </button>
            </div>

            {/* Bootstrap Results */}
            {validationData?.bootstrapConfidence && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Bootstrap Confidence Intervals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">95% Confidence Interval</h4>
                    <p className="text-blue-700">
                      {(validationData.bootstrapConfidence.lower * 100).toFixed(2)}% - {(validationData.bootstrapConfidence.upper * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Statistical Reliability</h4>
                    <p className="text-green-700">High confidence in model performance</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Analytics Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <button
                onClick={() => runSpecificValidation('roc_analysis')}
                disabled={isRunningValidation}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-purple-400"
              >
                <div className="text-center">
                  <LineIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ROC Analysis</h3>
                  <p className="text-gray-600 text-sm">Receiver Operating Characteristic curve and AUC calculation</p>
                </div>
              </button>

              <button
                onClick={() => runSpecificValidation('calibration')}
                disabled={isRunningValidation}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-orange-400"
              >
                <div className="text-center">
                  <Target className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Calibration Analysis</h3>
                  <p className="text-gray-600 text-sm">Confidence calibration and reliability analysis</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Benchmarks Tab */}
        {activeTab === 'benchmarks' && quickStatus && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Industry Benchmark Comparison
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[
                  { name: 'Your AI Model', accuracy: quickStatus.accuracy * 100, color: '#3B82F6' },
                  { name: 'Industry Average', accuracy: 78, color: '#6B7280' },
                  { name: 'Human Performance', accuracy: 95, color: '#10B981' },
                  { name: 'Random Baseline', accuracy: 50, color: '#EF4444' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Accuracy']} />
                  <Bar dataKey="accuracy" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {quickStatus.accuracy > 0.85 ? '🏆' : quickStatus.accuracy > 0.75 ? '🥈' : '📈'}
                </div>
                <h4 className="font-semibold text-gray-900">Performance Tier</h4>
                <p className="text-gray-600">
                  {quickStatus.accuracy > 0.85 ? 'Excellent' : quickStatus.accuracy > 0.75 ? 'Good' : 'Improving'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {((quickStatus.accuracy / 0.95) * 100).toFixed(0)}%
                </div>
                <h4 className="font-semibold text-gray-900">Human Performance Ratio</h4>
                <p className="text-gray-600">Compared to human accuracy</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  +{((quickStatus.accuracy - 0.50) * 100).toFixed(0)}%
                </div>
                <h4 className="font-semibold text-gray-900">Above Random</h4>
                <p className="text-gray-600">Improvement over random guessing</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || isRunningValidation) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center max-w-sm">
              <Brain className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isRunningValidation ? 'Running Validation' : 'Loading'}
              </h3>
              <p className="text-gray-600">
                {isRunningValidation ? 'Performing statistical analysis...' : 'Please wait...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
