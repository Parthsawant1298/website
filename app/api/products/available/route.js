// app/api/products/available/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/product';
import User from '@/models/user';

export async function GET() {
  try {
    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed' 
        },
        { status: 500 }
      );
    }

    // Fetch products with error handling
    let products;
    try {
      products = await Product.find()
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name');
    } catch (queryError) {
      console.error('Product query error:', queryError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to query products' 
        },
        { status: 500 }
      );
    }

    // Map products with their full details
    const productsWithAvailability = products.map(product => {
      const productObj = product.toObject();
      
      return {
        _id: productObj._id,
        name: productObj.name,
        description: productObj.description,
        price: productObj.price,
        originalPrice: productObj.originalPrice,
        discount: productObj.discount,
        images: productObj.images,
        mainImage: productObj.mainImage,
        quantity: productObj.quantity,
        category: productObj.category,
        subcategory: productObj.subcategory,
        tags: productObj.tags,
        ratings: productObj.ratings,
        numReviews: productObj.numReviews,
        features: productObj.features,
        createdBy: productObj.createdBy,
        createdAt: productObj.createdAt,
        availableQuantity: productObj.quantity // Show the actual quantity, not reduced by carts
      };
    });
    
    return NextResponse.json({
      success: true,
      count: productsWithAvailability.length,
      products: productsWithAvailability
    });
  } catch (error) {
    console.error('Fetch available products error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}