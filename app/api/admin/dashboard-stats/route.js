// app/api/admin/dashboard-stats/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import Product from '@/models/product';
import Order from '@/models/order';

export async function GET() {
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

    // Fetch dashboard statistics
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      revenueData,
      recentProducts,
      recentOrders,
      categoryStats,
      monthlyRevenue
    ] = await Promise.all([
      // Total products count
      Product.countDocuments(),
      
      // Total users count (excluding admins)
      User.countDocuments({ role: { $ne: 'admin' } }),
      
      // Total orders count
      Order.countDocuments(),
      
      // Total revenue from completed orders
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      
      // Recent products (last 5)
      Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name')
        .select('name category subcategory price quantity createdAt mainImage'),
      
      // Recent orders (last 5)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .select('totalAmount status paymentStatus createdAt'),
      
      // Category-wise product distribution
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Monthly revenue for the last 6 months
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calculate additional metrics
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Low stock products (quantity <= 5)
    const lowStockProducts = await Product.countDocuments({ quantity: { $lte: 5, $gt: 0 } });
    
    // Out of stock products
    const outOfStockProducts = await Product.countDocuments({ quantity: 0 });
    
    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Processing orders
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    
    // Recent activity (last 10 activities)
    const recentActivity = [];
    
    // Add recent orders to activity
    const recentOrdersActivity = recentOrders.map(order => ({
      type: 'order',
      description: `New order ₹${order.totalAmount.toLocaleString()} from ${order.user?.name || 'Unknown User'}`,
      timestamp: order.createdAt,
      status: order.status
    }));
    
    // Add recent products to activity
    const recentProductsActivity = recentProducts.map(product => ({
      type: 'product',
      description: `New product "${product.name}" added to ${product.category}`,
      timestamp: product.createdAt,
      status: 'active'
    }));
    
    // Combine and sort activities
    recentActivity.push(...recentOrdersActivity, ...recentProductsActivity);
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        outOfStockProducts,
        pendingOrders,
        processingOrders
      },
      recentProducts,
      recentOrders,
      recentActivity: recentActivity.slice(0, 10),
      categoryStats,
      monthlyRevenue,
      insights: {
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        conversionRate: totalUsers > 0 ? Math.round((totalOrders / totalUsers) * 100) : 0,
        topCategory: categoryStats.length > 0 ? categoryStats[0]._id : 'No products yet'
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}