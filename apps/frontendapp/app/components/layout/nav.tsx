import Link from "next/link"
import { ModeToggle } from "@/app/components/theme/mode-toggle"

export function Nav() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Health Bridge</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            <Link href="/auth/login" className="text-sm font-medium">
              Login
            </Link>
          </nav>
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}