"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
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

      {/* Cookie Policy Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        
        <div className="space-y-6 text-gray-800 leading-relaxed">
          <div>
            <p className="text-gray-600 mb-2">Effective Date: 15 JUNE 2025</p>
            <p className="text-gray-600 mb-6">Last Updated: 12 JUNE 2025</p>
            
            <p className="mb-6">
              This Cookie Policy explains how Koncept Services ("we", "our", or "us") uses cookies and similar tracking technologies when you visit our website www.konceptservices.in (the "Site"). This policy explains what cookies are, how we use them, the types of cookies we use, and how you can control your cookie preferences.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">1. What are Cookies?</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work more efficiently, provide a better user experience, and to provide reporting information to the website owners.
            </p>
            <p className="mb-4">
              Cookies set by the website owner (in this case, Koncept Services) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">2. Why Do We Use Cookies?</h2>
            <p className="mb-4">We use cookies for several reasons:</p>
            <div className="ml-4 space-y-2">
              <p><strong>Essential Website Functionality:</strong> To ensure our website works properly and securely</p>
              <p><strong>User Experience:</strong> To remember your preferences and provide personalized content</p>
              <p><strong>Analytics:</strong> To understand how visitors use our website and improve our services</p>
              <p><strong>Marketing:</strong> To show relevant advertisements and measure their effectiveness</p>
              <p><strong>Security:</strong> To protect against fraud and unauthorized access</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">a. Strictly Necessary Cookies</h3>
                <p className="mb-2">These cookies are essential for the website to function properly. They cannot be disabled.</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Session Management:</strong> Keeps you logged in during your visit</p>
                  <p><strong>Security:</strong> Protects against cross-site request forgery attacks</p>
                  <p><strong>Load Balancing:</strong> Distributes requests across our servers</p>
                  <p><strong>Shopping Cart:</strong> Remembers items in your cart</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">Legal Basis: Legitimate interest for website functionality</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">b. Performance and Analytics Cookies</h3>
                <p className="mb-2">These cookies help us understand how visitors interact with our website.</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Google Analytics:</strong> Tracks website usage and user behavior</p>
                  <p><strong>Page Views:</strong> Counts page visits and popular content</p>
                  <p><strong>Site Speed:</strong> Monitors website performance</p>
                  <p><strong>Error Tracking:</strong> Identifies technical issues</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">Legal Basis: Your consent (can be disabled)</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">c. Functional Cookies</h3>
                <p className="mb-2">These cookies enable enhanced functionality and personalization.</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Language Preferences:</strong> Remembers your language selection</p>
                  <p><strong>Location Settings:</strong> Saves your preferred delivery location</p>
                  <p><strong>Display Preferences:</strong> Remembers your display settings</p>
                  <p><strong>Chat Support:</strong> Enables customer service chat functionality</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">Legal Basis: Your consent (can be disabled)</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">d. Targeting and Advertising Cookies</h3>
                <p className="mb-2">These cookies are used to deliver relevant advertisements.</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Google Ads:</strong> Shows relevant ads based on your interests</p>
                  <p><strong>Facebook Pixel:</strong> Tracks conversions from Facebook ads</p>
                  <p><strong>Retargeting:</strong> Shows ads to previous website visitors</p>
                  <p><strong>Conversion Tracking:</strong> Measures advertising effectiveness</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">Legal Basis: Your consent (can be disabled)</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">4. Specific Cookies We Use</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">First-Party Cookies (Set by Koncept Services)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">ks_session</td>
                        <td className="border border-gray-300 px-4 py-2">Maintains user session</td>
                        <td className="border border-gray-300 px-4 py-2">Session</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">ks_cart</td>
                        <td className="border border-gray-300 px-4 py-2">Stores shopping cart items</td>
                        <td className="border border-gray-300 px-4 py-2">30 days</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">ks_preferences</td>
                        <td className="border border-gray-300 px-4 py-2">Saves user preferences</td>
                        <td className="border border-gray-300 px-4 py-2">1 year</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">ks_auth</td>
                        <td className="border border-gray-300 px-4 py-2">Authentication token</td>
                        <td className="border border-gray-300 px-4 py-2">24 hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Third-Party Cookies</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Service</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                        <td className="border border-gray-300 px-4 py-2">_ga, _gid</td>
                        <td className="border border-gray-300 px-4 py-2">Website analytics</td>
                        <td className="border border-gray-300 px-4 py-2">2 years / 24 hours</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">Facebook</td>
                        <td className="border border-gray-300 px-4 py-2">_fbp</td>
                        <td className="border border-gray-300 px-4 py-2">Advertising tracking</td>
                        <td className="border border-gray-300 px-4 py-2">3 months</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Google Ads</td>
                        <td className="border border-gray-300 px-4 py-2">_gcl_au</td>
                        <td className="border border-gray-300 px-4 py-2">Ad conversion tracking</td>
                        <td className="border border-gray-300 px-4 py-2">3 months</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">Payment Gateway</td>
                        <td className="border border-gray-300 px-4 py-2">razorpay_*</td>
                        <td className="border border-gray-300 px-4 py-2">Payment processing</td>
                        <td className="border border-gray-300 px-4 py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">5. How to Control Cookies</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">a. Cookie Consent Banner</h3>
                <div className="ml-4 space-y-1">
                  <p>When you first visit our website, you will see a cookie consent banner</p>
                  <p>You can accept all cookies, reject non-essential cookies, or customize your preferences</p>
                  <p>You can change your preferences at any time by clicking the "Cookie Settings" link in our footer</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">b. Browser Settings</h3>
                <p className="mb-2">You can control cookies through your browser settings:</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Chrome:</strong> Settings Privacy and Security  Cookies and other site data</p>
                  <p><strong>Firefox:</strong> Options  Privacy & Security  Cookies and Site Data</p>
                  <p><strong>Safari:</strong> Preferences  Privacy  Manage Website Data</p>
                  <p><strong>Edge:</strong> Settings  Cookies and site permissions  Cookies and site data</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">Note: Disabling essential cookies may affect website functionality</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">c. Third-Party Opt-Out</h3>
                <p className="mb-2">You can opt out of third-party cookies directly:</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Google Analytics:</strong> <span className="text-blue-600">https://tools.google.com/dlpage/gaoptout</span></p>
                  <p><strong>Google Ads:</strong> <span className="text-blue-600">https://adssettings.google.com</span></p>
                  <p><strong>Facebook:</strong> <span className="text-blue-600">https://www.facebook.com/settings?tab=ads</span></p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">6. Mobile App Cookies</h2>
            <p className="mb-2">If you use our mobile app, similar tracking technologies may be used:</p>
            <div className="ml-4 space-y-1">
              <p>Mobile app identifiers and device information</p>
              <p>App usage analytics and performance data</p>
              <p>Push notification preferences</p>
              <p>Location data (with your permission)</p>
            </div>
            <p className="mt-2">You can control these through your device settings and app permissions.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">7. Cookie Retention Periods</h2>
            <div className="space-y-2">
              <p><strong>Session Cookies:</strong> Deleted when you close your browser</p>
              <p><strong>Persistent Cookies:</strong> Remain for a set period or until deleted</p>
              <p><strong>Short-term (24 hours - 30 days):</strong> Authentication, cart data</p>
              <p><strong>Medium-term (3 months - 1 year):</strong> Preferences, analytics</p>
              <p><strong>Long-term (1-2 years):</strong> Analytics, advertising optimization</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="mb-2">Some of our third-party service providers may be located outside India:</p>
            <div className="ml-4 space-y-1">
              <p>Google (Analytics, Ads) - Data may be processed in the United States</p>
              <p>Facebook (Meta) - Data may be processed in the United States and Ireland</p>
              <p>We ensure appropriate safeguards are in place for international transfers</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">9. Your Rights</h2>
            <p className="mb-2">You have the following rights regarding cookies and tracking:</p>
            <div className="ml-4 space-y-1">
              <p>Right to be informed about our use of cookies</p>
              <p>Right to give or withdraw consent for non-essential cookies</p>
              <p>Right to access information about cookies we use</p>
              <p>Right to delete cookies from your device</p>
              <p>Right to object to certain types of tracking</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">10. Security and Privacy</h2>
            <div className="space-y-2">
              <p>We implement appropriate security measures to protect cookie data</p>
              <p>Cookies do not contain personally identifiable information unless you provide it</p>
              <p>We regularly review and update our cookie practices</p>
              <p>We comply with applicable data protection laws including GDPR and Indian privacy laws</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">11. Changes to This Cookie Policy</h2>
            <div className="ml-4 space-y-1">
              <p>We may update this Cookie Policy from time to time</p>
              <p>Changes will be posted on this page with an updated "Last Updated" date</p>
              <p>Significant changes will be communicated through our website or email</p>
              <p>Continued use of our website constitutes acceptance of the updated policy</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-2">If you have any questions about our use of cookies, please contact us:</p>
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
              This Cookie Policy is designed to help you understand how we use cookies and how you can control them. For more information about how we handle your personal data, please see our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}