'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);

  // Fetch categories from database - same logic as CategoryGrid
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          // Extract unique categories from products - same logic as CategoryGrid
          const uniqueCategories = [...new Set(data.products.map((product) => product.category))];
          setCategories(uniqueCategories.slice(0, 6)); // Limit to 6 for footer
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    // Navigate to category page using exact same logic as CategoryGrid
    router.push(`/category/${encodeURIComponent(category)}`);
  };

  return (
    <footer className="bg-teal-800 relative">
      {/* Decorative Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700"></div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <svg className="w-10 h-10 mr-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold text-white">
                  Koncept Services
                </h3>
                <span className="text-sm text-teal-100 font-medium">Complete Office Supply Solutions</span>
              </div>
            </div>
            <p className="text-teal-100">Providing professional office supplies including stationery, housekeeping, pantry, IT accessories and COVID safety items. Serving 1800+ clients with 48-hour delivery across Delhi NCR and Pan India.</p>
            <div className="flex items-center space-x-5">
              <a href="#" className="text-white hover:text-teal-200 transition-colors duration-300">
                <Facebook size={22} className="hover:scale-110 transform transition-transform" />
              </a>
              <a href="#" className="text-white hover:text-teal-200 transition-colors duration-300">
                <Twitter size={22} className="hover:scale-110 transform transition-transform" />
              </a>
              <a href="#" className="text-white hover:text-teal-200 transition-colors duration-300">
                <Linkedin size={22} className="hover:scale-110 transform transition-transform" />
              </a>
              <a href="#" className="text-white hover:text-teal-200 transition-colors duration-300">
                <Instagram size={22} className="hover:scale-110 transform transition-transform" />
              </a>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white border-b border-teal-600 pb-2">Our Categories</h4>
            <ul className="space-y-3">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => handleCategoryClick(category)}
                      className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group text-left w-full"
                    >
                      <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                      {category}
                    </button>
                  </li>
                ))
              ) : (
                // Fallback while loading
                <li className="text-teal-100">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white border-b border-teal-600 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/About" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>About Us
                </Link>
              </li>
              <li>
                <Link href="/Contact" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>Contact
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>My Account
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/Faq" className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="mr-2 group-hover:translate-x-1 transition-transform duration-200">→</span>FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white border-b border-teal-600 pb-2">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-teal-100 group">
                <Phone size={18} className="group-hover:text-white" />
                <a 
                  href="tel:+911234567890" 
                  className="group-hover:text-white transition-colors duration-300"
                >
                  +91 1234567890
                </a>
              </div>
              <div className="flex items-center space-x-3 text-teal-100 group">
                <Mail size={18} className="group-hover:text-white" />
                <a 
                  href="mailto:contact@Homeservices.com" 
                  className="group-hover:text-white transition-colors duration-300"
                >
                  contact@Homeservices.com
                </a>
              </div>
              <div className="flex items-start space-x-3 text-teal-100 group">
                <MapPin size={18} className="group-hover:text-white mt-1 flex-shrink-0" />
                <span className="group-hover:text-white transition-colors duration-300">
                  230 Business Hub, Corporate Park,<br />
                  Delhi NCR - 110001
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-teal-700 bg-teal-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-teal-200 text-sm">
              © {currentYear} Koncept Services. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <Link href="/privacy-policy" className="text-teal-200 hover:text-white text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-teal-200 hover:text-white text-sm transition-colors duration-300">
                Terms of Use
              </Link>
              <Link href="/cookie-policy" className="text-teal-200 hover:text-white text-sm transition-colors duration-300">
                Cookie Policy
              </Link>
              {/* Translation Button */}
              <div className="translate-footer-container">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;