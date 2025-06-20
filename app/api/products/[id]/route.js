// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/product';
import mongoose from 'mongoose';

export async function GET(request, context) {
  try {
    // Safely extract the ID parameter
    const params = context.params;
    if (!params || !params.id) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const { id } = params;
    
    // Validate if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Try to find the product with proper error handling
    let product;
    try {
      product = await Product.findById(id)
        .populate('createdBy', 'name email');
    } catch (queryError) {
      console.error('Product query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to query product' },
        { status: 500 }
      );
    }
    
    // Check if product exists
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Return successful response
    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}