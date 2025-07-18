import connectDB from '@/lib/mongodb';
import Order from '@/models/order';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Await cookies store
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the most recent order for the user
    const order = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate('items.product') // Populate product details
      .lean(); // Convert to plain JavaScript object
    
    if (!order) {
      return NextResponse.json(
        { error: 'No recent orders found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Fetch recent order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent order', details: error.message },
      { status: 500 }
    );
  }
}