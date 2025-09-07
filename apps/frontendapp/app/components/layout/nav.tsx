import Link from "next/link"
import Image from "next/image"
import { Button } from "../ui/button"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex pl-4">
          <Link href="/" className="mr-8 flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="Health Bridge Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xl font-semibold">Health Bridge</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between pr-8">
          <div className="flex items-center space-x-6 ml-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              Home
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              About Us
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              Testimonials
            </a>
          </div>
          <div className="flex items-center space-x-3">
          <Link href="/signup">
            <button
              style={{
                backgroundColor: "#3870FF", // Fallback color
                backgroundImage: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
                color: "white",
              }}
              className="px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Sign up
            </button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="px-6 bg-transparent">
              Login
            </Button>
          </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


