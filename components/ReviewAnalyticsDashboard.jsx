"use client"

import { AlertCircle, AlertTriangle, CheckCircle, Eye, RefreshCw, Shield } from "lucide-react"
import { useEffect, useState } from "react"

export default function ReviewAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/reviews?limit=1")
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics")
      }
      setAnalytics(data.analytics)
      setError("")
    } catch (error) {
      console.error("Fetch analytics error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md w-full max-w-full border border-gray-100">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded-full w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-12 bg-gray-200 rounded-lg mt-6"></div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md w-full max-w-full border border-gray-100">
        <div className="flex items-center justify-center text-red-600 py-8">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" />
          <span className="text-base font-medium">Failed to load review analytics</span>
        </div>
        <button
          onClick={fetchAnalytics}
          className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const trustScoreColor =
    analytics.trustScore >= 80 ? "text-green-600" : analytics.trustScore >= 60 ? "text-yellow-600" : "text-red-600"

  const suspiciousPercentage = Number.parseFloat(analytics.suspiciousPercentage)

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md w-full max-w-full border border-gray-100 overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="text-teal-600 mr-3 hidden sm:block" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Review Security</h3>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 bg-gray-50 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          aria-label="Refresh analytics"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Trust Score */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Platform Trust Score</span>
          <span className={`text-2xl font-bold ${trustScoreColor} flex-shrink-0`}>{analytics.trustScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              analytics.trustScore >= 80 ? "bg-green-500" : analytics.trustScore >= 60 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${analytics.trustScore}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
          <p className="text-xl font-bold text-green-800">{analytics.genuineCount}</p>
          <p className="text-sm text-green-600 mt-1">Genuine Reviews</p>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <AlertTriangle className="text-red-600 mx-auto mb-2" size={24} />
          <p className="text-xl font-bold text-red-800">{analytics.suspiciousCount}</p>
          <p className="text-sm text-red-600 mt-1">Suspicious Reviews</p>
        </div>
      </div>

      {/* Alert Level */}
      <div className="mb-5 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Alert Level</span>
          <div
            className="flex items-center flex-shrink-0 px-3 py-1 rounded-full"
            style={{
              backgroundColor:
                suspiciousPercentage < 5
                  ? "rgba(34, 197, 94, 0.1)"
                  : suspiciousPercentage < 15
                    ? "rgba(234, 179, 8, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
            }}
          >
            {suspiciousPercentage < 5 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600">Low</span>
              </>
            ) : suspiciousPercentage < 15 ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-yellow-600">Medium</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-red-600">High</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Required */}
      {analytics.flaggedForManualReview > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5 shadow-sm">
          <div className="flex items-start">
            <Eye className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-medium text-yellow-800">Action Required</p>
              <p className="text-xs text-yellow-700 mt-1">
                {analytics.flaggedForManualReview} review{analytics.flaggedForManualReview !== 1 ? "s" : ""} need manual
                review
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Summary - IMPROVED COMPACT VERSION */}
      {analytics.aiAnalysis && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-100 px-4 py-2 border-b border-blue-200">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
              <h4 className="text-sm font-semibold text-blue-800">AI Analysis Summary</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm text-blue-900 leading-relaxed max-h-24 overflow-y-auto">
              {analytics.aiAnalysis.length > 200 ? (
                <div>
                  <p className="mb-2">{analytics.aiAnalysis.substring(0, 200)}...</p>
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium underline">Read more</button>
                </div>
              ) : (
                <p>{analytics.aiAnalysis}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Common Flags */}
      {analytics.flagStats && Object.keys(analytics.flagStats).length > 0 && (
        <div className="mb-5 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Common Issues</h4>
          <div className="space-y-2.5">
            {Object.entries(analytics.flagStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([flag, count]) => (
                <div key={flag} className="flex justify-between items-center">
                  <div className="flex items-center text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-sm capitalize">{flag.replace("_", " ")}</span>
                  </div>
                  <span className="text-sm text-gray-800 font-medium px-2 py-0.5 bg-gray-200 rounded-md">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <a
          href="/admin/reviews"
          className="block w-full text-center bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          Manage Reviews
        </a>
      </div>
    </div>
  )
}
