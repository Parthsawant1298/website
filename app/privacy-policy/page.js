"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-800 leading-relaxed">
          <div>
            <p className="text-gray-600 mb-2">Effective Date: 15 JUNE2025</p>
            <p className="text-gray-600 mb-6">Last Updated: 12 JUNE 2025</p>
            
            <p className="mb-6">
              Welcome to Koncept services ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how your information is collected, used, shared, and protected when you visit or make a purchase from our website www.konceptservices.in (the "Site").
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect the following categories of data:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Personal Information</h3>
                <p className="mb-2">When you create an account, place an order, or subscribe to newsletters, we may collect:</p>
                <div className="ml-4 space-y-1">
                  <p>Full name</p>
                  <p>Email address</p>
                  <p>Phone number</p>
                  <p>Billing and shipping address</p>
                  <p>Payment information (processed via third-party gateways)</p>
                  <p>Account login credentials</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Order & Transaction Details</h3>
                <div className="ml-4 space-y-1">
                  <p>Products purchased</p>
                  <p>Purchase history</p>
                  <p>Transaction amounts and date</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c. Device & Technical Data</h3>
                <p className="mb-2">When you visit our website, we may automatically collect:</p>
                <div className="ml-4 space-y-1">
                  <p>IP address</p>
                  <p>Browser type/version</p>
                  <p>Operating system</p>
                  <p>Device identifiers</p>
                  <p>Referral source (how you arrived)</p>
                  <p>Pages visited and time spent</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">d. Cookies & Tracking Technologies</h3>
                <p className="mb-2">We use cookies, pixels, and similar technologies to:</p>
                <div className="ml-4 space-y-1">
                  <p>Save your preferences</p>
                  <p>Personalize content</p>
                  <p>Analyze site traffic</p>
                  <p>Deliver targeted ads</p>
                </div>
                <p className="mt-2">(For more, see Section 7: Cookies & Tracking)</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We may use your information for the following purposes:</p>
            <div className="ml-4 space-y-1">
              <p>To process and deliver orders</p>
              <p>To create and manage user accounts</p>
              <p>To send order updates and transactional emails</p>
              <p>To improve website experience and performance</p>
              <p>For customer support and dispute resolution</p>
              <p>For marketing and promotional communication (with your consent)</p>
              <p>To comply with legal obligations</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">We never sell your personal data. However, we may share it with:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Third-party Service Providers</h3>
                <p className="mb-2">For functions such as:</p>
                <div className="ml-4 space-y-1">
                  <p>Payment processing (e.g., Razorpay, Stripe)</p>
                  <p>Shipping & logistics</p>
                  <p>Cloud hosting & infrastructure</p>
                  <p>Email and SMS services</p>
                  <p>Analytics and performance tracking (e.g., Google Analytics)</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Business Transfers</h3>
                <p>In case of a merger, acquisition, or sale of assets, your data may be transferred to the new entity.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c. Legal Compliance</h3>
                <p className="mb-2">We may disclose your data if:</p>
                <div className="ml-4 space-y-1">
                  <p>Required by law</p>
                  <p>To respond to legal claims or processes</p>
                  <p>To protect our rights or the safety of others</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">4. Data Retention</h2>
            <p className="mb-2">We retain your personal data:</p>
            <div className="ml-4 space-y-1">
              <p>As long as your account is active</p>
              <p>As necessary to fulfill orders and provide services</p>
              <p>To comply with legal and tax obligations</p>
            </div>
            <p className="mt-2">You may request deletion of your account and data anytime (see Section 8: Your Rights).</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-2">We use industry-standard security measures:</p>
            <div className="ml-4 space-y-1">
              <p>SSL encryption for all transactions</p>
              <p>Secure server infrastructure</p>
              <p>Role-based access controls</p>
              <p>Password hashing and token-based authentication</p>
            </div>
            <p className="mt-2">While we strive to protect your data, no system is 100% secure. Use strong passwords and protect your login credentials.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">6. International Data Transfers</h2>
            <p>If you're accessing our Site from outside [Your Country], your data may be transferred to servers located in [Server Country]. We ensure such transfers comply with international data protection laws (e.g., GDPR).</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">7. Cookies & Tracking</h2>
            <p className="mb-2">We use cookies to:</p>
            <div className="ml-4 space-y-1">
              <p>Remember login sessions</p>
              <p>Store shopping cart data</p>
              <p>Analyze traffic (via Google Analytics, Facebook Pixel)</p>
              <p>Enable personalized ads (via Meta Ads, Google Ads)</p>
            </div>
            <p className="mt-2">You can manage or disable cookies via your browser settings.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">8. Your Rights (for users in EU/UK under GDPR and similar laws)</h2>
            <p className="mb-2">You have the right to:</p>
            <div className="ml-4 space-y-1">
              <p>Access your personal data</p>
              <p>Request correction of inaccurate data</p>
              <p>Request deletion of your data ("Right to be Forgotten")</p>
              <p>Withdraw consent for marketing communications</p>
              <p>Object to or restrict certain data processing</p>
              <p>Export your data in a portable format</p>
            </div>
            <p className="mt-2">To exercise your rights, email us at [privacy@yourdomain.com]</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>We do not knowingly collect data from children under the age of 13 (or 16 under GDPR). If we learn we have collected such data, we will delete it immediately.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">10. Third-Party Links</h2>
            <p>Our Site may contain links to external websites or plugins. We are not responsible for the privacy practices or content of those third-party services.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Any changes will be posted on this page with a revised "Last Updated" date. Continued use of the Site indicates acceptance of the updated policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-2">For any questions or concerns regarding this Privacy Policy, contact:</p>
            <div className="ml-4 space-y-1">
              <p>Koncept Services</p>
              <p>Email: sales.kservices@gmail.com</p>
              <p>Phone: 9999083353</p>
              <p>Address: Ground Floor C-2/13, Khasra No. 65</p>
              <p>Saidulajab Extension Neb Sarai Road</p>
              <p>New Delhi 110068</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}