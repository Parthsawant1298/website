// app/api/reviews/upload-images/route.js
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function using Cloudinary's upload API for review images
const uploadToCloudinary = async (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const streamifier = require('streamifier');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'review-images',
        resource_type: 'auto',
        public_id: `review_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        transformation: [
          { width: 800, height: 600, crop: 'limit' }, // Limit size to reduce storage
          { quality: 'auto:good' }, // Auto quality optimization
          { fetch_format: 'auto' } // Auto format optimization
        ]
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
    // Get user ID from cookies for authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();
    const files = formData.getAll('images'); // Multiple files

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images uploaded' },
        { status: 400 }
      );
    }

    // Validate number of images (max 5)
    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    // Process each image
    for (const file of files) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Image ${file.name} is too large. Maximum size is 5MB` },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(buffer, file.name);
        
        uploadedImages.push({
          url: uploadResult.secure_url,
          filename: file.name,
          uploadedAt: new Date()
        });
      } catch (uploadError) {
        console.error('Upload error for file:', file.name, uploadError);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload images error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
