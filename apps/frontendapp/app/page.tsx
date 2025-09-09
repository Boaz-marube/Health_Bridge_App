"use client"


import { Navbar } from "./components/layout/nav"
import { Hero } from "./components/layout/hero"
import { Footer } from "./components/layout/footer"
import { WellnessTips } from "./(public)/components/sections/wellness-tips"
import { AboutUs } from "./(public)/components/sections/about-us"
import { Testimonials } from "./(public)/components/sections/testimonials"



export default function HomePage() {

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Hero Section */}
      <Hero />
      
      {/* Main Content */}
      <main className="relative">
        <AboutUs />
        <WellnessTips />
        <Testimonials />
      </main>
    </div>
    <Footer />
    </>
  )
}










