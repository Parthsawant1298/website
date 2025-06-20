"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, AlertCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await fetch('/api/order/history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }
        
        const data = await response.json();
        setOrders(data.orders);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Determine order status color and icon - Updated for 3 statuses only
  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'processing':
        return { 
          color: 'text-blue-500', 
          icon: <Package className="mr-2" size={20} /> 
        };
      case 'delivered':
        return { 
          color: 'text-green-500', 
          icon: <CheckCircle className="mr-2" size={20} /> 
        };
      case 'payment failed':
        return { 
          color: 'text-red-500', 
          icon: <XCircle className="mr-2" size={20} /> 
        };
      default:
        return { 
          color: 'text-gray-500', 
          icon: <Package className="mr-2" size={20} /> 
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-lg animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Fetch Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping and your order history will appear here.
          </p>
          <Link 
            href="/products"
            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
         <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="text-teal-600 hover:text-teal-800 transition-colors flex items-center"
        >
          <ArrowLeft size={20} className="mr-2"/>
          Back to Main
        </Link>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-teal-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-teal-100">Review your past orders and their current status</p>
          </div>

          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className={`flex items-center ${getOrderStatusStyle(order.status).color}`}>
                    {getOrderStatusStyle(order.status).icon}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => {
                    // Add null check for product
                    if (!item.product) {
                      return (
                        <div 
                          key={item._id} 
                          className="flex items-center space-x-4 hover:bg-gray-100 p-2 rounded-lg transition-colors text-gray-500"
                        >
                          Product Unavailable
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={item._id} 
                        className="flex items-center space-x-4 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                      >
                        <div className="relative w-20 h-20 shrink-0">
                          <Image 
                            src={item.product.mainImage || '/default-product-image.png'} 
                            alt={item.product.name || 'Product'}
                            fill
                            className="object-cover rounded-md"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              e.target.src = '/default-product-image.png';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.product.name || 'Unnamed Product'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} | 
                            Price: {formatCurrency(item.price)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-between items-center border-t pt-4">
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-teal-600">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <Link 
                  href={`/order/${order._id}`} 
                  className="mt-4 w-full flex items-center justify-center text-teal-600 hover:text-teal-800 transition-colors"
                >
                  View Order Details
                  <ChevronRight size={20} className="ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}