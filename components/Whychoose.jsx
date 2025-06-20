"use client"

import { Truck, Users, Shield, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function WhyChooseUs() {
  const router = useRouter()

  // Your 5 categories with your exact images
  const categories = [
    {
      name: "MOP & TOOLS",
      image: "/images/why.webp",
      description: "Professional cleaning tools & equipment"
    },
    {
      name: "DISPOSABLES",
      image: "/images/why2.jpeg",
      description: "Single-use office & cleaning supplies"
    },
    {
      name: "STATIONERY",
      image: "/images/why3.png",
      description: "Complete office stationery solutions"
    },
    {
      name: "TISSUE",
      image: "/images/why4.webp",
      description: "Premium quality tissue products"
    },
    {
      name: "CLEANING CHEMICALS",
      image: "/images/why5.webp",
      description: "Professional grade cleaning solutions"
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
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

  const handleCategoryClick = () => {
    router.push('/products')
  }

  const handleContactClick = () => {
    router.push('/Contact')
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose <span className="text-teal-600">Koncept Services</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive office supply solutions with unmatched quality and service
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Main Categories Grid - First 4 categories */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-8 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
          >
            <div className="grid grid-cols-2 gap-1">
              {categories.slice(0, 4).map((category, index) => (
                <div 
                  key={index}
                  className="h-64 relative overflow-hidden group cursor-pointer"
                  onClick={handleCategoryClick}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    style={{
                      imageRendering: 'auto'
                    }}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg" // Fallback image
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 group-hover:from-black/80 transition-all duration-300">
                    <span className="text-white font-bold text-lg">{category.name}</span>
                    <span className="text-gray-200 text-sm mt-1">{category.description}</span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      View Products
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-teal-100">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-teal-600" />
                <span className="text-sm text-teal-700 font-medium">48-hr Delivery Across Delhi NCR</span>
              </div>
              <button 
                onClick={handleCategoryClick}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm"
              >
                Shop Now
              </button>
            </div>
          </motion.div>

          {/* Fifth Category - Large Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
          >
            <div 
              className="h-[32rem] overflow-hidden relative group cursor-pointer"
              onClick={handleCategoryClick}
            >
              <img
                src={categories[4].image}
                alt={categories[4].name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                style={{
                  imageRendering: 'auto'
                }}
                onError={(e) => {
                  e.target.src = "/images/placeholder.jpg" // Fallback image
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 group-hover:from-black/80 transition-all duration-300">
                <span className="text-white text-2xl font-bold">{categories[4].name}</span>
                <p className="text-gray-200 text-sm mt-2 mb-4">{categories[4].description}</p>
                <button className="px-4 py-2 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-all text-sm w-max">
                  View Products
                </button>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </motion.div>

          {/* Trust & Service Cards */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-7 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
          >
            <div className="grid grid-cols-3 gap-1">
              <div 
                className="h-56 relative overflow-hidden group cursor-pointer"
                onClick={handleCategoryClick}
              >
                <img
                  src="/images/service-1.webp"
                  alt="Corporate Solutions"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg" // Fallback image
                  }}
                />
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-white font-medium">Corporate Solutions</span>
                </div>
              </div>
              <div 
                className="h-56 relative overflow-hidden group cursor-pointer"
                onClick={handleCategoryClick}
              >
                <img
                  src="/images/service-2.jpeg"
                  alt="Quality Products"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg" // Fallback image
                  }}
                />
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-white font-medium">Quality Products</span>
                </div>
              </div>
              <div 
                className="h-56 relative overflow-hidden group cursor-pointer"
                onClick={handleCategoryClick}
              >
                <img
                  src="/images/service-3.webp"
                  alt="Fast Delivery"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg" // Fallback image
                  }}
                />
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-white font-medium">Fast Delivery</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-r from-teal-50 to-teal-100 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white border-2 border-teal-100 flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white text-xs">
                  1800+
                </div>
              </div>
              <span className="text-sm text-teal-700 font-medium">Trusted by 1800+ Corporate Clients</span>
            </div>
          </motion.div>

          {/* Special Offer Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-5 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100"
          >
            <div className="p-8 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 text-black">Bulk Orders Welcome!</h3>
              <p className="text-gray-600 mb-6">
                Get special pricing on bulk orders. Perfect for corporate clients and large offices.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-sm text-black">Quality Guaranteed</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-sm text-black">Free Delivery</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-sm text-black">24/7 Support</span>
                </div>
              </div>
              <button 
                onClick={handleContactClick}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-medium w-max"
              >
                Contact
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Truck className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
            <p className="text-gray-600">
              We deliver all orders within 48 hours across Delhi NCR, ensuring your office never runs out of essential
              supplies.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Guaranteed</h3>
            <p className="text-gray-600">
              We source products from trusted brands and manufacturers, ensuring durability and performance for all
              office supplies.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <ThumbsUp className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Satisfaction</h3>
            <p className="text-gray-600">
              Our 99% success rate and 4.5/5 customer satisfaction score reflect our commitment to exceptional service.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}