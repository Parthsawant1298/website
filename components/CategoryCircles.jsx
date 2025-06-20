"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function CategoryGrid() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Hardcoded image paths array - will be mapped to categories in order
  const categoryImages = [
    "/images/OIP2.jpeg",
    "/images/OIP.jpeg",
    "/images/OIP3.jpeg",
    "/images/OIP4.jpg",
    "/images/OIP5.jpeg",
    "/images/OIP2.jpg",
    "/images/OIP2.jpg",
    "/images/OIP2.jpg",
    "/images/OIP2.jpg",
    "/images/OIP2.jpg",
    "/images/OIP2.jpg",
    "/images/OIP2.jpg",
    // Add more paths as needed based on the number of categories you expect
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Fetch products to extract unique categories
        const response = await fetch("/api/products")

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()

        // Extract unique categories from products
        const uniqueCategories = [...new Set(data.products.map((product) => product.category))]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Failed to load categories. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (category) => {
    // Navigate to the category detail page
    router.push(`/category/${encodeURIComponent(category)}`)
  }

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 flex justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Get only the first 5 categories for the grid layout (3 in first row, 2 in second row)
  const displayCategories = categories.slice(0, 5)

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Card animation variants
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl font-bold text-center mb-12 text-gray-800"
        >
          Browse <span className="text-teal-600">Categories</span>
        </motion.h2>

        {/* First row - 3 equal sized cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"
        >
          {displayCategories.slice(0, 3).map((category, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative h-56">
                {/* FAST IMAGE - Added lazy loading and optimizations */}
                <img
                  src={categoryImages[index] || "/images/default.jpg"}
                  alt={category}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  style={{
                    imageRendering: 'auto'
                  }}
                />
                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/80">Explore</span>
                  <h3 className="text-2xl font-bold text-white uppercase">{category}</h3>
                  <button className="mt-3 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium w-max hover:bg-teal-50 transition-colors">
                    Browse
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Second row - 2 large cards */}
        {displayCategories.length > 3 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {displayCategories.slice(3, 5).map((category, index) => (
              <motion.div
                key={index + 3}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="relative h-64">
                  <img
                    src={categoryImages[index + 3] || "/images/default.jpg"}
                    alt={category}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={{
                      imageRendering: 'auto'
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <span className="text-xs font-medium uppercase tracking-wider text-white/80">Featured</span>
                    <h3 className="text-2xl font-bold text-white uppercase">{category}</h3>
                    <button className="mt-3 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium w-max hover:bg-teal-50 transition-colors">
                      Browse
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional categories if there are more than 5 - using circles */}
        {categories.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-16"
          >
            <h3 className="text-2xl font-semibold mb-8 text-center text-gray-800">More Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 mt-6">
              {categories.slice(5).map((category, index) => (
                <motion.div
                  key={index + 5}
                  whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center cursor-pointer transition-all"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-white shadow-md border border-gray-200 flex items-center justify-center hover:shadow-lg hover:border-teal-300 transition-all">
                    {/* Display image if available, otherwise fallback to first letter */}
                    <img
                      src={categoryImages[index + 5] || null}
                      alt={category}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      style={{
                        imageRendering: 'auto'
                      }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.parentNode.innerHTML = `<span class="text-4xl font-bold text-gray-800">${category.charAt(0).toUpperCase()}</span>`
                      }}
                    />
                  </div>
                  <h3 className="text-center font-medium text-gray-800">{category}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}