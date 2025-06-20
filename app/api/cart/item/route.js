// app/api/cart/item/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import Product from '@/models/product';

// Update cart item quantity
export async function PUT(request) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        
      );
    }
    
    const { productId, quantity } = await request.json();
    
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check actual available quantity
    if (product.quantity < quantity) {
      return NextResponse.json(
        { 
          error: `Only ${product.quantity} items available in stock`,
          availableQuantity: product.quantity 
        },
        { status: 400 }
      );
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }
    
    // Update the quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Get updated cart with product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price mainImage quantity'
      });
      
    // Calculate total
    let totalPrice = 0;
    updatedCart.items.forEach(item => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
      }
    });
    
    // Add availability information to each item
    const itemsWithAvailability = updatedCart.items.map(item => {
      if (!item.product) return item;
      
      return {
        ...item.toObject ? item.toObject() : item,
        availableQuantity: item.product.quantity,
        hasStockIssue: item.quantity > item.product.quantity
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        _id: updatedCart._id,
        items: itemsWithAvailability,
        totalItems: updatedCart.items.length,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(request) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    // Remove the item from the cart
    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );
    
    await cart.save();
    
    // Get updated cart with product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price mainImage quantity'
      });
      
    // Calculate total
    let totalPrice = 0;
    updatedCart.items.forEach(item => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        totalItems: updatedCart.items.length,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: error.message },
      { status: 500 }
    );
  }
}