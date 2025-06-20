// app/api/products/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/product';
import User from '@/models/user';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function for multiple images
const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const streamifier = require('streamifier');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export async function POST(request) {
  try {
    // Get user ID from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
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
    
    // Verify user exists
    let user;
    try {
      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    } catch (userError) {
      console.error('User query error:', userError);
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      );
    }

    // Get form data from request
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Form parsing error:', formError);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }
    
    const name = formData.get('name');
    const description = formData.get('description');
    const price = parseFloat(formData.get('price'));
    const originalPrice = parseFloat(formData.get('originalPrice') || price);
    const quantity = parseInt(formData.get('quantity'));
    const category = formData.get('category');
    const subcategory = formData.get('subcategory'); // Added subcategory field
    const features = formData.get('features')?.split(',').map(item => item.trim()).filter(Boolean) || [];
    const tags = formData.get('tags')?.split(',').map(item => item.trim()).filter(Boolean) || [];
    
    // Debug log
    console.log("Product data received:", { name, category, subcategory });
    
    // Validate required fields
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory is required' },
        { status: 400 }
      );
    }
    
    // Get all image files
    const imageFiles = [];
    for (let i = 0; i < 10; i++) { // Limit to 10 images max
      const image = formData.get(`image${i}`);
      if (image && image instanceof File) {
        imageFiles.push(image);
      }
    }
    
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Upload all images to Cloudinary
    let uploadResults;
    try {
      const imagePromises = imageFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return uploadToCloudinary(buffer);
      });
      
      uploadResults = await Promise.all(imagePromises);
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload product images' },
        { status: 500 }
      );
    }
    
    // Format the image data
    const images = uploadResults.map(result => ({
      url: result.secure_url,
      alt: name
    }));
    
    // Create new product
    console.log("About to create product with subcategory:", subcategory);
    const productData = {
      name,
      description,
      price,
      originalPrice,
      discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      images,
      mainImage: images[0].url, // First image is the main image
      quantity,
      category,
      subcategory: subcategory, // Explicitly setting subcategory 
      features,
      tags,
      createdBy: userId
    };
    
    console.log("Product data before creation:", JSON.stringify(productData));
    
    let product;
    try {
      product = await Product.create(productData);
    } catch (createError) {
      console.error('Product creation database error:', createError);
      return NextResponse.json(
        { error: 'Failed to save product to database', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}

// GET method to fetch all products
export async function GET(request) {
  try {
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
    
    // Get query parameters
    let searchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (urlError) {
      console.error('URL parsing error:', urlError);
      return NextResponse.json(
        { error: 'Failed to parse request URL' },
        { status: 400 }
      );
    }
    
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    // Build query object
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    
    // Query products with error handling
    let products;
    try {
      products = await Product.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('createdBy', 'name'); // Include seller's name
    } catch (queryError) {
      console.error('Product query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to query products' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}