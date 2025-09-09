"use client";

import { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Validation
    if (!firstName.trim()) {
      showToast('Please enter your first name', 'error');
      return;
    }
    if (!lastName.trim()) {
      showToast('Please enter your last name', 'error');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (!subject.trim()) {
      showToast('Please enter a subject', 'error');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      showToast('Please enter a message with at least 10 characters', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-8 sm:py-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
                Contact Us
              </h1>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              {/* Email */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaEnvelope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">info@healthbridge.com</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">support@healthbridge.com</p>
              </div>

              {/* Phone */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaPhoneAlt className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">+1 (555) 123-4567</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">+1 (555) 987-6543</p>
              </div>

              {/* Address */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaMapMarkerAlt className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Visit Us</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">123 Health Street</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Medical City, MC 12345</p>
              </div>

              {/* Hours */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaClock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Office Hours</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Mon - Fri: 9AM - 6PM</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">24/7 Online Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-8 sm:py-12 mb-8 sm:mb-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
                  Send Us a Message
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="John"
                        className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        placeholder="Doe"
                        className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="john.doe@example.com"
                      className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      placeholder="Please describe your inquiry in detail..."
                      className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    style={{
                      backgroundColor: "#3870FF",
                      backgroundImage: GRADIENT_STYLE,
                      color: "#ffffff",
                      border: "none"
                    }}
                    className="w-full px-6 py-4 font-semibold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitted ? (
                      <>
                        <FaCheckCircle className="w-5 h-5 mr-2" />
                        Message Sent!
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}