import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/order';

export async function GET(request, { params }) {
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
    
    // Find the specific order for the user
    const order = await Order.findOne({ 
      _id: params.id, 
      user: userId 
    })
    .populate({
      path: 'items.product',
      select: 'name mainImage price description' // More detailed product info
    })
    .lean(); // Convert to plain JavaScript object
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Fetch order details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details', details: error.message },
      { status: 500 }
    );
  }
}