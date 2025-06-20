// app/api/cart/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/cart';
import Product from '@/models/product';

// Get user's cart
export async function GET(request) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        
      );
    }
    
    await connectDB();
    
    // Get cart and populate with product details
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name price mainImage quantity'
      });
    
    // If no cart exists yet, create an empty one
    if (!cart) {
      cart = {
        user: userId,
        items: [],
        _id: 'new-cart'
      };
    }
    
    // Filter out items with null products (products that have been deleted)
    const validItems = cart.items.filter(item => item.product !== null);
    
    // If we found invalid items, update the cart to remove them
    if (cart._id !== 'new-cart' && validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    
    // Calculate total price safely using only valid items
    let totalPrice = 0;
    validItems.forEach(item => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
      }
    });
    
    // Check real-time availability for each item (for checkout validation purposes only)
    const itemsWithAvailability = await Promise.all(validItems.map(async (item) => {
      if (!item.product) return item;
      
      // Just return the item with the available quantity from the product itself
      // This ensures we don't artificially reduce available quantity based on carts
      return {
        ...item.toObject ? item.toObject() : item,
        availableQuantity: item.product.quantity,
        hasStockIssue: item.quantity > item.product.quantity
      };
    }));
    
    return NextResponse.json({
      success: true,
      cart: {
        _id: cart._id,
        items: itemsWithAvailability,
        totalItems: validItems.length,
        totalPrice
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }
}

// Add to cart
export async function POST(request) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { productId, quantity = 1 } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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
    
    // Get current quantity in user's cart
    const currentCart = await Cart.findOne({ user: userId });
    const currentItem = currentCart?.items.find(item => 
      item.product && item.product.toString() === productId
    );
    const currentQuantity = currentItem ? currentItem.quantity : 0;
    
    // Check actual product quantity against requested quantity
    const newTotalQuantity = currentQuantity + quantity;
    if (product.quantity < quantity || product.quantity < newTotalQuantity) {
      return NextResponse.json(
        { 
          error: `Only ${product.quantity} items available in stock. You already have ${currentQuantity} in your cart.`,
          availableQuantity: product.quantity,
          currentCartQuantity: currentQuantity
        },
        { status: 400 }
      );
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product && item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product not in cart, add new item
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    await cart.save();
    
    // Get updated cart with product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price mainImage quantity'
      });
      
    // Filter out items with null products
    const validItems = updatedCart.items.filter(item => item.product !== null);
    
    // Calculate total safely using only valid items
    let totalPrice = 0;
    validItems.forEach(item => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        _id: updatedCart._id,
        items: validItems,
        totalItems: validItems.length,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: error.message },
      { status: 500 }
    );
  }
}