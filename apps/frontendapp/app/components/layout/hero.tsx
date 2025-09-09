"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const GRADIENT_STYLE =
  "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const gradientButtonStyle = {
    backgroundColor: "#3870FF",
    backgroundImage: GRADIENT_STYLE,
    color: "#ffffff",
    border: "none",
    outline: "none",
  };

  return (
    <section id="home" className="relative">
      {/* Hero Section - Full viewport minus header */}
      <div className="h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/herosection.png"
            alt="Hero Background"
            fill
            className="object-cover object-center opacity-90"
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kcp"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left space-y-8">
              {/* Main Content */}
              <div className="max-w-4xl space-y-6">
                <div
                  className="space-y-4"
                  style={{
                    transform: isVisible ? "translateY(0)" : "translateY(30px)",
                    opacity: isVisible ? 1 : 0,
                    transition: "all 0.5s ease-out 0.1s",
                  }}
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-medium">
                    Welcome to
                  </p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                    Health{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      Bridge
                    </span>
                  </h1>
                </div>

                <div
                  className="space-y-8"
                  style={{
                    transform: isVisible ? "translateY(0)" : "translateY(30px)",
                    opacity: isVisible ? 1 : 0,
                    transition: "all 0.5s ease-out 0.2s",
                  }}
                >
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl">
                    Your digital bridge to better healthcare. Easily book
                    appointments, track your queue, access medical records, and
                    get AI-powered reminders.
                  </p>

                  <div className="flex justify-start">
                    <Link href="/signup">
                      <button
                        className="px-8 py-4 sm:px-10 sm:py-5 font-semibold text-lg sm:text-xl rounded-xl text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                        style={gradientButtonStyle}
                      >
                        Get Started
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
