"use client"
import { useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const SimpleEcommerceBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  // Carousel slides data - using direct Unsplash CDN images
  const slides = [
    {
      badge: "Office Supply Solutions",
      title: "Complete Your",
      subtitle: "Office Needs",
      description: "Discover our extensive range of office products including stationery, housekeeping supplies, pantry items and COVID safety equipment.",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
      badge: "Office Supply Solutions",
      title: "Complete Your",
      subtitle: "Office Needs",
      description: "Discover our extensive range of office products including stationery, housekeeping supplies, pantry items and COVID safety equipment.",
      image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
      badge: "Office Supply Solutions",
      title: "Complete Your",
      subtitle: "Office Needs",
      description: "Discover our extensive range of office products including stationery, housekeeping supplies, pantry items and COVID safety equipment.",
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
  ]

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, slides.length])

  // Pause autoplay on user interaction, resume after 10 seconds
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  // Handle manual navigation
  const nextSlide = () => {
    pauseAutoPlay()
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    pauseAutoPlay()
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    pauseAutoPlay()
    setCurrentSlide(index)
  }

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] overflow-hidden">
      {/* Background Images (Simple Slider) */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt="Background"
              className="object-cover w-full h-full"
            />
            {/* Responsive overlay */}
            <div className="absolute inset-0 bg-black opacity-20 sm:opacity-25 md:opacity-30"></div>
          </div>
        ))}
      </div>

      {/* Centered Content - Fully responsive */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
        <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-center">
          <div className="text-white">
            {/* Badge - responsive text size */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-1 sm:mb-2">
              {slides[currentSlide].badge}
            </p>
            
            {/* Title - responsive and scalable */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-1 sm:mb-2 leading-tight">
              {slides[currentSlide].title}
            </h2>
            
            {/* Subtitle - responsive and scalable */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
              {slides[currentSlide].subtitle}
            </h3>
            
            {/* Description - responsive with better line height */}
            <p className="mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto leading-relaxed px-2 sm:px-0">
              {slides[currentSlide].description}
            </p>
            
            {/* Button - responsive sizing */}
            <button className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-4 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Responsive sizing */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-1.5 sm:p-2 md:p-3 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-1.5 sm:p-2 md:p-3 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </button>

      {/* Slide indicators - Responsive positioning and sizing */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? "bg-white w-3 sm:w-4 md:w-6" 
                : "bg-white bg-opacity-50 w-1.5 sm:w-2 md:w-2.5"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default SimpleEcommerceBanner