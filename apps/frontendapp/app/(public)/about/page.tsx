"use client";

import Image from "next/image";
import { FaHeart, FaEye, FaStar, FaUsers, FaShieldAlt, FaHandsHelping } from "react-icons/fa";

const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
                About Health Bridge
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Connecting patients with quality healthcare through innovative technology and compassionate care.
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              
              {/* Mission */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                    <FaHeart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  To provide accessible, high-quality healthcare services through innovative technology, ensuring every patient receives personalized care and support on their health journey.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                    <FaEye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  To be the leading digital healthcare platform that bridges the gap between patients and healthcare providers, creating a healthier world for everyone.
                </p>
              </div>

              {/* Values */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                    <FaStar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  Compassion, Innovation, Excellence, and Integrity guide everything we do, ensuring trust and quality in every interaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Story Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full lg:w-1/2">
                    <div className="h-64 sm:h-80 lg:h-full min-h-[400px] relative">
                      <Image
                        src="/about.jpg?v=2"
                        alt="Health Bridge Team"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                      Our Story
                    </h2>
                    <div className="space-y-4 text-gray-700 dark:text-gray-200 leading-relaxed">
                      <p>
                        Health Bridge was founded with a simple yet powerful vision: to make quality healthcare accessible to everyone, everywhere. We recognized the challenges patients face in navigating the healthcare system and set out to create a solution.
                      </p>
                      <p>
                        Our platform combines cutting-edge technology with human-centered design to create seamless experiences for patients, doctors, and healthcare staff. From appointment booking to medical records management, we're transforming how healthcare is delivered.
                      </p>
                      <p>
                        Today, we serve thousands of patients and work with hundreds of healthcare providers, continuously innovating to improve health outcomes and patient satisfaction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Details */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
                What Drives Us
              </h2>
              <div className="w-16 sm:w-20 lg:w-24 h-1 mx-auto rounded-full mb-6" style={{ background: GRADIENT_STYLE }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Compassion */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaHeart className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Compassion</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We put patients first, understanding their needs and providing care with empathy and kindness.
                </p>
              </div>

              {/* Innovation */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaStar className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We continuously embrace new technologies and methods to improve healthcare delivery and outcomes.
                </p>
              </div>

              {/* Excellence */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaShieldAlt className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Excellence</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We strive for the highest standards in everything we do, from patient care to platform performance.
                </p>
              </div>

              {/* Integrity */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaUsers className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Integrity</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We operate with transparency, honesty, and ethical practices in all our interactions.
                </p>
              </div>

              {/* Collaboration */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaHandsHelping className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We work together with patients, providers, and communities to achieve better health outcomes.
                </p>
              </div>

              {/* Accessibility */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaEye className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Accessibility</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We ensure healthcare is accessible to everyone, regardless of location, background, or circumstances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Join Our Healthcare Revolution
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
              Experience the future of healthcare with Health Bridge. Better care, better outcomes, better health.
            </p>
            <div className="px-4">
              <a href="/signup">
                <button
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-700 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-white transition-colors duration-300 text-sm sm:text-base"
                >
                  Get Started Today
                </button>
              </a>
            </div>
          </div>
        </section>
    </div>
  );
}