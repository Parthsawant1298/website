"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [availabilityIssues, setAvailabilityIssues] = useState([]);
  
  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  // Order confirmation state
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Fetch cart data
    fetchCart();
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cart');
      }

      if (!data.cart || data.cart.items.length === 0) {
        router.push('/cart');
        return;
      }

      // Check for availability issues in the cart
      const issues = data.cart.items.filter(item => item.hasStockIssue);
      if (issues.length > 0) {
        setAvailabilityIssues(issues);
      }

      setCart(data.cart);
    } catch (error) {
      console.error('Fetch cart error:', error);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'address', 'city', 'state', 'postalCode', 'phone'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        setError(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Phone validation
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Postal code validation for India
    if (!/^\d{6}$/.test(shippingAddress.postalCode)) {
      setError('Please enter a valid 6-digit postal code');
      return false;
    }
    
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    if (availabilityIssues.length > 0) {
      setError('Please remove unavailable items from your cart before proceeding');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Create the order in our backend
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle availability issues if any
        if (data.availabilityIssues) {
          setAvailabilityIssues(data.availabilityIssues);
          throw new Error('Some products in your cart are no longer available in the requested quantity');
        }
        throw new Error(data.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: data.key_id,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'Koncept Services',
        description: 'Office Supplies Order',
        order_id: data.razorpayOrder.id,
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
        },
        handler: function(response) {
          verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        theme: {
          color: '#0d9488',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      // Save order details for confirmation
      setOrderConfirmation(data.order);

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to process checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentId, orderId, signature) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      // Payment was successful
      setSuccess(true);
      // Clear cart and show success message
      setTimeout(() => {
        router.push('/payment-success'); // Redirect to success page
      }, 3000);

    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error.message || 'Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">
              Your order has been processed successfully. You will be redirected to the order confirmation page.
            </p>
            <div className="animate-pulse">
              Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => router.push('/cart')}
          className="mb-6 flex items-center text-teal-600 hover:text-teal-800 transition-colors"
          disabled={isProcessing}
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Cart</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-teal-100">Enter your shipping details to complete your order</p>
            </div>
            
            {error && (
              <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">There was a problem with your checkout</p>
                  <p className="mt-1">{error}</p>
                  
                  {availabilityIssues.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {availabilityIssues.map((issue, index) => (
                        <li key={index}>
                          {issue.name}: {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    disabled={true}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </div>
            
            <div className="p-6">
              {/* Cart Items */}
              <div className="mb-6 space-y-4">
                {cart && cart.items.map((item) => (
                  <div key={item.product?._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden mr-3">
                        <img 
                          src={item.product?.mainImage || "/placeholder.svg"} 
                          alt={item.product?.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">{item.product?.name}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {item.hasStockIssue && (
                          <p className="text-xs text-red-500 font-medium">
                            Only {item.availableQuantity} available
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cart?.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{cart?.totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <div className="mt-8">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || availabilityIssues.length > 0}
                  className="w-full py-3 px-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} className="mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You'll be redirected to Razorpay secure payment page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}