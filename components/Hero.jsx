"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const SimpleEcommerceBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  // Carousel slides data - using direct Unsplash CDN images
  const slides = [
    {
      badge: "Housekeeping Supply Solutions",
      title: "Complete Your",
      subtitle: "Cleaning Needs",
      description: "Discover our extensive range of housekeeping products including mop & tools, disposables, stationery and cleaning chemicals for your business.",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
      badge: "Professional Cleaning Solutions",
      title: "Quality",
      subtitle: "Supplies",
      description: "From tissue paper to cleaning chemicals, find everything you need to maintain a spotless and hygienic environment for your workspace.",
      image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
      badge: "One-Stop Housekeeping Shop",
      title: "Premium",
      subtitle: "Products",
      description: "Shop our comprehensive collection of mops, tools, disposables, stationery and cleaning chemicals - all in one convenient location.",
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
    <div className="relative w-full h-56 xs:h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] overflow-hidden">
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
            <div className="absolute inset-0 bg-black opacity-25 sm:opacity-30 md:opacity-35"></div>
          </div>
        ))}
      </div>

      {/* Centered Content - Fully responsive */}
      <div className="relative z-10 flex items-center justify-center h-full px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl text-center">
          <div className="text-white">
            {/* Badge - responsive text size */}
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium mb-1 xs:mb-1.5 sm:mb-2 md:mb-3">
              {slides[currentSlide].badge}
            </p>
            
            {/* Title - responsive and scalable */}
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-0.5 xs:mb-1 sm:mb-1.5 md:mb-2 leading-tight">
              {slides[currentSlide].title}
            </h2>
            
            {/* Subtitle - responsive and scalable */}
            <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight">
              {slides[currentSlide].subtitle}
            </h3>
            
            {/* Description - responsive with better line height */}
            <p className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto leading-relaxed px-1 xs:px-2 sm:px-0">
              {slides[currentSlide].description}
            </p>
            
            {/* Button - responsive sizing */}
            <button className="px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5 bg-white text-gray-800 rounded-full hover:bg-gray-100 font-medium text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Responsive sizing */}
      <button
        onClick={prevSlide}
        className="absolute left-1 xs:left-2 sm:left-3 md:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-1 xs:p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-1 xs:right-2 sm:right-3 md:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-1 xs:p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
      </button>

      {/* Slide indicators - Responsive positioning and sizing */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 xl:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 xs:space-x-1.5 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 xs:h-1.5 sm:h-2 md:h-2.5 lg:h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? "bg-white w-2 xs:w-3 sm:w-4 md:w-5 lg:w-6" 
                : "bg-white bg-opacity-50 w-1 xs:w-1.5 sm:w-2 md:w-2.5 lg:w-3"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default SimpleEcommerceBanner