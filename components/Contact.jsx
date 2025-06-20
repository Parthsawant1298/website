"use client";
import { Box, Mail, MapPin, Phone, Package, Shield, Clock } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Error submitting form:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[20rem] sm:h-[25rem] md:h-[35rem] overflow-hidden bg-gradient-to-r from-teal-50 to-teal-100">
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-20 h-full">
          <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center mb-2 md:mb-4">
              CONTACT
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700"> US</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <main className="flex-grow bg-gradient-to-br from-teal-50 via-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Contact Information */}
            <div className="space-y-8 md:space-y-12">
              <div>
                <h3 className="text-teal-600 text-base md:text-lg mb-2 md:mb-3">Complete Office Supply Solutions</h3>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  Connect with 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700"> Koncept Services</span>
                </h2>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Founded in 2012, Koncept Services has emerged as a renowned name in the market supplying all types of office products according to your office requirements. We supply over 90% of office needs under one roof with delivery within 24 working hours across Delhi NCR and Pan India.
                </p>
              </div>

              <div className="space-y-6 md:space-y-10">
                {[
                  { 
                    title: 'Next Day Delivery',
                    content: 'Our team is always ready to supply your requirements within 24 working hours across Delhi NCR and Pan India.',
                    icon: <Clock className="text-teal-600" size={24} />
                  },
                  { 
                    title: 'Quality Assurance',
                    content: 'We partner with renowned brands to ensure all products meet the highest quality standards for your office needs.',
                    icon: <Shield className="text-teal-600" size={24} />
                  },
                  { 
                    title: 'Comprehensive Product Range',
                    content: 'From housekeeping materials and office stationery to pantry supplies and IT accessories - all under one roof.',
                    icon: <Package className="text-teal-600" size={24} />
                  }
                ].map(({ title, content, icon }) => (
                  <div key={title} className="flex items-start space-x-4 md:space-x-6">
                    <div className="mt-1">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 md:mb-2 text-teal-600 text-base md:text-lg">{title}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Phone className="text-teal-600" size={20} />
                  <p className="text-gray-700">+91 98765 43210</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-teal-600" size={20} />
                  <p className="text-gray-700">support@konceptservices.in</p>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="text-teal-600" size={20} />
                  <p className="text-gray-700">Delhi NCR, India</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-teal-100 mt-4 md:mt-7">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request a Quote</h3>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  Sorry, there was an error sending your message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                    required
                    disabled={isLoading}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                  required
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                  required
                  disabled={isLoading}
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your requirements and how we can help"
                  rows="4"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 resize-none text-sm md:text-base"
                  required
                  disabled={isLoading}
                ></textarea>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Sending...' : 'Request Quote'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Product Categories Section */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "MOP & TOOLS",
                description: "Professional cleaning tools and equipment including mops, brooms, brushes, and all essential cleaning implements for your office",
                icon: "🧹"
              },
              {
                title: "DISPOSABLES",
                description: "Single-use office and cleaning supplies including paper products, plastic items, and other disposable essentials",
                icon: "🗑️"
              },
              {
                title: "STATIONERY",
                description: "Complete office stationery solutions including pens, pencils, files, folders, and all essential office supplies",
                icon: "✏️"
              },
              {
                title: "TISSUE",
                description: "Premium quality tissue products including toilet rolls, facial tissues, napkins, and other paper hygiene products",
                icon: "🧻"
              },
              {
                title: "CLEANING CHEMICALS",
                description: "Professional grade cleaning solutions including disinfectants, detergents, sanitizers, and specialized cleaning chemicals",
                icon: "🧪"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-teal-600">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="h-[300px] md:h-[400px] w-full mt-8 md:mt-16">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224346.5400532598!2d77.04417543008848!3d28.527589036360207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1680678474695!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Koncept Services Office Location"
          ></iframe>
        </div>
      </main>

      <Footer />
    </div>
  );
}