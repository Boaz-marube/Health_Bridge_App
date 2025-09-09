"use client"

import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#38B7FF] to-[#3870FF] dark:from-gray-800 dark:to-gray-900 text-white border-t-2 border-[#45a4fa] dark:border-gray-700 -mt-16 pt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Logo & Brand - Takes 2 columns on XL screens */}
          <div className="xl:col-span-2 flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 p-1 flex-shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Health Bridge Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                Health<br />Bridge
              </div>
            </div>
            <p className="text-sm sm:text-base text-white/90 text-center md:text-left max-w-sm">
              Your digital bridge to better healthcare. Connecting patients with quality medical services.
            </p>
          </div>

          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6">Contact</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center md:justify-start">
                <FaEnvelope className="text-sm flex-shrink-0 w-4" />
                <span className="text-sm sm:text-base ml-3">info@healthbridge.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <FaPhoneAlt className="text-sm flex-shrink-0 w-4" />
                <span className="text-sm sm:text-base ml-3">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <FaMapMarkerAlt className="text-sm flex-shrink-0 w-4" />
                <span className="text-sm sm:text-base ml-3">123 Health St, Medical City</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => window.location.href = "#home"}>Home</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => window.location.href = "#about"}>About Us</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => window.location.href = "#doctors"}>Our Doctors</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => window.location.href = "#testimonials"}>Testimonials</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => alert('Wellness Tips - Coming Soon!')}>Wellness Tips</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => alert('Contact Us - Coming Soon!')}>Contact Us</li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6">Support & Resources</h3>
            <ul className="space-y-2 sm:space-y-3 mb-6">
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => alert('FAQs - Coming Soon!')}>FAQs</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => alert('Privacy Policy - Coming Soon!')}>Privacy Policy</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => alert('Terms & Conditions - Coming Soon!')}>Terms & Conditions</li>
              <li className="text-sm sm:text-base hover:text-white/80 dark:hover:text-gray-300 cursor-pointer transition-colors" onClick={() => alert('Help Center - Coming Soon!')}>Help Center</li>
            </ul>
            
            {/* Social Media */}
            <div>
              <h4 className="text-base font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3 justify-center md:justify-start">
                <a href="https://facebook.com/healthbridge" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaFacebookF className="text-sm sm:text-base" />
                </a>
                <a href="https://youtube.com/@healthbridge" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaYoutube className="text-sm sm:text-base" />
                </a>
                <a href="https://twitter.com/healthbridge" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaXTwitter className="text-sm sm:text-base" />
                </a>
                <a href="https://linkedin.com/company/healthbridge" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaLinkedinIn className="text-sm sm:text-base" />
                </a>
                <a href="https://instagram.com/healthbridge" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaInstagram className="text-sm sm:text-base" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 dark:border-gray-600 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm sm:text-base text-white/80 dark:text-gray-300">
            ©2025 Health Bridge. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}