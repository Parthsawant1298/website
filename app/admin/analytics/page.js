"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  PieChart,
  Target,
  Award,
  RefreshCw,
  Download,
  Package,
  CreditCard,
  Mail,
  Activity,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import AdminNavbar from "@/components/AdminNavbar"

export default function RevenueAnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("12months")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [analyticsData, setAnalyticsData] = useState({
    dailyRevenue: [],
    monthlyRevenue: [],
    categoryRevenue: [],
    productRevenue: [],
    customerAnalytics: [],
    paymentAnalysis: [],
    orderSizeAnalysis: [],
    topCustomers: [],
    growth: { revenue: 0, orders: 0, customers: 0 },
    summary: {
      today: { revenue: 0, orders: 0 },
      thisMonth: { revenue: 0, orders: 0 },
      thisYear: { revenue: 0, orders: 0 },
      allTime: { revenue: 0, orders: 0 },
    },
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, selectedCategory])

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/admin/analytics/revenue?timeRange=${timeRange}&category=${selectedCategory}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics")
      }

      setAnalyticsData(data.data)
      setError("")
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      setError("Failed to load analytics data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`
    }
    return `₹${amount.toLocaleString()}`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const formatDate = (dateObj) => {
    if (dateObj.day) {
      return `${dateObj.day}/${dateObj.month}`
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[dateObj.month - 1]} ${dateObj.year}`
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <TrendingUp size={16} className="text-green-500" />
    } else if (growth < 0) {
      return <TrendingDown size={16} className="text-red-500" />
    }
    return <TrendingUp size={16} className="text-gray-500" />
  }

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-gray-600"
  }

  const RevenueChart = ({ data, type }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity size={32} className="mx-auto mb-3 sm:mb-4 text-gray-300 sm:hidden" />
            <Activity size={48} className="mx-auto mb-3 sm:mb-4 text-gray-300 hidden sm:block" />
            <p className="text-sm sm:text-base">No data available</p>
          </div>
        </div>
      )
    }

    // Format data for the line chart
    const chartData = data.slice(-30).map((item) => ({
      date: formatDate(item._id),
      revenue: item.revenue,
      orders: item.orders,
    }))

    return (
      <div className="h-48 sm:h-56 lg:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "none",
                padding: "8px 12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#14B8A6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#14B8A6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#14B8A6", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const CategoryDonutChart = ({ data }) => {
    if (!data || data.length === 0) return null

    const total = data.reduce((sum, item) => sum + item.revenue, 0)
    const colors = ["#14B8A6", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"]

    let cumulativePercentage = 0

    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
            <circle cx="64" cy="64" r="48" fill="none" stroke="#F3F4F6" strokeWidth="16" className="sm:hidden" />
            <circle cx="80" cy="80" r="60" fill="none" stroke="#F3F4F6" strokeWidth="20" className="hidden sm:block" />
            {data.slice(0, 6).map((item, index) => {
              const percentage = (item.revenue / total) * 100
              const strokeDasharray = `${percentage * 3.77} 377`
              const strokeDashoffset = -cumulativePercentage * 3.77
              cumulativePercentage += percentage

              return (
                <circle
                  key={index}
                  cx="64"
                  cy="64"
                  r="48"
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-opacity-80 sm:hidden"
                />
              )
            })}
            {data.slice(0, 6).map((item, index) => {
              const percentage = (item.revenue / total) * 100
              const strokeDasharray = `${percentage * 3.77} 377`
              const strokeDashoffset = -cumulativePercentage * 3.77
              cumulativePercentage += percentage

              return (
                <circle
                  key={index}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-opacity-80 hidden sm:block"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs sm:text-sm font-semibold text-gray-900">{formatCurrency(total)}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-1 sm:space-y-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: colors[index] }}></div>
              <div className="text-xs sm:text-sm">
                <div className="font-medium text-gray-900 truncate max-w-24 sm:max-w-32">{item._id}</div>
                <div className="text-gray-500">{formatCurrency(item.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const MetricCard = ({ title, value, change, icon: Icon, color, subtext }) => (
    <div
      className={`bg-gradient-to-br ${color} p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-white overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 opacity-10">
        <Icon size={60} className="sm:hidden" />
        <Icon size={80} className="hidden sm:block" />
      </div>
      <div className="relative z-10">
        <p className="text-white opacity-80 text-xs sm:text-sm font-medium mb-1">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 break-words">{value}</p>
        {subtext && <p className="text-white opacity-70 text-xs sm:text-sm">{subtext}</p>}
        {change !== undefined && (
          <div className="flex-items-center mt-2 text-black bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1 inline-block">
            {getGrowthIcon(change)}
            <span className="text-xs sm:text-sm ml-1 font-medium">{Math.abs(change)}% vs last period</span>
          </div>
        )}
      </div>
    </div>
  )

  const exportData = () => {
    const dataToExport = {
      summary: analyticsData.summary,
      growth: analyticsData.growth,
      categoryRevenue: analyticsData.categoryRevenue,
      topProducts: analyticsData.productRevenue,
      topCustomers: analyticsData.topCustomers,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7days":
        return "Last 7 Days"
      case "30days":
        return "Last 30 Days"
      case "90days":
        return "Last 90 Days"
      case "12months":
        return "Last 12 Months"
      case "thisyear":
        return "This Year"
      default:
        return "Custom Range"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-xl shadow-md max-w-sm w-full">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-teal-700 font-medium text-sm sm:text-base">Loading analytics dashboard...</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2 text-center">This may take a moment</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminNavbar />

      <main className="flex-grow py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8 bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
                <p className="text-gray-600 text-sm sm:text-base">Comprehensive insights into your business performance</p>
                <div className="mt-2 inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs sm:text-sm">
                  <Calendar size={12} className="mr-1" />
                  {getTimeRangeLabel()}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm text-sm sm:text-base"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="thisyear">This Year</option>
                </select>
                <button
                  onClick={exportData}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm text-sm sm:text-base"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </button>
                <button
                  onClick={fetchAnalytics}
                  disabled={isRefreshing}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 shadow-sm text-sm sm:text-base"
                >
                  <RefreshCw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* AI Review Analytics Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Review Analytics</h2>
                <p className="text-gray-600">AI-powered review analysis and fraud detection</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-full">
                <Target size={20} className="text-purple-600" />
              </div>
            </div>

            {/* Review Analysis Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suspicious Reviews</p>
                    <p className="text-3xl font-bold text-red-600">0</p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-500 font-medium">High Priority</span>
                  <span className="text-gray-500 ml-1">needs attention</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600">0</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-yellow-600 font-medium">Manual Review</span>
                  <span className="text-gray-500 ml-1">required</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verified Reviews</p>
                    <p className="text-3xl font-bold text-green-600">0</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">AI Verified</span>
                  <span className="text-gray-500 ml-1">authentic</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-500 font-medium">AI Processed</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/admin/reviews" 
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-purple-700">All Reviews</h4>
                      <p className="text-sm text-gray-500">View and manage all reviews</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>

                <a 
                  href="/admin/reviews?filter=suspicious" 
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-red-700">Suspicious Reviews</h4>
                      <p className="text-sm text-gray-500">Reviews flagged by AI</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>

                <a 
                  href="/admin/reviews?filter=pending" 
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-yellow-700">Pending Reviews</h4>
                      <p className="text-sm text-gray-500">Requires manual review</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(analyticsData.summary.today.revenue)}
              icon={DollarSign}
              color="from-blue-500 to-blue-700"
              subtext={`${analyticsData.summary.today.orders} orders`}
            />

            <MetricCard
              title="This Month"
              value={formatCurrency(analyticsData.summary.thisMonth.revenue)}
              change={analyticsData.growth.revenue}
              icon={TrendingUp}
              color="from-green-500 to-green-700"
            />

            <MetricCard
              title="This Year"
              value={formatCurrency(analyticsData.summary.thisYear.revenue)}
              icon={Target}
              color="from-purple-500 to-purple-700"
              subtext={`${analyticsData.summary.thisYear.orders} orders`}
            />

            <MetricCard
              title="All Time"
              value={formatCurrency(analyticsData.summary.allTime.revenue)}
              icon={Award}
              color="from-orange-500 to-orange-700"
              subtext={`${analyticsData.summary.allTime.orders} total orders`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {timeRange === "7days" || timeRange === "30days"
                      ? "Daily"
                      : timeRange === "90days"
                        ? "Weekly"
                        : "Monthly"}{" "}
                    revenue
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 bg-teal-50 rounded-full">
                  <Activity size={16} className="text-teal-600 sm:hidden" />
                  <Activity size={20} className="text-teal-600 hidden sm:block" />
                </div>
              </div>
              <RevenueChart data={analyticsData.dailyRevenue} type="daily" />
            </div>

            {/* Category Revenue Distribution */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue by Category</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Distribution across product categories</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
                  <PieChart size={16} className="text-blue-600 sm:hidden" />
                  <PieChart size={20} className="text-blue-600 hidden sm:block" />
                </div>
              </div>
              <CategoryDonutChart data={analyticsData.categoryRevenue} />
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Growth Metrics</h3>
                <p className="text-xs sm:text-sm text-gray-500">Performance compared to previous period</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full">
                <TrendingUp size={16} className="text-purple-600 sm:hidden" />
                <TrendingUp size={20} className="text-purple-600 hidden sm:block" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`text-2xl sm:text-3xl font-bold ${getGrowthColor(analyticsData.growth.revenue)} mb-2`}>
                  {analyticsData.growth.revenue >= 0 ? "+" : ""}
                  {analyticsData.growth.revenue}%
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">Revenue Growth</div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(analyticsData.growth.revenue)}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`text-2xl sm:text-3xl font-bold ${getGrowthColor(analyticsData.growth.orders)} mb-2`}>
                  {analyticsData.growth.orders >= 0 ? "+" : ""}
                  {analyticsData.growth.orders}%
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">Orders Growth</div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(analyticsData.growth.orders)}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`text-2xl sm:text-3xl font-bold ${getGrowthColor(analyticsData.growth.customers)} mb-2`}>
                  {analyticsData.growth.customers >= 0 ? "+" : ""}
                  {analyticsData.growth.customers}%
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">Customer Growth</div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(analyticsData.growth.customers)}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Top Products */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Products</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Best performing products by revenue</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-full">
                  <Package size={16} className="text-green-600 sm:hidden" />
                  <Package size={20} className="text-green-600 hidden sm:block" />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {analyticsData.productRevenue.slice(0, 5).map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-semibold text-xs sm:text-sm">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.productName}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1"></span>
                        <span className="truncate">{product.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(product.revenue)}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{product.quantitySold} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Customers</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Highest spending customers</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full">
                  <Users size={16} className="text-purple-600 sm:hidden" />
                  <Users size={20} className="text-purple-600 hidden sm:block" />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {analyticsData.topCustomers.slice(0, 5).map((customer, index) => (
                  <div
                    key={customer._id}
                    className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-xs sm:text-sm">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{customer.customerName}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <Mail size={10} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{customer.customerEmail}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(customer.totalSpent)}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center justify-end">
                        <ShoppingCart size={10} className="mr-1" />
                        {customer.orderCount} orders
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Size Analysis */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Size Distribution</h3>
                <p className="text-xs sm:text-sm text-gray-500">Analysis of order values by range</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-orange-50 rounded-full">
                <ShoppingCart size={16} className="text-orange-600 sm:hidden" />
                <ShoppingCart size={20} className="text-orange-600 hidden sm:block" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {analyticsData.orderSizeAnalysis.map((range, index) => (
                <div
                  key={range._id}
                  className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                >
                  <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 truncate">{range._id}</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{range.orders}</div>
                  <div className="text-xs text-gray-500">orders</div>
                  <div className="text-xs sm:text-sm text-teal-600 mt-1 font-medium">{formatCurrency(range.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Analysis */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Method Analysis</h3>
                <p className="text-xs sm:text-sm text-gray-500">Revenue breakdown by payment method</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
                <CreditCard size={16} className="text-blue-600 sm:hidden" />
                <CreditCard size={20} className="text-blue-600 hidden sm:block" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {analyticsData.paymentAnalysis.map((payment, index) => (
                <div
                  key={payment._id}
                  className="p-4 sm:p-5 border border-gray-200 rounded-lg hover:border-teal-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                      <CreditCard size={14} className="text-teal-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{payment._id}</span>
                    </span>
                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full flex-shrink-0">
                      {Math.round((payment.revenue / analyticsData.summary.thisYear.revenue) * 100)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Revenue:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(payment.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Orders:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{payment.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Avg Order Value:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(payment.avgOrderValue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.round((payment.revenue / analyticsData.summary.thisYear.revenue) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}