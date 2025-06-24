"use client"
import { useEffect, useState, useRef } from "react"

const KonceptServicesBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  // Koncept Services Banner data
  const banners = [
    {
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "HOUSEKEEPING SUPPLY SOLUTIONS DELIVERED IN 48 HOURS",
      buttonText: "EXPLORE PRODUCTS",
      buttonLink: "https://konceptservices.in/products"
    },
    {
      image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "COMPLETE CLEANING & HOUSEKEEPING SUPPLIES",
      buttonText: "VIEW CATALOG",
      buttonLink: "https://konceptservices.in/catalog"
    },
    {
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "SERVING 1800+ SATISFIED CLIENTS ACROSS INDIA",
      buttonText: "CONTACT US",
      buttonLink: "https://konceptservices.in/contact"
    },
    {
      image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "PROFESSIONAL CLEANING CHEMICALS FOR YOUR WORKPLACE",
      buttonText: "CLEANING ITEMS",
      buttonLink: "https://konceptservices.in/cleaning-products"
    },
    {
      image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "DEDICATED RELATIONSHIP MANAGER FOR EACH CLIENT",
      buttonText: "OUR SERVICES",
      buttonLink: "https://konceptservices.in/services"
    }
  ]

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, banners.length])

  // Navigation functions
  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentSlide(index)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + banners.length) % banners.length)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % banners.length)
  }

  return (
    <div className="mb-8 sm:mb-12"> {/* Added top and bottom margin */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden bg-white"> {/* Increased height significantly */}
        {/* Slide images */}
        <div className="absolute inset-0 w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="object-cover w-full h-full"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>
          ))}
        </div>

        {/* Content - Centered instead of right-aligned */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-xl px-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-6">
              {banners[currentSlide].title}
            </h3>
            <a 
              href={banners[currentSlide].buttonLink}
              className="inline-block px-6 py-2 border-2 border-teal-500 text-white bg-teal-500 hover:bg-teal-600 hover:border-teal-600 transition-all duration-300 rounded-md font-medium"
            >
              {banners[currentSlide].buttonText}
            </a>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-teal-200 transition-colors"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-teal-200 transition-colors"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? "w-8 h-2 bg-teal-500" 
                  : "w-2 h-2 bg-white bg-opacity-70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default KonceptServicesBanner