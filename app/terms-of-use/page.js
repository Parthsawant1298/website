"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TermsConditionsPage() {
  const handleBackClick = () => {
    // In a real application, this would navigate to "/"
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Back Arrow */}
      <button 
        onClick={handleBackClick}
        className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-lg font-medium">Back to Home</span>
      </button>

      {/* Terms and Conditions Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        
        <div className="space-y-6 text-gray-800 leading-relaxed">
          <div>
            <p className="text-gray-600 mb-2">Effective Date: 15 JUNE 2025</p>
            <p className="text-gray-600 mb-6">Last Updated: 12 JUNE 2025</p>
            
            <p className="mb-6">
              Welcome to Koncept Services ("we", "our", or "us"). These Terms and Conditions ("Terms") govern your use of our website www.konceptservices.in (the "Site") and the purchase of products or services from us. By accessing or using our Site, you agree to be bound by these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">2. Company Information</h2>
            <p className="mb-2">Koncept Services is a housekeeping and office supplies e-commerce platform operated by:</p>
            <div className="ml-4 space-y-1">
              <p>Company Name: Koncept Services</p>
              <p>Email: sales.kservices@gmail.com</p>
              <p>Phone: 9999083353</p>
              <p>Address: Ground Floor C-2/13, Khasra No. 65</p>
              <p>Saidulajab Extension Neb Sarai Road</p>
              <p>New Delhi 110068</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Products and Services</h2>
            <p className="mb-4">Koncept Services offers the following products and services:</p>
            <div className="ml-4 space-y-1">
              <p>Office supplies and stationery</p>
              <p>Cleaning chemicals and solutions</p>
              <p>Hygiene products including tissue papers and sanitizers</p>
              <p>Housekeeping equipment and tools</p>
              <p>Professional cleaning machines</p>
              <p>Premium household items and office utensils</p>
              <p>Branded products from authorized dealers (Diversey, Hindustan Unilever, Kent & Borosil, etc.)</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">4. User Account and Registration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Account Creation</h3>
                <div className="ml-4 space-y-1">
                  <p>You must create an account to place orders on our platform</p>
                  <p>You must provide accurate, current, and complete information</p>
                  <p>You are responsible for maintaining the confidentiality of your account credentials</p>
                  <p>You must be at least 18 years old to create an account</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Account Responsibilities</h3>
                <div className="ml-4 space-y-1">
                  <p>You are responsible for all activities under your account</p>
                  <p>Notify us immediately of any unauthorized use of your account</p>
                  <p>We reserve the right to suspend or terminate accounts that violate these terms</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">5. Orders and Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Order Placement</h3>
                <div className="ml-4 space-y-1">
                  <p>All orders are subject to acceptance and availability</p>
                  <p>We reserve the right to refuse or cancel any order</p>
                  <p>Order confirmation will be sent via email</p>
                  <p>Prices are subject to change without notice</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Payment Terms</h3>
                <div className="ml-4 space-y-1">
                  <p>Payment must be made in full before order processing</p>
                  <p>We accept credit cards, debit cards, UPI, and net banking</p>
                  <p>Payments are processed through secure third-party gateways (Razorpay, Stripe)</p>
                  <p>All prices are in Indian Rupees (INR) and include applicable taxes</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c. Billing and Invoicing</h3>
                <div className="ml-4 space-y-1">
                  <p>GST will be charged as per applicable rates</p>
                  <p>Invoice will be provided for all purchases</p>
                  <p>For bulk orders, special pricing and payment terms may apply</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">6. Shipping and Delivery</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Delivery Areas</h3>
                <div className="ml-4 space-y-1">
                  <p>We deliver across New Delhi and NCR region</p>
                  <p>Pan-India delivery available for bulk orders</p>
                  <p>Delivery charges may apply based on location and order value</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Delivery Timeline</h3>
                <div className="ml-4 space-y-1">
                  <p>Standard delivery: 2-5 business days within Delhi NCR</p>
                  <p>Express delivery: Same day or next day (where available)</p>
                  <p>Bulk orders: 3-7 business days depending on quantity</p>
                  <p>Delivery times are estimates and may vary due to unforeseen circumstances</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c. Delivery Terms</h3>
                <div className="ml-4 space-y-1">
                  <p>Someone must be available to receive the delivery</p>
                  <p>We are not responsible for delays due to incorrect addresses</p>
                  <p>Risk of loss transfers upon delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">7. Returns and Refunds</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Return Policy</h3>
                <div className="ml-4 space-y-1">
                  <p>Returns accepted within 7 days of delivery</p>
                  <p>Products must be unused, unopened, and in original packaging</p>
                  <p>Hygiene products and perishable items are non-returnable</p>
                  <p>Custom or personalized orders are non-returnable</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Refund Process</h3>
                <div className="ml-4 space-y-1">
                  <p>Refunds will be processed within 7-10 business days</p>
                  <p>Refunds will be credited to the original payment method</p>
                  <p>Shipping charges are non-refundable unless the return is due to our error</p>
                  <p>Return shipping costs are borne by the customer unless product is defective</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c. Damaged or Defective Products</h3>
                <div className="ml-4 space-y-1">
                  <p>Report damaged or defective products within 24 hours of delivery</p>
                  <p>We will arrange free pickup and replacement</p>
                  <p>Provide photos of damaged items for faster processing</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">8. Product Information and Warranties</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Product Descriptions</h3>
                <div className="ml-4 space-y-1">
                  <p>We strive to provide accurate product descriptions and images</p>
                  <p>Colors may vary slightly due to monitor settings</p>
                  <p>Specifications are subject to manufacturer changes</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Warranties</h3>
                <div className="ml-4 space-y-1">
                  <p>Manufacturer warranties apply to applicable products</p>
                  <p>We facilitate warranty claims but are not responsible for warranty terms</p>
                  <p>Extended warranties may be available for certain products</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">9. Prohibited Uses</h2>
            <p className="mb-2">You may not use our Site for:</p>
            <div className="ml-4 space-y-1">
              <p>Any unlawful purpose or to solicit others to perform unlawful acts</p>
              <p>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</p>
              <p>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</p>
              <p>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</p>
              <p>Submitting false or misleading information</p>
              <p>Uploading or transmitting viruses or any other type of malicious code</p>
              <p>Spamming, phishing, phreaking, pretext, spider, crawl, or scrape</p>
              <p>Any obscene or immoral purpose</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">10. Intellectual Property Rights</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Our Content</h3>
                <div className="ml-4 space-y-1">
                  <p>All content on this Site is owned by Koncept Services or licensed to us</p>
                  <p>This includes text, graphics, logos, images, and software</p>
                  <p>You may not reproduce, distribute, or create derivative works without permission</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Trademarks</h3>
                <div className="ml-4 space-y-1">
                  <p>Brand names and trademarks belong to their respective owners</p>
                  <p>Use of trademarks does not imply affiliation or endorsement</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">11. Privacy and Data Protection</h2>
            <p className="mb-2">Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Site, to understand our practices.</p>
            <div className="ml-4 space-y-1">
              <p>We collect and use information in accordance with our Privacy Policy</p>
              <p>We implement appropriate security measures to protect your data</p>
              <p>We do not sell personal information to third parties</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">12. Limitation of Liability</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Disclaimer of Warranties</h3>
                <div className="ml-4 space-y-1">
                  <p>The Site and services are provided "as is" without warranties of any kind</p>
                  <p>We do not warrant that the Site will be uninterrupted or error-free</p>
                  <p>We disclaim all warranties, express or implied</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Limitation of Damages</h3>
                <div className="ml-4 space-y-1">
                  <p>Our liability is limited to the amount paid for the specific product or service</p>
                  <p>We are not liable for indirect, incidental, or consequential damages</p>
                  <p>We are not responsible for delays or failures due to force majeure events</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">13. Force Majeure</h2>
            <p className="mb-2">We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including:</p>
            <div className="ml-4 space-y-1">
              <p>Natural disasters, pandemics, or government actions</p>
              <p>Labor strikes or transportation disruptions</p>
              <p>Internet or telecommunications failures</p>
              <p>Supplier delays or shortages</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">14. Governing Law and Jurisdiction</h2>
            <div className="ml-4 space-y-1">
              <p>These Terms are governed by the laws of India</p>
              <p>Any disputes shall be subject to the jurisdiction of courts in New Delhi, India</p>
              <p>We will attempt to resolve disputes through good faith negotiations</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">15. Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Termination by Us</h3>
                <div className="ml-4 space-y-1">
                  <p>We may terminate your access immediately for breach of these Terms</p>
                  <p>We may suspend services for non-payment</p>
                  <p>We reserve the right to discontinue the Site at any time</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Effect of Termination</h3>
                <div className="ml-4 space-y-1">
                  <p>Termination does not affect pending orders or obligations</p>
                  <p>Certain provisions shall survive termination</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">16. Modifications to Terms</h2>
            <div className="ml-4 space-y-1">
              <p>We reserve the right to modify these Terms at any time</p>
              <p>Changes will be posted on this page with an updated "Last Updated" date</p>
              <p>Continued use of the Site constitutes acceptance of modified Terms</p>
              <p>Material changes will be communicated via email or Site notice</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">17. Severability</h2>
            <p>If any provision of these Terms is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">18. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Koncept Services regarding the use of the Site.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">19. Contact Information</h2>
            <p className="mb-2">For any questions regarding these Terms and Conditions, please contact us:</p>
            <div className="ml-4 space-y-1">
              <p>Koncept Services</p>
              <p>Email: sales.kservices@gmail.com</p>
              <p>Phone: 9999083353</p>
              <p>Address: Ground Floor C-2/13, Khasra No. 65</p>
              <p>Saidulajab Extension Neb Sarai Road</p>
              <p>New Delhi 110068</p>
            </div>
            <p className="mt-4">Business Hours: Monday to Saturday, 9:00 AM to 6:00 PM IST</p>
          </div>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-600 italic">
              By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}