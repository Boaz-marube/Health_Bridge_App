import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

export default function HeroSection() {
  return (
    <main className="relative min-h-screen">
      {/* Hero Background Area - Ready for your background image */}
      <div 
        className="absolute inset-0 bg-gray-100 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/herosection.png)' }}
      ></div>

      {/* Welcome Card - Positioned as overlay on the right */}
      <div className="relative z-10 flex items-center justify-end p-8 lg:p-12 min-h-screen">
        <Card className="w-full max-w-sm bg-white border-0 shadow-lg mr-8 lg:mr-16">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Welcome to</p>
              <h1 className="text-2xl font-bold text-foreground">Health Bridge</h1>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your digital bridge to better healthcare. Easily book appointments, track your queue, access medical
                records, and get AI-powered reminders and wellness tips—all in one secure place.
              </p>
            </div>

            <Link href="/signup">
              <Button
                className="w-full text-white font-medium py-2 rounded-md"
                style={{
                  background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
                }}
              >
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}