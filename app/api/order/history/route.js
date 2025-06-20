import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';

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
    
    // Find all orders for the user, sorted by most recent first
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate({
        path: 'items.product',
        select: 'name mainImage price' // Only fetch necessary product details
      })
      .lean(); // Convert to plain JavaScript object
    
    return NextResponse.json({
      success: true,
      orders
    });
    
  } catch (error) {
    console.error('Fetch order history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order history', details: error.message },
      { status: 500 }
    );
  }
}