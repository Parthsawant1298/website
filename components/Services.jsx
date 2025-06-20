"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

const ProductCategories = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryRows, setCategoryRows] = useState([])
  const [dealsProducts, setDealsProducts] = useState([])
  const [tenPercentDeals, setTenPercentDeals] = useState([])
  const [maxDiscount, setMaxDiscount] = useState(0)

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setIsLoading(true)

        // Fetch all products from database
        const response = await fetch("/api/products")

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        const allProducts = data.products || []

        // Get all products that have images
        const productsWithImages = allProducts.filter(
          (product) => product.mainImage || (product.images && product.images.length > 0),
        )

        if (productsWithImages.length === 0) {
          throw new Error("No products with images found")
        }

        // Get top discounted products sorted by discount percentage (highest to lowest)
        // Filter for products with discount between 30% to 50%
        const topDiscountedProducts = [...productsWithImages]
          .filter((product) => product.discount >= 30 && product.discount <= 50)
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 20)

        setDealsProducts(topDiscountedProducts)

        // Get products with exactly 10% discount
        const tenPercentDiscountProducts = [...productsWithImages]
          .filter((product) => product.discount === 10)
          .sort((a, b) => (a.price || 0) - (b.price || 0)) // Sort by price low to high
          .slice(0, 20)

        setTenPercentDeals(tenPercentDiscountProducts)

        // Find the maximum discount percentage
        const highestDiscount = topDiscountedProducts.length > 0 ? topDiscountedProducts[0].discount : 0
        setMaxDiscount(highestDiscount)

        // Extract unique categories
        const allCategories = [
          ...new Set(productsWithImages.filter((product) => product.category).map((product) => product.category)),
        ].filter(Boolean)

        // Group products by category
        const productsByCategory = {}

        allCategories.forEach((category) => {
          const categoryProducts = productsWithImages.filter((product) => product.category === category).slice(0, 4)
          productsByCategory[category] = categoryProducts
        })

        // Get view all text for specific categories
        const getViewAllText = (category) => {
          const lowerCategory = category.toLowerCase()
          if (lowerCategory.includes("stationary") || lowerCategory.includes("stationery")) {
            return "See all offers"
          } else if (lowerCategory.includes("cleaning")) {
            return "See more"
          } else {
            return "See more"
          }
        }

        // Create category boxes - take first 5 categories (4 for first row, 1 for second row)
        const mainCategories = allCategories.slice(0, 5).map((category) => ({
          id: category, // Use original category name for routing
          title: category,
          viewAllText: getViewAllText(category),
          products: productsByCategory[category] || [],
          loading: false,
        }))

        setCategoryRows([mainCategories])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching categories and products:", error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    fetchCategoriesAndProducts()
  }, [])

  const navigateToProduct = (productId) => {
    router.push(`/products/${productId}`)
  }

  // Format price display based on product and category
  const formatPrice = (product, categoryTitle) => {
    if (!product) return ""

    const categoryLower = categoryTitle?.toLowerCase() || ""

    if (categoryLower.includes("stationery") || categoryLower.includes("stationary")) {
      return `Starting ₹${product.price || 139} | ${product.name?.split(" ")[0] || "TCS"}`
    } else if (categoryLower.includes("disposable")) {
      return `₹${product.price || 201} | ${product.discount ? "REUSABLE" : "REUSABLE"}`
    } else if (categoryLower.includes("mop") || categoryLower.includes("tools")) {
      return `₹${product.price || 412} | Stainless`
    } else if (categoryLower.includes("tissue")) {
      if (product.name?.toLowerCase().includes("automatic")) {
        return `₹${product.price || 6100} | Automatic`
      } else {
        return `₹${product.price || 2299} | LIQUID`
      }
    } else if (categoryLower.includes("cleaning")) {
      return "Cleaning accessories"
    } else {
      return `₹${product.price || 199} | ${product.name?.split(" ")[0] || "Product"}`
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (categoryRows.length === 0) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-gray-500">No product categories available.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* First Row - 4 categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categoryRows[0]?.slice(0, 4).map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 uppercase">{category.title}</h3>
                <a
                  href={`/category/${encodeURIComponent(category.id)}`}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
                >
                  {category.viewAllText}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>

              {category.loading ? (
                <div className="min-h-[200px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                </div>
              ) : category.products.length === 0 ? (
                <div className="min-h-[200px] flex items-center justify-center">
                  <p className="text-gray-500">No products available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {category.products.map((product) => (
                    <div
                      key={product._id}
                      className="cursor-pointer group"
                      onClick={() => navigateToProduct(product._id)}
                    >
                      <div className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden mb-2 p-2 group-hover:border-teal-200 transition-all duration-300">
                        <img
                          src={
                            product.mainImage ||
                            (product.images && product.images[0]?.url) ||
                            "/placeholder.svg?height=80&width=80"
                          }
                          alt={product.name}
                          className="w-full h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-900 font-medium text-center">
                        {formatPrice(product, category.title)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Second Row - 1 category + Deals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left Side - Single Category */}
          <div className="lg:col-span-1">
            {categoryRows[0]?.[4] ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase">{categoryRows[0][4].title}</h3>
                  <a
                    href={`/category/${encodeURIComponent(categoryRows[0][4].id)}`}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
                  >
                    {categoryRows[0][4].viewAllText}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>

                {categoryRows[0][4].loading ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                  </div>
                ) : categoryRows[0][4].products.length === 0 ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <p className="text-gray-500">No products available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {categoryRows[0][4].products.map((product) => (
                      <div
                        key={product._id}
                        className="cursor-pointer group"
                        onClick={() => navigateToProduct(product._id)}
                      >
                        <div className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden mb-2 p-2 group-hover:border-teal-200 transition-all duration-300">
                          <img
                            src={
                              product.mainImage ||
                              (product.images && product.images[0]?.url) ||
                              "/placeholder.svg?height=80&width=80"
                            }
                            alt={product.name}
                            className="w-full h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-xs text-gray-900 font-medium text-center">
                          {formatPrice(product, categoryRows[0][4].title)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Fallback - show cleaning chemicals if no 5th category
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Cleaning Chemicals</h3>
                  <a
                    href="/category/cleaning-chemicals"
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
                  >
                    See more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {dealsProducts.slice(0, 4).map((product) => (
                    <div
                      key={`cleaning-${product._id}`}
                      className="cursor-pointer group"
                      onClick={() => navigateToProduct(product._id)}
                    >
                      <div className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden mb-2 p-2 group-hover:border-teal-200 transition-all duration-300">
                        <img
                          src={
                            product.mainImage ||
                            (product.images && product.images[0]?.url) ||
                            "/placeholder.svg?height=60&width=60"
                          }
                          alt={product.name}
                          className="w-full h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-900 font-medium text-center">Cleaning accessories</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Deals Section (3 columns) */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Special Offers | <span className="text-teal-600">Up to {maxDiscount}% off</span>
                </h2>
                <a href="/products" className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center">
                  See more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>

              <div className="relative">
                <div className="flex overflow-x-auto gap-6 pb-4 px-4 scrollbar-hide">
                  {dealsProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex-shrink-0 w-56 cursor-pointer group"
                      onClick={() => navigateToProduct(product._id)}
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3 p-4 group-hover:shadow-md transition-all duration-300">
                        <div className="relative">
                          <img
                            src={
                              product.mainImage ||
                              (product.images && product.images[0]?.url) ||
                              "/placeholder.svg?height=140&width=140"
                            }
                            alt={product.name}
                            className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.discount > 0 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                              -{product.discount}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center px-2">
                        <p className="text-sm font-medium text-gray-900 mb-2 truncate">{product.name}</p>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 z-10 border border-gray-200"
                  onClick={() => document.querySelector(".scrollbar-hide").scrollBy({ left: -300, behavior: "smooth" })}
                >
                  <ChevronLeft size={16} className="text-gray-700" />
                </button>

                <button
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 z-10 border border-gray-200"
                  onClick={() => document.querySelector(".scrollbar-hide").scrollBy({ left: 300, behavior: "smooth" })}
                >
                  <ChevronRight size={16} className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - 10% Discount Deals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Best Value Deals | <span className="text-orange-600">10% off</span>
            </h2>
            <a href="/products" className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center">
              See more
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>

          {tenPercentDeals.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500">No 10% discount deals available at the moment.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 pb-4 px-4 scrollbar-hide" id="ten-percent-deals">
                {tenPercentDeals.map((product) => (
                  <div
                    key={`ten-percent-${product._id}`}
                    className="flex-shrink-0 w-56 cursor-pointer group"
                    onClick={() => navigateToProduct(product._id)}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3 p-4 group-hover:shadow-md transition-all duration-300">
                      <div className="relative">
                        <img
                          src={
                            product.mainImage ||
                            (product.images && product.images[0]?.url) ||
                            "/placeholder.svg?height=140&width=140"
                          }
                          alt={product.name}
                          className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                          -10%
                        </div>
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <p className="text-sm font-medium text-gray-900 mb-2 truncate">{product.name}</p>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 z-10 border border-gray-200"
                onClick={() => document.getElementById("ten-percent-deals").scrollBy({ left: -300, behavior: "smooth" })}
              >
                <ChevronLeft size={16} className="text-gray-700" />
              </button>

              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 z-10 border border-gray-200"
                onClick={() => document.getElementById("ten-percent-deals").scrollBy({ left: 300, behavior: "smooth" })}
              >
                <ChevronRight size={16} className="text-gray-700" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default ProductCategories