// app/api/admin/alerts/route.js
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

    // Get various alerts and notifications
    const [
      lowStockProducts,
      outOfStockProducts,
      pendingOrders,
      recentUsers,
      failedOrders
    ] = await Promise.all([
      // Products with low stock (quantity <= 5 but > 0)
      Product.find({ 
        quantity: { $lte: 5, $gt: 0 } 
      })
      .select('name quantity category price mainImage')
      .sort({ quantity: 1 })
      .limit(10),
      
      // Products that are out of stock
      Product.find({ quantity: 0 })
      .select('name category price mainImage createdAt')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // Orders that need attention (pending status)
      Order.find({ 
        status: 'pending',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
      .populate('user', 'name email')
      .select('totalAmount createdAt status user')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // Recent user registrations (last 7 days)
      User.find({ 
        role: 'user',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // Failed payment orders
      Order.find({ 
        paymentStatus: 'failed',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('user', 'name email')
      .select('totalAmount createdAt paymentStatus user')
      .sort({ createdAt: -1 })
      .limit(5)
    ]);

    // Calculate alert counts
    const alertCounts = {
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      pendingOrders: pendingOrders.length,
      newUsers: recentUsers.length,
      failedPayments: failedOrders.length
    };

    // Total alerts count
    const totalAlerts = Object.values(alertCounts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      alertCounts,
      totalAlerts,
      alerts: {
        lowStockProducts,
        outOfStockProducts,
        pendingOrders,
        recentUsers,
        failedOrders
      }
    });

  } catch (error) {
    console.error('Admin alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    );
  }
}