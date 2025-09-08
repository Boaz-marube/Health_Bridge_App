import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "../ui/button"
import { ModeToggle } from "../theme/mode-toggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-start">
              <Image
                src="/logo.jpg"
                alt="Health Bridge Logo"
                width={64}
                height={64}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-semibold">Health Bridge</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a href="#home" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
            Home
          </a>
          <a href="#about" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
            About Us
          </a>
          <a href="#doctors" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
            Our Doctors
          </a>
          <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
            Testimonials
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center">
          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2 -mr-2">
          <ModeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="px-4 py-4 space-y-3">
            <a href="#home" className="block text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2" onClick={() => setIsMenuOpen(false)}>
              Home
            </a>
            <a href="#about" className="block text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2" onClick={() => setIsMenuOpen(false)}>
              About Us
            </a>
            <a href="#doctors" className="block text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2" onClick={() => setIsMenuOpen(false)}>
              Our Doctors
            </a>
            <a href="#testimonials" className="block text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2" onClick={() => setIsMenuOpen(false)}>
              Testimonials
            </a>

          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar


