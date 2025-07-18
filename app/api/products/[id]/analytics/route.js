import { NextResponse } from 'next/server'
import connectDB from '../../../../../lib/mongodb'
import { getProductAnalytics } from '../../../../../lib/reviewAnalysis'
import Review from '../../../../../models/review'

// GET /api/products/[id]/analytics
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // First fetch reviews for this product
    const reviews = await Review.find({ product: id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    // Get product analytics
    const analytics = await getProductAnalytics(reviews, id)
    
    if (!analytics) {
      return NextResponse.json(
        { success: false, error: 'Product not found or no reviews available' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
    
  } catch (error) {
    console.error('Error fetching product analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
