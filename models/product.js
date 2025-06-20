// models/product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide product description']
  },
  price: {
    type: mongoose.Schema.Types.Decimal128, // Changed to support decimal values
    required: [true, 'Please provide product price'],
    get: v => v ? parseFloat(v.toString()) : 0 // Convert to number when retrieved
  },
  originalPrice: {
    type: mongoose.Schema.Types.Decimal128, // Changed to support decimal values
    get: v => v ? parseFloat(v.toString()) : 0 // Convert to number when retrieved
  },
  discount: {
    type: Number,
    default: 0
  },
  images: [
    {
      url: String,
      alt: String
    }
  ],
  mainImage: {
    type: String,
    required: [true, 'Please provide main product image']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide product quantity'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide product category']
  },
  subcategory: {
    type: String,
    required: false,
    default: ''
  },
  tags: [String],
  ratings: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  features: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  strict: false,
  toJSON: { getters: true }, // Apply getters when converting to JSON
  toObject: { getters: true } // Apply getters when converting to Object
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;