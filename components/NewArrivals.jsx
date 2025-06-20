// components/NewArrivals.jsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Heart, CreditCard } from 'lucide-react';

export default function NewArrivals() {
  const router = useRouter();
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(1);
  const carouselRef = useRef(null);

  // Update itemsToShow based on screen size
  useEffect(() => {
    const updateItemsToShow = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsToShow(1); // Mobile: 1 product
      } else if (width < 768) {
        setItemsToShow(2); // Small tablet: 2 products
      } else if (width < 1200) {
        setItemsToShow(3); // Medium screens: 3 products
      } else {
        setItemsToShow(4); // Large desktop: 4 products
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all products
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Sort products by createdAt date (newest first)
        // Assuming each product has a createdAt field from the database
        const sortedProducts = data.products
          .sort((a, b) => {
            // If createdAt is available, sort by it (newest first)
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // If _id is MongoDB ObjectId, we can use it as fallback since it contains timestamp
            return b._id > a._id ? 1 : -1;
          });
          
        // Get the 10 newest products
        const newest = sortedProducts.slice(0, 10);
        setNewArrivals(newest);
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Calculate card width based on container and items to show
  const getCardWidth = () => {
    if (typeof window === 'undefined') return '100%';
    
    const containerPadding = window.innerWidth < 640 ? 64 : window.innerWidth < 1200 ? 96 : 160;
    const gap = window.innerWidth < 640 ? 16 : 24; // gap-4 or gap-6
    const availableWidth = window.innerWidth - containerPadding;
    const totalGaps = (itemsToShow - 1) * gap;
    const cardWidth = (availableWidth - totalGaps) / itemsToShow;
    
    // Set minimum and maximum card widths for better consistency
    let minWidth, maxWidth;
    
    if (window.innerWidth < 640) {
      // Mobile
      minWidth = 280;
      maxWidth = 350;
    } else if (window.innerWidth < 1200) {
      // Tablet and medium screens
      minWidth = 220;
      maxWidth = 280;
    } else {
      // Large desktop - optimized for wider container
      minWidth = 260;
      maxWidth = 320;
    }
    
    return Math.max(minWidth, Math.min(maxWidth, Math.floor(cardWidth)));
  };

  // Carousel navigation functions
  const scrollNext = () => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth();
      const gap = window.innerWidth < 640 ? 16 : 24;
      const scrollDistance = (cardWidth + gap) * itemsToShow;
      
      carouselRef.current.scrollBy({
        left: scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth();
      const gap = window.innerWidth < 640 ? 16 : 24;
      const scrollDistance = (cardWidth + gap) * itemsToShow;
      
      carouselRef.current.scrollBy({
        left: -scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (!response.ok) {
        return false
      }
      const userData = await response.json()
      return !!userData.user
    } catch (error) {
      return false
    }
  }

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      // Check if user is logged in
      const isLoggedIn = await checkAuth()
      if (!isLoggedIn) {
        router.push('/Login')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      // Show toast notification
      showToast('Product added to cart!', 'success');
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast(error.message || 'Failed to add to cart', 'error');
    }
  };

  const handleBuyNow = async (productId, e) => {
    e.stopPropagation();
    try {
      // Check if user is logged in
      const isLoggedIn = await checkAuth()
      if (!isLoggedIn) {
        router.push('/Login')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
      showToast(error.message || 'Failed to process. Please try again.', 'error');
    }
  };

  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    let newFavorites;
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter(id => id !== productId);
    } else {
      newFavorites = [...favorites, productId];
      showToast('Added to favorites!', 'success');
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // Toast notification
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in-up text-sm sm:text-base ${
      type === 'success' ? 'bg-teal-600' : 
      type === 'error' ? 'bg-red-600' : 
      'bg-blue-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Product card component
  const ProductCard = ({ product }) => {
    const cardWidth = getCardWidth();
    
    return (
      <div 
        key={product._id} 
        className="flex-shrink-0 snap-start bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-[360px] sm:h-[380px] lg:h-[400px] flex flex-col"
        style={{ width: `${cardWidth}px` }}
        onClick={() => router.push(`/products/${product._id}`)}
      >
        <div className="h-40 sm:h-48 lg:h-52 bg-gray-100 relative cursor-pointer overflow-hidden">
          <img 
            src={product.mainImage || "/placeholder.svg"} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            style={{
              imageRendering: 'auto'
            }}
          />
          
          {/* New tag for emphasizing it's a new arrival */}
          <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            NEW
          </div>
          
          {product.discount > 0 && (
            <div className="absolute top-2 left-12 sm:left-16 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              -{product.discount}%
            </div>
          )}
          
          <button 
            onClick={(e) => toggleFavorite(product._id, e)}
            className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Heart 
              size={16} 
              className={favorites.includes(product._id) ? "text-red-500" : "text-gray-400"} 
              fill={favorites.includes(product._id) ? "currentColor" : "none"} 
            />
          </button>
        </div>
        
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor(product.ratings || 0) ? "currentColor" : "none"} 
                    stroke="currentColor" 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</span>
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
            
            <div className="flex items-center mb-3">
              <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.price?.toLocaleString() || 0}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-auto">
            <button 
              onClick={(e) => handleAddToCart(product._id, e)}
              className="flex-1 text-xs sm:text-sm py-2 px-2 rounded-md flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              <ShoppingCart size={14} className="mr-1" />
              <span className="hidden sm:inline">Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
            
            <button 
              onClick={(e) => handleBuyNow(product._id, e)}
              className="flex-1 text-xs sm:text-sm py-2 px-2 rounded-md flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <CreditCard size={14} className="mr-1" />
              Buy
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 flex justify-center px-4">
        <p className="text-red-500 text-center text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  if (newArrivals.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(newArrivals.length / itemsToShow);

  return (
    <div className="py-4 sm:py-6 md:py-10 bg-gradient-to-br from-teal-50 via-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl lg:max-w-[1580px]">
        {/* Title at the top */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            New <span className="text-teal-600">Arrivals</span>
          </h2>
        </div>
        
        {/* Products carousel with navigation arrows on sides */}
        <div className="relative">
          {/* Left arrow - Show on all screen sizes */}
          <button 
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-all duration-300 -ml-6 lg:-ml-12"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          
          {/* Right arrow - Show on all screen sizes */}
          <button 
            onClick={scrollNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-all duration-300 -mr-6 lg:-mr-12"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
          
          {/* Products container */}
          <div className="mx-8 lg:mx-16">
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 lg:gap-8 pb-4 hide-scrollbar snap-x snap-mandatory"
            >
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation dots for mobile */}
        <div className="flex justify-center mt-4 space-x-2 sm:hidden">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsToShow) === index ? 'bg-teal-500' : 'bg-gray-300'
              }`}
              onClick={() => {
                if (carouselRef.current) {
                  const cardWidth = getCardWidth();
                  const gap = 16;
                  const scrollDistance = (cardWidth + gap) * itemsToShow * index;
                  carouselRef.current.scrollTo({
                    left: scrollDistance,
                    behavior: 'smooth'
                  });
                }
              }}
            />
          ))}
        </div>
      </div>
      
      {/* CSS for animations and hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}