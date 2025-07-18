"use client"

import AdminNavbar from "@/components/AdminNavbar"
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Brain,
    Calendar,
    CheckCircle,
    CheckSquare,
    ChevronDown,
    ChevronUp,
    Clock,
    Eye,
    EyeOff,
    Flag,
    Info,
    MessageSquare,
    RefreshCw,
    Shield,
    ShoppingCart,
    Star,
    Target,
    Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: 'all',
    classification: 'all',
    needsReview: 'false',
    search: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0
  })
  const [selectedReviews, setSelectedReviews] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedAnalysis, setExpandedAnalysis] = useState(null)
  const [expandedReviews, setExpandedReviews] = useState(new Set())

  useEffect(() => {
    checkAdminAuth()
    fetchReviews()
  }, [filters.status, filters.classification, filters.needsReview, pagination.currentPage])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/user')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'admin') {
        router.push('/admin/login')
        return
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        status: filters.status,
        classification: filters.classification,
        needsReview: filters.needsReview,
        page: pagination.currentPage.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/reviews?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews')
      }

      setReviews(data.reviews)
      setPagination(data.pagination)
      setAnalytics(data.analytics)
      setError("")
    } catch (error) {
      console.error('Fetch reviews error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewAction = async (reviewId, action, moderationNotes = '') => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          moderationNotes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update review')
      }

      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId ? data.review : review
        )
      )

      showToast(`Review ${action}ed successfully`, 'success')
    } catch (error) {
      console.error('Review action error:', error)
      showToast(error.message, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchAnalyze = async () => {
    if (!confirm('This will analyze ALL unanalyzed reviews in the database. This may take a while. Continue?')) {
      return;
    }

    try {
      setIsProcessing(true)
      const response = await fetch('/api/admin/analyze-all-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze reviews')
      }

      showToast(`Analyzed ${data.stats.successful} reviews successfully! ${data.stats.failed} failed.`, 'success')
      fetchReviews()
    } catch (error) {
      console.error('Batch analyze error:', error)
      showToast(error.message, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      flagged: { color: 'bg-red-100 text-red-800 border-red-200', icon: Flag },
      hidden: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: EyeOff },
      under_review: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle }
    }

    const config = statusConfig[status] || statusConfig.published
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon size={14} className="mr-1.5" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getClassificationBadge = (classification, confidence) => {
    const classConfig = {
      genuine: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      suspicious: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      pending: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: RefreshCw }
    }

    const config = classConfig[classification] || classConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon size={14} className="mr-1.5" />
        {classification?.toUpperCase()} {confidence ? `(${(confidence * 100).toFixed(0)}%)` : ''}
      </span>
    )
  }

  const getRiskBadge = (riskLevel) => {
    const riskConfig = {
      low: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckSquare },
      medium: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: AlertTriangle },
      high: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle }
    }

    const config = riskConfig[riskLevel] || riskConfig.medium
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {riskLevel?.toUpperCase()} RISK
      </span>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    if (score >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 0.8) return 'bg-green-100'
    if (score >= 0.6) return 'bg-yellow-100'
    if (score >= 0.4) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const toggleExpandedReview = (reviewId) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  if (isLoading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI-Powered Review Management</h1>
            <p className="text-gray-600 mt-1">Advanced fraud detection with Gemini 2.0 Flash AI</p>
          </div>
          <button
            onClick={handleBatchAnalyze}
            disabled={isProcessing}
            className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg"
          >
            <Brain size={20} className="mr-2" />
            {isProcessing ? 'Analyzing All Reviews...' : 'Analyze All Past Reviews'}
          </button>
        </div>

        {/* Enhanced Analytics Cards */}
        {analytics && (
          <>
            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <Shield className="text-teal-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        Trust Score 
                        {analytics.aiPowered && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full ml-2 flex items-center">
                            <Brain size={10} className="mr-1" />
                            AI
                          </span>
                        )}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.trustScore || 0}%</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-teal-50 rounded-lg p-3">
                  <p className="text-xs text-teal-700">
                    {analytics.genuineCount || 0} out of {analytics.totalReviews || 0} reviews verified as genuine
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Genuine Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.genuineCount || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700">
                    Coverage: {analytics.analysisCoverage || 0}% analyzed
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Suspicious</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.suspiciousCount || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-700">
                    {analytics.suspiciousPercentage || 0}% of total reviews
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Eye className="text-yellow-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Need Review</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.flaggedForManualReview || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-yellow-700">
                    High-priority manual reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced AI Analytics */}
            {analytics.aiPowered && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-purple-200 lg:col-span-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <Brain className="mr-2" size={20} />
                      Gemini AI Metrics
                    </h3>
                    <span className="bg-purple-200 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                      Live AI
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 flex items-center">
                        <Target className="mr-2" size={14} />
                        Avg Confidence
                      </span>
                      <span className="font-bold text-purple-900 text-lg">
                        {(parseFloat(analytics.avgConfidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 flex items-center">
                        <Activity className="mr-2" size={14} />
                        Avg Sentiment
                      </span>
                      <span className="font-bold text-purple-900 text-lg">
                        {(parseFloat(analytics.avgSentiment || 0.5) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 flex items-center">
                        <CheckSquare className="mr-2" size={14} />
                        Avg Authenticity
                      </span>
                      <span className="font-bold text-purple-900 text-lg">
                        {(parseFloat(analytics.avgAuthenticity || 0.5) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">
                      Model: {analytics.modelUsed || 'gemini-2.0-flash'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last Updated: {new Date(analytics.lastUpdated || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <Zap className="mr-2 text-yellow-500" size={20} />
                    AI Detection Patterns
                  </h3>
                  {analytics.flagStats && Object.keys(analytics.flagStats).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(analytics.flagStats)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 8)
                        .map(([flag, count]) => (
                          <div key={flag} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                            <span className="text-sm text-gray-700 font-medium capitalize flex items-center">
                              <Flag size={14} className="mr-2 text-orange-500" />
                              {flag.replace(/_/g, ' ')}
                            </span>
                            <span className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full font-bold">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Flag className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500">No detection patterns available</p>
                      <p className="text-sm text-gray-400 mt-2">Run analysis to see AI detection insights</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
              <option value="under_review">Under Review</option>
            </select>

            <select
              value={filters.classification}
              onChange={(e) => setFilters(prev => ({ ...prev, classification: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Classifications</option>
              <option value="genuine">Genuine</option>
              <option value="suspicious">Suspicious</option>
              <option value="pending">Pending Analysis</option>
            </select>

            <select
              value={filters.needsReview}
              onChange={(e) => setFilters(prev => ({ ...prev, needsReview: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="false">All Reviews</option>
              <option value="true">Needs Manual Review</option>
            </select>

            <button
              onClick={fetchReviews}
              className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-medium"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Reviews Grid/List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                {/* Review Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={review.user?.profilePicture || '/placeholder.svg'}
                        alt={review.user?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {review.user?.name || 'Unknown User'}
                          </p>
                          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                            {getStatusBadge(review.status)}
                            {review.aiAnalysis && getRiskBadge(review.aiAnalysis.riskLevel)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? '#fbbf24' : 'none'}
                                stroke={i < review.rating ? '#fbbf24' : '#d1d5db'}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 flex items-center mt-1 sm:mt-0">
                            <Calendar size={14} className="mr-1" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>

                        {/* Display review images */}
                        {review.images && review.images.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Review Images:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image.url}
                                  alt={`Review image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                                  onClick={() => window.open(image.url, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center space-x-3 lg:ml-6 bg-gray-50 rounded-lg p-4 lg:w-80">
                      <img
                        src={review.product?.mainImage || '/placeholder.svg'}
                        alt={review.product?.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {review.product?.name || 'Product Deleted'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {review.product?.category || 'No category'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                {review.aiAnalysis ? (
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      {/* Classification & Scores */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getClassificationBadge(
                              review.aiAnalysis.classification,
                              review.aiAnalysis.confidence
                            )}
                            {review.aiAnalysis.needsManualReview && (
                              <span className="inline-flex items-center text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                                <AlertCircle size={14} className="mr-1.5" />
                                Manual Review Needed
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 mt-2 sm:mt-0 flex items-center">
                            <Brain size={12} className="mr-1" />
                            {review.aiAnalysis.modelVersion || 'gemini-2.0-flash'}
                          </span>
                        </div>

                        {/* Score Grid */}
                        {(review.aiAnalysis.scores || review.aiAnalysis.sentimentScore !== undefined) && (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {/* Sentiment Score */}
                            {(() => {
                              const sentimentScore = review.aiAnalysis.scores?.sentimentScore ?? review.aiAnalysis.sentimentScore;
                              if (sentimentScore !== undefined) {
                                return (
                                  <div className={`p-3 rounded-lg border ${getScoreBg(sentimentScore)}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-600">Sentiment</span>
                                      <Activity size={14} className="text-gray-500" />
                                    </div>
                                    <p className={`text-lg font-bold ${getScoreColor(sentimentScore)}`}>
                                      {(sentimentScore * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Authenticity Score */}
                            {(() => {
                              const authenticityScore = review.aiAnalysis.scores?.authenticityScore ?? review.aiAnalysis.authenticityScore;
                              if (authenticityScore !== undefined) {
                                return (
                                  <div className={`p-3 rounded-lg border ${getScoreBg(authenticityScore)}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-600">Authenticity</span>
                                      <CheckSquare size={14} className="text-gray-500" />
                                    </div>
                                    <p className={`text-lg font-bold ${getScoreColor(authenticityScore)}`}>
                                      {(authenticityScore * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Product Relevance Score */}
                            {(() => {
                              const productRelevanceScore = review.aiAnalysis.scores?.productRelevanceScore ?? review.aiAnalysis.productRelevanceScore;
                              if (productRelevanceScore !== undefined) {
                                return (
                                  <div className={`p-3 rounded-lg border ${getScoreBg(productRelevanceScore)}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-600">Product Match</span>
                                      <Target size={14} className="text-gray-500" />
                                    </div>
                                    <p className={`text-lg font-bold ${getScoreColor(productRelevanceScore)}`}>
                                      {(productRelevanceScore * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Purchase Verification Score */}
                            {(() => {
                              const purchaseVerificationScore = review.aiAnalysis.scores?.purchaseVerificationScore ?? review.aiAnalysis.purchaseVerificationScore;
                              if (purchaseVerificationScore !== undefined) {
                                return (
                                  <div className={`p-3 rounded-lg border ${getScoreBg(purchaseVerificationScore)}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-600">Purchase Verified</span>
                                      <ShoppingCart size={14} className="text-gray-500" />
                                    </div>
                                    <p className={`text-lg font-bold ${getScoreColor(purchaseVerificationScore)}`}>
                                      {(purchaseVerificationScore * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}

                        {/* Flags */}
                        {review.aiAnalysis.flags && review.aiAnalysis.flags.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <Flag size={14} className="mr-1.5 text-orange-500" />
                              Detected Issues
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {review.aiAnalysis.flags.map((flag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full border border-orange-200 font-medium"
                                >
                                  {flag.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Reasoning */}
                        {review.aiAnalysis.reasoning && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                              <Brain size={14} className="mr-1.5" />
                              AI Analysis Summary
                            </h4>
                            <p className="text-sm text-blue-700 leading-relaxed">
                              {review.aiAnalysis.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Key Insights */}
                        {review.aiAnalysis.keyInsights && review.aiAnalysis.keyInsights.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Zap size={14} className="mr-1.5 text-yellow-500" />
                              Key Insights
                            </h4>
                            <div className="space-y-2">
                              {review.aiAnalysis.keyInsights.slice(0, 3).map((insight, index) => (
                                <div key={index} className="flex items-start space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 leading-relaxed">{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {review.aiAnalysis.recommendations && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                              <Target size={14} className="mr-1.5" />
                              AI Recommendation
                            </h4>
                            <div className="text-sm text-yellow-700">
                              <span className="font-bold uppercase">
                                {review.aiAnalysis.recommendations.action}
                              </span>
                              {review.aiAnalysis.recommendations.explanation && (
                                <span className="ml-2">- {review.aiAnalysis.recommendations.explanation}</span>
                              )}
                              {review.aiAnalysis.recommendations.priority && (
                                <div className="mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    review.aiAnalysis.recommendations.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    review.aiAnalysis.recommendations.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {review.aiAnalysis.recommendations.priority.toUpperCase()} PRIORITY
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Detailed Analysis Toggle */}
                        {review.aiAnalysis.detailedAnalysis && (
                          <div className="border-t border-gray-200 pt-4">
                            <button 
                              onClick={() => setExpandedAnalysis(expandedAnalysis === review._id ? null : review._id)}
                              className="flex items-center space-x-2 text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                            >
                              {expandedAnalysis === review._id ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              <span>
                                {expandedAnalysis === review._id ? 'Hide' : 'Show'} Detailed AI Analysis
                              </span>
                            </button>
                            
                            {expandedAnalysis === review._id && (
                              <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-6">
                                {review.aiAnalysis.detailedAnalysis.purchaseVerificationAnalysis && (
                                  <div>
                                    <h5 className="font-semibold text-red-700 text-sm mb-2 flex items-center">
                                      <ShoppingCart size={14} className="mr-2" />
                                      Purchase Verification Analysis
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.purchaseVerificationAnalysis}
                                    </p>
                                  </div>
                                )}
                                
                                {review.aiAnalysis.detailedAnalysis.productRelevanceAnalysis && (
                                  <div>
                                    <h5 className="font-semibold text-blue-700 text-sm mb-2 flex items-center">
                                      <Target size={14} className="mr-2" />
                                      Product Relevance Analysis
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.productRelevanceAnalysis}
                                    </p>
                                  </div>
                                )}
                                
                                {review.aiAnalysis.detailedAnalysis.authenticityAssessment && (
                                  <div>
                                    <h5 className="font-semibold text-green-700 text-sm mb-2 flex items-center">
                                      <CheckSquare size={14} className="mr-2" />
                                      Authenticity Assessment
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.authenticityAssessment}
                                    </p>
                                  </div>
                                )}
                                
                                {review.aiAnalysis.detailedAnalysis.linguisticAnalysis && (
                                  <div>
                                    <h5 className="font-semibold text-orange-700 text-sm mb-2 flex items-center">
                                      <MessageSquare size={14} className="mr-2" />
                                      Language Analysis
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.linguisticAnalysis}
                                    </p>
                                  </div>
                                )}
                                
                                {review.aiAnalysis.detailedAnalysis.suspiciousPatterns && (
                                  <div>
                                    <h5 className="font-semibold text-red-700 text-sm mb-2 flex items-center">
                                      <AlertTriangle size={14} className="mr-2" />
                                      Suspicious Patterns
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.suspiciousPatterns}
                                    </p>
                                  </div>
                                )}
                                
                                {review.aiAnalysis.detailedAnalysis.timelineAnalysis && (
                                  <div>
                                    <h5 className="font-semibold text-purple-700 text-sm mb-2 flex items-center">
                                      <Clock size={14} className="mr-2" />
                                      Timeline Analysis
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.timelineAnalysis}
                                    </p>
                                  </div>
                                )}

                                {review.aiAnalysis.detailedAnalysis.specificConcerns && (
                                  <div>
                                    <h5 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                      <Info size={14} className="mr-2" />
                                      Specific Concerns
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border">
                                      {review.aiAnalysis.detailedAnalysis.specificConcerns}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions Panel */}
                      <div className="lg:ml-6 lg:w-48">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                        <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                          {review.status !== 'published' && (
                            <button
                              onClick={() => handleReviewAction(review._id, 'approve')}
                              disabled={isProcessing}
                              className="flex items-center justify-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 flex-1 lg:flex-initial"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Approve
                            </button>
                          )}
                          
                          {review.status !== 'flagged' && (
                            <button
                              onClick={() => handleReviewAction(review._id, 'flag')}
                              disabled={isProcessing}
                              className="flex items-center justify-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex-1 lg:flex-initial"
                            >
                              <Flag size={16} className="mr-2" />
                              Flag
                            </button>
                          )}
                          
                          {review.status !== 'hidden' && (
                            <button
                              onClick={() => handleReviewAction(review._id, 'hide')}
                              disabled={isProcessing}
                              className="flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex-1 lg:flex-initial"
                            >
                              <EyeOff size={16} className="mr-2" />
                              Hide
                            </button>
                          )}
                        </div>

                        {/* Analysis Timestamp */}
                        {review.aiAnalysis && review.aiAnalysis.analyzedAt && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              <Clock size={12} className="inline mr-1" />
                              Analyzed: {new Date(review.aiAnalysis.analyzedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        Not analyzed yet
                      </span>
                      <div className="flex space-x-2">
                        {review.status !== 'published' && (
                          <button
                            onClick={() => handleReviewAction(review._id, 'approve')}
                            disabled={isProcessing}
                            className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Approve
                          </button>
                        )}
                        
                        {review.status !== 'flagged' && (
                          <button
                            onClick={() => handleReviewAction(review._id, 'flag')}
                            disabled={isProcessing}
                            className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <Flag size={16} className="mr-2" />
                            Flag
                          </button>
                        )}
                        
                        {review.status !== 'hidden' && (
                          <button
                            onClick={() => handleReviewAction(review._id, 'hide')}
                            disabled={isProcessing}
                            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <EyeOff size={16} className="mr-2" />
                            Hide
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                <span className="ml-2 text-gray-500">
                  ({pagination.totalReviews} total reviews)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm bg-teal-100 text-teal-800 rounded-lg font-medium">
                  {pagination.currentPage}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertCircle className="text-red-400 mt-0.5" size={20} />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}