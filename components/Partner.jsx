export default function Partner() {
  return (
    <main>
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-white via-teal-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold mb-4 md:mb-6 text-gray-900 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">Premium</span> Partnerships
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mx-auto max-w-2xl lg:max-w-3xl leading-relaxed px-4">
              We collaborate with industry-leading brands to deliver exceptional quality products for all your office needs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Content Section */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-gray-100 min-h-[500px] sm:min-h-[600px] lg:h-[700px] flex flex-col hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 order-2 lg:order-1">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Our Trusted Brand Partners</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
                  At Koncept Services, we carefully select premium brands to ensure you receive only the highest quality products
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 flex-1 py-2">
                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-teal-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-teal-600 group-hover:to-teal-700 shadow-lg flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-teal-700 text-xs sm:text-sm mb-1 truncate">Sarya Mystair Hygiene Pvt Ltd</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Premium tissue papers, rolls, M-fold and specialized hygiene products</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-teal-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-teal-600 group-hover:to-teal-700 shadow-lg flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-teal-700 text-xs sm:text-sm mb-1 truncate">Roots Multiichem Pvt Ltd</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">High-quality cleaning machines, mops, tools and advanced cleaning solutions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-teal-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-teal-600 group-hover:to-teal-700 shadow-lg flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-teal-700 text-xs sm:text-sm mb-1 truncate">Divesey India Pvt Ltd</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Professional-grade cleaning chemicals for commercial and office environments</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-teal-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-teal-600 group-hover:to-teal-700 shadow-lg flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-teal-700 text-xs sm:text-sm mb-1 truncate">Hindustan Unilever</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Trusted housekeeping and cleaning essentials including Domex, Lifebuoy, and Vim</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-teal-50/50 p-3 sm:p-4 rounded-lg md:rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold group-hover:from-teal-600 group-hover:to-teal-700 shadow-lg flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-teal-700 text-xs sm:text-sm mb-1 truncate">Kent & Borosil</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Premium household items and elegant office utensils with durability guaranteed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Image Layout */}
            <div className="relative flex items-center justify-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] order-1 lg:order-2">
              <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px]">
                
                {/* Top Left Image - Office Environment - LARGEST */}
                <div className="absolute top-0 left-0 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-lg md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="/images/OIP.jpeg"
                    alt="Modern office environment"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Top Right Image - Cleaning Products - SMALL */}
                <div className="absolute top-2 sm:top-4 md:top-8 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="/images/OIP2.jpeg"
                    alt="Cleaning products and supplies"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Left Image - Office Stationery - SMALL */}
                <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 left-2 sm:left-4 md:left-8 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="/images/OIP3.jpeg"
                    alt="Office stationery and supplies"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Right Image - Mops and Cleaning Tools - LARGEST */}
                <div className="absolute bottom-0 right-0 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-lg md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 md:hover:-translate-y-2 z-10 border-2 md:border-4 border-white">
                  <img
                    src="/images/OIP4.jpg"
                    alt="Professional cleaning tools and mops"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Enhanced Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white rounded-full shadow-lg md:shadow-2xl border-4 md:border-8 border-teal-100 flex items-center justify-center z-30 hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-full flex items-center justify-center shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-300">
                    <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wider drop-shadow-lg">K</span>
                  </div>
                </div>

                {/* Decorative Elements - Hide on mobile */}
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-4 h-4 md:w-8 md:h-8 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full opacity-60 animate-pulse hidden sm:block"></div>
                <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 w-3 h-3 md:w-6 md:h-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full opacity-60 animate-pulse hidden sm:block"></div>
                <div className="absolute top-1/4 -left-3 md:-left-6 w-2 h-2 md:w-4 md:h-4 bg-gradient-to-r from-teal-300 to-teal-400 rounded-full opacity-40 animate-pulse hidden sm:block"></div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}