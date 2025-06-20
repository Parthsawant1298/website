// app/api/admin/analytics/revenue/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';

export async function GET(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Verify user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Get query parameters for time range
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '12months';
    const category = url.searchParams.get('category') || 'all';

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Define time range filters
    let startDate;
    switch (timeRange) {
      case '7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '12months':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case 'thisyear':
        startDate = thisYear;
        break;
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }

    // Build category filter for order items
    let categoryFilter = {};
    if (category !== 'all') {
      // We'll need to filter by product category in the aggregation
      categoryFilter = { 'productDetails.category': category };
    }

    // Parallel execution of all analytics queries
    const [
      // 1. Daily Revenue Trends
      dailyRevenue,
      
      // 2. Monthly Revenue Trends
      monthlyRevenue,
      
      // 3. Revenue by Category
      categoryRevenue,
      
      // 4. Revenue by Product
      productRevenue,
      
      // 5. Customer Analytics
      customerAnalytics,
      
      // 6. Payment Method Analysis
      paymentAnalysis,
      
      // 7. Order Size Analysis
      orderSizeAnalysis,
      
      // 8. Growth Metrics
      growthMetrics,
      
      // 9. Top Customers
      topCustomers,
      
      // 10. Revenue Summary
      revenueSummary
      
    ] = await Promise.all([
      
      // 1. Daily Revenue Trends
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate },
            ...(category !== 'all' && { 'items.product': { $exists: true } })
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        ...(category !== 'all' ? [{
          $match: categoryFilter
        }] : []),
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 90 } // Last 90 days max
      ]),
      
      // 2. Monthly Revenue Trends
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: new Date(now.getFullYear() - 2, 0, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
            customers: { $addToSet: '$user' }
          }
        },
        {
          $addFields: {
            uniqueCustomers: { $size: '$customers' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // 3. Revenue by Category
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantity: { $sum: '$items.quantity' },
            orders: { $sum: 1 },
            avgPrice: { $avg: '$items.price' }
          }
        },
        { $sort: { revenue: -1 } }
      ]),
      
      // 4. Top Products by Revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$items.product',
            productName: { $first: '$productDetails.name' },
            category: { $first: '$productDetails.category' },
            mainImage: { $first: '$productDetails.mainImage' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantitySold: { $sum: '$items.quantity' },
            orders: { $sum: 1 },
            avgPrice: { $avg: '$items.price' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      
      // 5. Customer Analytics
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
            firstOrder: { $min: '$createdAt' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $bucket: {
            groupBy: '$totalSpent',
            boundaries: [0, 1000, 5000, 10000, 25000, 50000, 100000, Infinity],
            default: 'Other',
            output: {
              customers: { $sum: 1 },
              totalRevenue: { $sum: '$totalSpent' },
              avgSpent: { $avg: '$totalSpent' }
            }
          }
        }
      ]),
      
      // 6. Payment Method Analysis
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $ne: ['$paymentInfo.razorpayPaymentId', null] },
                'Online Payment',
                'Other'
              ]
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      
      // 7. Order Size Analysis
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $addFields: {
            orderSize: {
              $switch: {
                branches: [
                  { case: { $lt: ['$totalAmount', 500] }, then: '₹0-500' },
                  { case: { $lt: ['$totalAmount', 1000] }, then: '₹500-1,000' },
                  { case: { $lt: ['$totalAmount', 2500] }, then: '₹1,000-2,500' },
                  { case: { $lt: ['$totalAmount', 5000] }, then: '₹2,500-5,000' },
                  { case: { $lt: ['$totalAmount', 10000] }, then: '₹5,000-10,000' }
                ],
                default: '₹10,000+'
              }
            }
          }
        },
        {
          $group: {
            _id: '$orderSize',
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { avgOrderValue: 1 } }
      ]),
      
      // 8. Growth Metrics (Current vs Previous Period)
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())) }
          }
        },
        {
          $group: {
            _id: {
              period: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  'current',
                  'previous'
                ]
              }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            customers: { $addToSet: '$user' }
          }
        },
        {
          $addFields: {
            uniqueCustomers: { $size: '$customers' }
          }
        }
      ]),
      
      // 9. Top Customers
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        {
          $project: {
            customerName: '$userDetails.name',
            customerEmail: '$userDetails.email',
            totalSpent: 1,
            orderCount: 1,
            avgOrderValue: 1,
            lastOrder: 1
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]),
      
      // 10. Revenue Summary
      Order.aggregate([
        {
          $facet: {
            today: [
              {
                $match: {
                  paymentStatus: 'completed',
                  createdAt: { $gte: today }
                }
              },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: '$totalAmount' },
                  orders: { $sum: 1 }
                }
              }
            ],
            thisMonth: [
              {
                $match: {
                  paymentStatus: 'completed',
                  createdAt: { $gte: thisMonth }
                }
              },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: '$totalAmount' },
                  orders: { $sum: 1 }
                }
              }
            ],
            thisYear: [
              {
                $match: {
                  paymentStatus: 'completed',
                  createdAt: { $gte: thisYear }
                }
              },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: '$totalAmount' },
                  orders: { $sum: 1 }
                }
              }
            ],
            allTime: [
              {
                $match: {
                  paymentStatus: 'completed'
                }
              },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: '$totalAmount' },
                  orders: { $sum: 1 }
                }
              }
            ]
          }
        }
      ])
    ]);

    // Calculate growth percentages
    const currentPeriod = growthMetrics.find(g => g._id.period === 'current') || { revenue: 0, orders: 0, uniqueCustomers: 0 };
    const previousPeriod = growthMetrics.find(g => g._id.period === 'previous') || { revenue: 0, orders: 0, uniqueCustomers: 0 };
    
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const growth = {
      revenue: calculateGrowth(currentPeriod.revenue, previousPeriod.revenue),
      orders: calculateGrowth(currentPeriod.orders, previousPeriod.orders),
      customers: calculateGrowth(currentPeriod.uniqueCustomers, previousPeriod.uniqueCustomers)
    };

    // Process revenue summary
    const summary = {
      today: revenueSummary[0]?.today[0] || { revenue: 0, orders: 0 },
      thisMonth: revenueSummary[0]?.thisMonth[0] || { revenue: 0, orders: 0 },
      thisYear: revenueSummary[0]?.thisYear[0] || { revenue: 0, orders: 0 },
      allTime: revenueSummary[0]?.allTime[0] || { revenue: 0, orders: 0 }
    };

    return NextResponse.json({
      success: true,
      timeRange,
      category,
      data: {
        dailyRevenue,
        monthlyRevenue,
        categoryRevenue,
        productRevenue,
        customerAnalytics,
        paymentAnalysis,
        orderSizeAnalysis,
        topCustomers,
        growth,
        summary
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics', details: error.message },
      { status: 500 }
    );
  }
}