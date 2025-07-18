// app/api/products/[id]/available/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Product from '../../../../../models/product';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    
    await connectDB();
    
    const product = await Product.findById(id)
      .populate('createdBy', 'name email');
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Create a new object with the product data
    const productData = product.toObject();
    
    // Set available quantity to the actual quantity for product display
    // This ensures we don't show reduced stock just because items are in carts
    productData.availableQuantity = product.quantity;
    
    return NextResponse.json({
      success: true,
      product: productData
    });
  } catch (error) {
    console.error('Fetch available product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}