// components/CategoryPage.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingCart, Share, Search, Filter, X, ChevronDown, Tag, Package, ArrowUpRight, Heart, Sliders, Grid, List, CreditCard } from 'lucide-react';
import Navbar from '@/components/Header';
import Footer from '@/components/Footer';

export default function CategoryPage({ params }) {
  const router = useRouter();
  const { category } = params;
  const decodedCategory = decodeURIComponent(category);
  
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const filterPanelRef = useRef(null);
  
  // Filter states
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [ratings, setRatings] = useState(0); // Minimum rating filter
  const [discount, setDiscount] = useState(false); // Show only discounted items
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [activeFilters, setActiveFilters] = useState(0);
  
  // Animation states
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products in this category
        const response = await fetch(`/api/products?category=${encodeURIComponent(decodedCategory)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products);
        
        // Extract unique subcategories from products
        const uniqueSubcategories = [...new Set(
          data.products
            .filter(product => product.subcategory) // Filter out null or undefined subcategories
            .map(product => product.subcategory)
        )];
        setSubcategories(uniqueSubcategories);
        
        // Extract unique brands
        const uniqueBrands = [...new Set(data.products.map(product => 
          product.brand).filter(Boolean))];
        setBrands(uniqueBrands);
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError('Failed to load category data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedCategory) {
      fetchCategoryData();
    }
    
    // Close filter panel when clicking outside
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
          !event.target.closest('button[data-filter-toggle]')) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [decodedCategory]);
  
  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (selectedSubcategory !== 'all') count++;
    if (searchQuery) count++;
    if (priceRange.min > 0 || priceRange.max < 10000) count++;
    if (ratings > 0) count++;
    if (discount) count++;
    if (showFavoritesOnly) count++;
    if (selectedBrands.length > 0) count++;
    
    setActiveFilters(count);
  }, [selectedSubcategory, searchQuery, priceRange, ratings, discount, showFavoritesOnly, selectedBrands]);

  const handleAddToCart = async (productId) => {
    try {
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

  // Handle Buy Now - add to cart and redirect to checkout
  const handleBuyNow = async (productId) => {
    try {
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

  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name}!`,
        url: window.location.origin + `/products/${product._id}`
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = `${window.location.origin}/products/${product._id}`;
      prompt('Copy this link to share:', shareUrl);
    }
  };
  
  const toggleFavorite = (productId) => {
    let newFavorites;
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter(id => id !== productId);
    } else {
      newFavorites = [...favorites, productId];
      showToast('Added to favorites! Favorites are stored locally on this device.', 'success');
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  
  // Toast notification
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in-up ${
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
  
  // Filter functions
  const filterProducts = useCallback(() => {
    if (!products.length) return [];
    
    return products.filter(product => {
      // Subcategory filter
      if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Price filter
      if (product.price < priceRange.min || product.price > priceRange.max) {
        return false;
      }
      
      // Rating filter
      if (ratings > 0 && product.ratings < ratings) {
        return false;
      }
      
      // Discount filter
      if (discount && (!product.discount || product.discount <= 0)) {
        return false;
      }
      
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(product._id)) {
        return false;
      }
      
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort products
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.ratings - a.ratings;
        case 'popularity':
          return b.numReviews - a.numReviews;
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [products, selectedSubcategory, searchQuery, priceRange, sortBy, ratings, discount, showFavoritesOnly, favorites, selectedBrands]);
  
  const filteredProducts = filterProducts();
  
  // Group products by subcategory
  const groupedProducts = useCallback(() => {
    const grouped = {};
    
    if (selectedSubcategory !== 'all') {
      // If a specific subcategory is selected, only show that one
      const productsInSubcategory = filteredProducts.filter(p => p.subcategory === selectedSubcategory);
      if (productsInSubcategory.length > 0) {
        grouped[selectedSubcategory] = productsInSubcategory;
      }
    } else {
      // Group by all subcategories
      subcategories.forEach(subcategory => {
        const productsInSubcategory = filteredProducts.filter(p => 
          p.subcategory === subcategory
        );
        
        if (productsInSubcategory.length > 0) {
          grouped[subcategory] = productsInSubcategory;
        }
      });
      
      // Handle products without subcategory
      const productsWithoutSubcategory = filteredProducts.filter(p => !p.subcategory);
      
      if (productsWithoutSubcategory.length > 0) {
        grouped["Other"] = productsWithoutSubcategory;
      }
    }
    
    return grouped;
  }, [filteredProducts, selectedSubcategory, subcategories]);
  
  const productsBySubcategory = groupedProducts();
  
  const resetFilters = () => {
    setSelectedSubcategory('all');
    setSearchQuery('');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('newest');
    setRatings(0);
    setDiscount(false);
    setShowFavoritesOnly(false);
    setSelectedBrands([]);
    
    // Animation for filter reset
    setIsFilterAnimating(true);
    setTimeout(() => setIsFilterAnimating(false), 500);
  };
  
  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };
  
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-teal-700 animate-pulse">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !decodedCategory) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <X size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-500 text-lg font-semibold mb-4">{error || "Category not found"}</p>
          <p className="text-gray-600 mb-6">We couldn't load the category. Please try again later.</p>
          <Link href="/">
            <span className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-md inline-block">
              Back to Categories
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pb-16">
        {/* Category Header */}
        <div className="py-6 mb-6">
          <div className="flex items-center mb-4">
            <Link href="/">
              <span className="text-teal-600 hover:text-teal-800">Categories</span>
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-700">{decodedCategory}</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mr-4 bg-white shadow-md border border-gray-200 flex items-center justify-center">
              <span className="text-4xl">{decodedCategory.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{decodedCategory}</h1>
            </div>
          </div>
        </div>
      
        {/* Main content with sidebar layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <Sliders size={18} className="mr-2 text-teal-600" />
                  Filters
                </h2>
                {activeFilters > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Subcategories Section */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Subcategories</h3>
                  <div className="space-y-2">
                    <div 
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedSubcategory === 'all' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedSubcategory('all')}
                    >
                      <Package size={16} className="mr-2" />
                      <span>All subcategories</span>
                    </div>
                    
                    {subcategories.map((subcategory, index) => (
                      <div 
                        key={index}
                        className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedSubcategory === subcategory ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedSubcategory(subcategory)}
                      >
                        <span>{subcategory}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
                  <div className="px-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-full">
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Ratings */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Ratings</h3>
                  <div className="space-y-2">
                    {[0, 4, 3, 2, 1].map((rating) => (
                      <div 
                        key={rating}
                        className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${ratings === rating ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                        onClick={() => setRatings(rating)}
                      >
                        {rating === 0 ? (
                          <span>All Ratings</span>
                        ) : (
                          <>
                            <div className="flex text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  fill={i < rating ? "currentColor" : "none"} 
                                  stroke="currentColor" 
                                />
                              ))}
                            </div>
                            <span>& Up</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Brands */}
                {brands.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Brands</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {brands.map(brand => (
                        <div key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Special Filters */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Special Filters</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="discount-filter"
                        checked={discount}
                        onChange={() => setDiscount(!discount)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="discount-filter" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Discounted Items
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="favorites-filter"
                        checked={showFavoritesOnly}
                        onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="favorites-filter" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Favorites Only
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and filter bar */}
            <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filter toggle (mobile) */}
                <button
                  data-filter-toggle="true"
                  className="lg:hidden flex items-center justify-center space-x-2 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
                  onClick={toggleFilterPanel}
                >
                  <Filter size={18} />
                  <span>Filters {activeFilters > 0 && `(${activeFilters})`}</span>
                </button>
                
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>
                
                {/* View mode toggle */}
                <div className="hidden md:flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile filter panel */}
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex justify-end">
                <div 
                  ref={filterPanelRef}
                  className="w-full max-w-xs bg-white h-full overflow-y-auto shadow-xl animate-slide-in-right"
                >
                  <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <Sliders size={18} className="mr-2 text-teal-600" />
                      Filters
                    </h2>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {/* Subcategories */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Subcategories</h3>
                      <div className="space-y-2">
                        <div 
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedSubcategory === 'all' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedSubcategory('all')}
                        >
                          <Package size={16} className="mr-2" />
                          <span>All subcategories</span>
                        </div>
                        
                        {subcategories.map((subcategory, index) => (
                          <div 
                            key={index}
                            className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${selectedSubcategory === subcategory ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedSubcategory(subcategory)}
                          >
                            <span>{subcategory}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Price Range */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
                      <div className="px-2">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-full">
                            <input
                              type="range"
                              min="0"
                              max="10000"
                              step="100"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Other mobile filters */}
                    {/* Ratings */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Ratings</h3>
                      <div className="space-y-2">
                        {[0, 4, 3, 2, 1].map((rating) => (
                          <div 
                            key={rating}
                            className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${ratings === rating ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}
                            onClick={() => setRatings(rating)}
                          >
                            {rating === 0 ? (
                              <span>All Ratings</span>
                            ) : (
                              <>
                                <div className="flex text-yellow-400 mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={14} 
                                      fill={i < rating ? "currentColor" : "none"} 
                                      stroke="currentColor" 
                                    />
                                  ))}
                                </div>
                                <span>& Up</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Special Filters for mobile */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Special Filters</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="mobile-discount-filter"
                            checked={discount}
                            onChange={() => setDiscount(!discount)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <label htmlFor="mobile-discount-filter" className="ml-2 text-sm text-gray-700 cursor-pointer">
                            Discounted Items
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="mobile-favorites-filter"
                            checked={showFavoritesOnly}
                            onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <label htmlFor="mobile-favorites-filter" className="ml-2 text-sm text-gray-700 cursor-pointer">
                            Favorites Only
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t sticky bottom-0 bg-white flex justify-between">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter chips */}
            <div className={`flex flex-wrap gap-2 mb-6 ${isFilterAnimating ? 'animate-pulse' : ''}`}>
              {selectedSubcategory !== 'all' && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Subcategory: {selectedSubcategory}
                  <button 
                    onClick={() => setSelectedSubcategory('all')}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {searchQuery && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {(priceRange.min > 0 || priceRange.max < 10000) && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Price: ₹{priceRange.min} - ₹{priceRange.max}
                  <button 
                    onClick={() => setPriceRange({ min: 0, max: 10000 })}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {ratings > 0 && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {ratings}+ Stars
                  <button 
                    onClick={() => setRatings(0)}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {discount && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Discounted
                  <button 
                    onClick={() => setDiscount(false)}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {showFavoritesOnly && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Favorites
                  <button 
                    onClick={() => setShowFavoritesOnly(false)}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {selectedBrands.length > 0 && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Brands: {selectedBrands.length}
                  <button 
                    onClick={() => setSelectedBrands([])}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-teal-600 underline text-sm hover:text-teal-800"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            {/* Empty state */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                {products.length === 0 ? (
                  // No products at all in this category
                  <>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No products available</h2>
                    <p className="text-gray-500">There are no products available in this category yet.</p>
                  </>
                ) : (
                  // Products exist but none match filters
                  <>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No products found</h2>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Products by subcategory */
              <div className="space-y-10">
                {Object.entries(productsBySubcategory).map(([subcategory, products]) => (
                  <div key={subcategory} className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Subcategory header */}
                    <div className="bg-gradient-to-r from-teal-500 to-teal-700 p-4 text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold">{subcategory}</h2>
                        <span className="ml-2 text-sm bg-white text-teal-700 px-2 py-0.5 rounded-full">
                          {products.length} items
                        </span>
                      </div>
                      {selectedSubcategory !== subcategory && (
                        <button 
                          onClick={() => setSelectedSubcategory(subcategory)}
                          className="flex items-center text-sm bg-white text-teal-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          View All
                          <ArrowUpRight size={14} className="ml-1" />
                        </button>
                      )}
                    </div>
                    
                    {/* Products grid or list */}
                    <div className="p-4">
                      {viewMode === 'grid' ? (
                        // Grid View
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {products.map(product => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                              <div 
                                className="h-48 bg-gray-100 relative cursor-pointer overflow-hidden"
                                onClick={() => router.push(`/products/${product._id}`)}
                              >
                                <img 
                                  src={product.mainImage || "/placeholder.svg"} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                {product.discount > 0 && (
                                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                    -{product.discount}%
                                  </div>
                                )}
                                
                                {/* Fix: Only show when quantity is available in the product data */}
                                {product.quantity && product.quantity <= 5 && product.quantity > 0 && (
                                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                    Only {product.quantity} left
                                  </div>
                                )}
                                
                                {/* Fix: Only show when quantity is available and it's 0 */}
                                {product.quantity !== undefined && product.quantity <= 0 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Out of Stock</span>
                                  </div>
                                )}
                                
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(product._id);
                                  }}
                                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                >
                                  <Heart 
                                    size={18} 
                                    className={favorites.includes(product._id) ? "text-red-500" : "text-gray-400"} 
                                    fill={favorites.includes(product._id) ? "currentColor" : "none"} 
                                  />
                                </button>
                              </div>
                              
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">{product.brand || 'Generic'}</span>
                                  {product.isNew && (
                                    <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">New</span>
                                  )}
                                </div>
                                
                                <h2 
                                  className="text-lg font-semibold text-gray-900 mb-1 truncate cursor-pointer group-hover:text-teal-600 transition-colors"
                                  onClick={() => router.push(`/products/${product._id}`)}
                                >
                                  {product.name}
                                </h2>
                                
                                <div className="flex items-center mb-2">
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        size={16} 
                                        fill={i < Math.floor(product.ratings || 0) ? "currentColor" : "none"} 
                                        stroke="currentColor" 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</span>
                                </div>
                                
                                <div className="flex items-center mb-3">
                                  <span className="text-xl font-bold text-gray-900">₹{product.price?.toLocaleString() || 0}</span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {product.description}
                                </p>
                                
                                <div className="flex space-x-2">
                                  {/* Fix: Remove disabled attribute to fix the disabled buttons issue */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product._id);
                                    }}
                                    className="flex-1 text-sm py-2 px-2 rounded-md flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                                  >
                                    <ShoppingCart size={16} className="mr-1" />
                                    Cart
                                  </button>
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBuyNow(product._id);
                                    }}
                                    className="flex-1 text-sm py-2 px-2 rounded-md flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                                  >
                                    <CreditCard size={16} className="mr-1" />
                                    Buy
                                  </button>
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(product);
                                    }}
                                    className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                  >
                                    <Share size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // List View
                        <div className="space-y-4">
                          {products.map(product => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col sm:flex-row">
                              <div 
                                className="h-48 sm:h-auto sm:w-48 bg-gray-100 relative cursor-pointer overflow-hidden flex-shrink-0"
                                onClick={() => router.push(`/products/${product._id}`)}
                              >
                                <img 
                                  src={product.mainImage || "/placeholder.svg"} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                {product.discount > 0 && (
                                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                    -{product.discount}%
                                  </div>
                                )}
                                
                                {/* Fix: Only show when quantity is available in the product data */}
                                {product.quantity && product.quantity <= 5 && product.quantity > 0 && (
                                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                    Only {product.quantity} left
                                  </div>
                                )}
                                
                                {/* Fix: Only show when quantity is available and it's 0 */}
                                {product.quantity !== undefined && product.quantity <= 0 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Out of Stock</span>
                                  </div>
                                )}
                                
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(product._id);
                                  }}
                                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                >
                                  <Heart 
                                    size={18} 
                                    className={favorites.includes(product._id) ? "text-red-500" : "text-gray-400"} 
                                    fill={favorites.includes(product._id) ? "currentColor" : "none"} 
                                  />
                                </button>
                              </div>
                              
                              <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">{product.brand || 'Generic'}</span>
                                  {product.isNew && (
                                    <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">New</span>
                                  )}
                                </div>
                                
                                <h2 
                                  className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer group-hover:text-teal-600 transition-colors"
                                  onClick={() => router.push(`/products/${product._id}`)}
                                >
                                  {product.name}
                                </h2>
                                
                                <div className="flex items-center mb-2">
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        size={16} 
                                        fill={i < Math.floor(product.ratings || 0) ? "currentColor" : "none"} 
                                        stroke="currentColor" 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 flex-grow">
                                  {product.description}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center">
                                    <span className="text-xl font-bold text-gray-900">₹{product.price?.toLocaleString() || 0}</span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                      <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
                                    )}
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    {/* Fix: Remove disabled attribute to fix the disabled buttons issue */}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product._id);
                                      }}
                                      className="text-sm py-2 px-3 rounded-md flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                                    >
                                      <ShoppingCart size={16} className="mr-1" />
                                      Add to Cart
                                    </button>
                                    
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleBuyNow(product._id);
                                      }}
                                      className="text-sm py-2 px-3 rounded-md flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                                    >
                                      <CreditCard size={16} className="mr-1" />
                                      Buy Now
                                    </button>
                                    
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare(product);
                                      }}
                                      className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                      <Share size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
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
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }
      `}</style>
      
      <Footer />
    </div>
  );
}