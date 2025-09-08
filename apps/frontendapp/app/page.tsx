"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "./components/ui/card"
import { Navbar } from "./components/layout/nav"
import { Footer } from "./components/layout/footer"
import { FaSmile, FaHeartbeat, FaCheck } from "react-icons/fa"
import { MdLocalHospital } from "react-icons/md"

// Constants for better maintainability
const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)"
const PRIMARY_COLOR = "#3870FF"

// Utility function to sanitize user input
const sanitizeInput = (input: string): string => {
  return input.replace(/[\n\r\t]/g, ' ').replace(/[<>"'&]/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    }
    return entities[char] || char
  })
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#home' || window.location.hash === '') {
        setIsVisible(false)
        setTimeout(() => setIsVisible(true), 100)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const gradientButtonStyle = {
    backgroundColor: "#3870FF", // Fallback solid color
    backgroundImage: GRADIENT_STYLE,
    color: "#ffffff",
    border: "none",
    outline: "none",
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Main Content */}
      <main id="home" className="relative">
        {/* Hero Background Area */}
        <div className="h-[40vh] sm:h-[70vh] lg:h-[80vh] relative">
          <div className="absolute inset-0 bg-gray-100">
            <Image
              src="/herosection.png"
              alt="Hero Background"
              fill
              className="object-cover"
              quality={100}
              priority
              unoptimized
            />
          </div>
          
          {/* Welcome Card - Desktop only */}
          <div className="hidden sm:flex relative z-10 items-center justify-end p-6 lg:p-12 h-full">
            <Card 
              className="w-full max-w-sm border-0 mr-4 lg:mr-16 transition-all duration-1000 ease-out cursor-pointer" 
              style={{ 
                backgroundColor: isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.3)", 
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(100px) scale(0.9)',
                opacity: isVisible ? 0.85 : 0
              }}
              onClick={() => {
                const card = document.querySelector('.hero-card') as HTMLElement
                if (card) {
                  card.style.transform = 'scale(0.95)'
                  setTimeout(() => {
                    card.style.transform = 'scale(1)'
                  }, 150)
                }
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = isVisible ? 'translateX(0) scale(1.02)' : 'translateX(100px) scale(0.9)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = isVisible ? 'translateX(0) scale(1)' : 'translateX(100px) scale(0.9)'
              }}
            >
              <CardContent className="p-6 space-y-4 hero-card">
                <div className="space-y-1" style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 0.8s ease-out 0.2s'
                }}>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Welcome to</p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Bridge</h1>
                </div>
                <div className="space-y-3" style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 0.8s ease-out 0.4s'
                }}>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your digital bridge to better healthcare. Easily book appointments, track your queue, access medical
                    records, and get AI-powered reminders and wellness tips—all in one secure place.
                  </p>
                </div>
                <div style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 0.8s ease-out 0.6s'
                }}>
                  <Link href="/signup">
                    <button
                      className="w-full font-medium py-2 px-4 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-300 cursor-pointer text-center text-white"
                      style={gradientButtonStyle}
                    >
                      Get Started
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Mobile Welcome Card - Below hero image */}
        <div className="sm:hidden px-4 py-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <Card 
            className="w-full max-w-sm mx-auto border-0 transition-all duration-1000 ease-out cursor-pointer" 
            style={{ 
              backgroundColor: isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.9)", 
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              opacity: isVisible ? 1 : 0
            }}
          >
            <CardContent className="p-4 space-y-3 hero-card">
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Welcome to</p>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Health Bridge</h1>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your digital bridge to better healthcare. Easily book appointments, track your queue, access medical
                  records, and get AI-powered reminders and wellness tips—all in one secure place.
                </p>
              </div>
              <div>
                <Link href="/signup">
                  <button
                    className="w-full font-medium py-2 px-4 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-300 cursor-pointer text-center text-white text-sm"
                    style={gradientButtonStyle}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* About Us Section */}
      <section id="about" className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ background: GRADIENT_STYLE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>About Us</h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 mx-auto rounded-full" style={{ background: GRADIENT_STYLE }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2/5">
                  <div className="h-48 sm:h-64 lg:h-full relative">
                    <Image
                      src="/about.jpg?v=2"
                      alt="Health Bridge Team"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="lg:w-3/5 p-4 sm:p-6 lg:p-12">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    Welcome to Health Bridge
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                    Welcome to Health Clinics, where your well-being is our priority. Our mission is to provide exceptional healthcare services with a focus on compassion, expertise, and personalized care. At Health Clinics, we understand that your health is invaluable, and we are committed to ensuring that you receive the highest standard of medical attention.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-3 sm:mr-4 flex-shrink-0" style={{ background: GRADIENT_STYLE }}></div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg">24/7 Medical Services through online and offline</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-3 sm:mr-4 flex-shrink-0" style={{ background: GRADIENT_STYLE }}></div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg">Using Modern technology to diagnostic disease</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-3 sm:mr-4 flex-shrink-0" style={{ background: GRADIENT_STYLE }}></div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg">Easy and flexible to appoint a doctor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <div id="doctors">
        <DoctorsSection />
      </div>
      
      {/* Section Divider */}
      <div style={{ 
        height: "2px", 
        background: GRADIENT_STYLE, 
        margin: "0 auto", 
        maxWidth: "800px",
        marginTop: "10px",
        marginBottom: "40px"
      }}></div>
      
      {/* Testimonials Header */}
      <div id="testimonials" className="text-center py-0 pb-5 bg-white dark:bg-gray-900 -mt-5">
        <h1 style={{
          color: PRIMARY_COLOR,
          fontWeight: 600,
          fontSize: "2.2rem",
          marginBottom: "8px",
        }}>
          Testimonials
        </h1>
      </div>
      
      {/* Stats/Testimonials Section */}
      <StatsPanel />
      
      {/* Specialties Section */}
      <SpecialtiesPage />
      
      {/* Wellness Tips Section */}
      <WellnessTipsPage />
    </div>
    <Footer />
    </>
  )
}

function DoctorsSection() {
  const [start, setStart] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const visible = 5;
  const allDoctors = [
    {
      name: "Dr. Samantha Miller, MD",
      specialty: "Internal Medicine",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Jonathan Hayes, PhD",
      specialty: "Psychiatry",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Emily Chen, DDS",
      specialty: "Dentistry",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Michael Rodriguez, DO",
      specialty: "Orthopedics",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Jessica Nguyen, OB/GYN",
      specialty: "Obstetrics and Gynecology",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Robert Johnson, MD",
      specialty: "Cardiology",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Sarah Williams, MD",
      specialty: "Dermatology",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. David Brown, MD",
      specialty: "Neurology",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Lisa Davis, MD",
      specialty: "Pediatrics",
      img: "/doctors.jpg",
      link: "#",
    },
    {
      name: "Dr. Mark Wilson, MD",
      specialty: "Radiology",
      img: "/doctors.jpg",
      link: "#",
    },
  ];
  const doctors = showMore ? allDoctors : allDoctors.slice(0, 5);
  const maxIndex = useMemo(() => doctors.length - visible, [doctors.length, visible]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans pt-6 sm:pt-8 lg:pt-10 px-4">
        <h1 className="text-center text-[#3870FF] dark:text-blue-400 font-semibold text-2xl sm:text-3xl lg:text-4xl mb-2">
          Doctors
        </h1>
        <h2 className="text-center font-bold text-lg sm:text-xl m-0 mb-1.5 text-gray-900 dark:text-white">
          Our Best Doctors At Your Service
        </h2>
        <p className="text-center mx-auto mb-3 sm:mb-4 lg:mb-6 max-w-xs sm:max-w-2xl lg:max-w-4xl text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed px-4">
          Experience unparalleled medical expertise with our team of best-in-class doctors.<br />
          At Health Clinics, we take pride in offering you the highest standard of care, delivered by dedicated professionals committed to your well-being.
        </p>
        <div className={`${showMore ? 'overflow-x-auto' : 'overflow-hidden'} overflow-y-hidden my-4 sm:my-6 lg:my-8 px-4`}>
          <div className="flex gap-3 sm:gap-4 lg:gap-12 min-w-max justify-center">
            {(showMore ? allDoctors : allDoctors.slice(0, 5)).map((doctor, idx) => (
              <div
                key={doctor.name}
                style={{
                  background: "#eaf5fa",
                  borderRadius: 18,
                  boxShadow: "0 2px 12px rgba(56,112,255,0.12)",
                  padding: "22px 18px 16px 18px",
                  width: "180px",
                  minWidth: "180px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "transform 0.45s cubic-bezier(.62,1.74,.47,.87)",
                  cursor: "pointer",
                  position: "relative",
                  willChange: "transform",
                  ...(idx % 2 === 0
                    ? { transform: "translateY(-8px)" }
                    : { transform: "translateY(8px)" }),
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLDivElement).style.transform =
                    "scale(1.03) translateY(-12px)")
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLDivElement).style.transform =
                    idx % 2 === 0
                      ? "translateY(-8px)"
                      : "translateY(8px)")
                }
              >
                <img
                  src={doctor.img}
                  alt={doctor.name}
                  width={145}
                  height={155}
                  style={{
                    borderRadius: "14px",
                    objectFit: "cover",
                    marginBottom: 10,
                    background: "#b3e3ff",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/doctors.jpg';
                  }}
                />
                <a
                  href={doctor.link}
                  style={{
                    color: "#3870FF",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    textDecoration: "none",
                    cursor: "pointer",
                    marginBottom: 2,
                    transition: "color 0.18s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#38B7FF")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#3870FF")}
                >
                  {doctor.name}
                </a>
                <div
                  style={{
                    color: "#636c7b",
                    fontSize: ".99rem",
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {doctor.specialty}
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {Array.from({ length: doctors.length - visible + 1 }).map((_, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: start === i ? "#3870FF" : "#d1d7e2",
                borderRadius: "50%",
                margin: "0 5px",
                transition: "background 0.2s",
              }}
            ></span>
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button
            onClick={() => setShowMore(!showMore)}
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#3870FF",
              border: "2px solid #3870FF",
              borderRadius: 28,
              padding: "10px 28px",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(56,112,255,0.09)",
              textDecoration: "none",
              transition: "background 0.18s, color 0.18s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#3870FF";
            }}
          >
            {showMore ? "Show Less Doctors" : "Find More Doctors"} &rarr;
          </button>
        </div>
    </div>
  );
}

function StatsPanel() {
  return (
    <div className="w-full flex justify-center items-center py-6 sm:py-8 lg:py-10 px-4" style={{ background: GRADIENT_STYLE }}>
      <div className="flex flex-col sm:flex-row w-full max-w-6xl justify-between gap-4 sm:gap-0">
        <StatBox
          icon={<FaSmile size={44} color="white" />}
          value="135k+"
          label="Satisfied Patients"
        />
        <StatBox
          icon={<FaHeartbeat size={44} color="white" />}
          value="24"
          label="Health Departments"
        />
        <StatBox
          icon={<MdLocalHospital size={44} color="white" />}
          value="19"
          label="Facilities"
        />
        <StatBox
          icon={<FaCheck size={44} color="white" />}
          value="25+"
          label="Insurance Partners"
        />
      </div>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white min-w-0 sm:border-r border-white/20 last:border-r-0 cursor-pointer transition-transform duration-300 hover:scale-105 py-4 sm:py-0">
      <div className="mb-2 sm:mb-3">
        <div className="text-2xl sm:text-3xl lg:text-4xl">{icon}</div>
      </div>
      <div className="text-xl sm:text-2xl lg:text-4xl font-semibold mb-1 sm:mb-2">
        {value}
      </div>
      <div className="text-xs sm:text-sm lg:text-base font-normal opacity-90 text-center px-2">
        {label}
      </div>
    </div>
  );
}

function SpecialtiesPage() {
  const [start, setStart] = useState(0);
  const visible = 4;
  const specialties = [
    {
      title: "Cardiology",
      description:
        "Our Cardiology Department is at the forefront of heart health. We offer cutting-edge diagnostics, comprehensive cardiac assessments, and specialized treatments tailored to your cardiovascular needs.",
      img: "/image1.jpg",
      link: "#",
    },
    {
      title: "Dermatology",
      description:
        "Transform your skin's vitality with Dermatology excellence at Health Clinics Services. Our skilled dermatologists offer personalized solutions, from cosmetic dermatology to targeted treatments for skin conditions.",
      img: "/image2.jpg",
      link: "#",
    },
    {
      title: "Obstetrics & Gynecology",
      description:
        "At Health Clinics, our Obstetrics and Gynecology experts ensure personalized care for women—embracing every stage with compassion, expertise, and tailored health solutions. Trust us for your journey to women's wellness.",
      img: "/image3.jpg",
      link: "#",
    },
    {
      title: "Internal Medicine",
      description:
        "Explore holistic healthcare at Health Clinics Services with our Internal Medicine specialists. From comprehensive health assessments to managing chronic conditions, our team is dedicated to your well-being.",
      img: "/image4.jpg",
      link: "#",
    },
  ];
  const maxIndex = useMemo(() => specialties.length - visible, [specialties.length, visible]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans p-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="text-sm sm:text-base lg:text-lg font-medium mb-2 sm:mb-3" style={{
            background: GRADIENT_STYLE,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Health Clinics Services
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Medical Services of The Specialties
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mx-auto max-w-2xl px-4">
            Our commitment to your health extends beyond routine care.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {specialties.map((item, idx) => (
            <div
              key={item.title}
              style={{
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 2px 14px rgba(56,112,255,0.11)",
                padding: "38px 18px 22px 18px",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                border: "1.5px solid #f2f2f4",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(56,112,255,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 14px rgba(56,112,255,0.11)";
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginBottom: 18,
                  boxShadow: "0 2px 12px rgba(56,112,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  width={90}
                  height={90}
                  style={{
                    width: "110%",
                    height: "110%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transform: "scale(1.1)",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const nextElement = target.nextElementSibling as HTMLElement;
                    target.style.display = 'none';
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: "#b3e3ff",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    color: "#3870FF",
                  }}
                >
                  🏥
                </div>
              </div>
              <div
                style={{
                  color: "#16181c",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  color: "#444",
                  fontSize: "1.01rem",
                  marginBottom: 18,
                  textAlign: "center",
                  lineHeight: 1.6,
                  minHeight: 100,
                }}
              >
                {item.description}
              </div>
              <button
                onClick={() => {

                  window.location.href = '/login'

                }}
                style={{
                  display: "inline-block",
                  background: "#fff",
                  color: "#3870FF",
                  border: "2px solid #3870FF",
                  borderRadius: 28,
                  padding: "8px 22px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 2px 8px rgba(56,112,255,0.09)",
                  textDecoration: "none",
                  marginTop: "auto",
                  transition: "background 0.18s, color 0.18s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#3870FF";
                }}
              >
                Learn More &rarr;
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => {
              window.location.href = '/login'
            }}
            style={{
              display: "inline-block",
              background: "#fff",
              color: PRIMARY_COLOR,
              border: `2px solid ${PRIMARY_COLOR}`,
              borderRadius: 28,
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(56,112,255,0.09)",
              textDecoration: "none",
              transition: "background 0.18s, color 0.18s",
              cursor: "pointer"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = GRADIENT_STYLE;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = PRIMARY_COLOR;
            }}
          >
            Find More Services &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

function WellnessTipsPage() {
  const tips = [
    {
      date: "17 Nov",
      img: "/paper.png",
      title: "Navigating the Wellness Landscape: Latest Insights in Medical Health",
      desc: "Explore groundbreaking tips and tricks to enhance your overall health and well-being.",
      link: "#",
    },
    {
      date: "16 Nov",
      img: "/food.png",
      title: "Healthy Habits 101: A Guide to Boosting Your Immune System",
      desc: "Discover the most popular and effective strategies for maintaining a robust immune health.",
      link: "#",
    },
    {
      date: "15 Nov",
      img: "/gym.png",
      title: "Mind-Body Harmony: The Power of Holistic Health Practices",
      desc: "Unlock the secrets to a balanced life with our latest tips on integrating mind and body wellness.",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-800 font-sans p-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mt-0 mb-6 sm:mb-8 lg:mb-12 font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white">
          Our Latest & Most Popular Wellness Tips For You
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 justify-items-center">
          {tips.map((tip, idx) => (
            <div
              key={tip.title}
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 2px 14px rgba(56,112,255,0.13)",
                width: "100%",
                maxWidth: "355px",
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                marginBottom: 0,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(56,112,255,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 14px rgba(56,112,255,0.13)";
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 180 }}>
                <img
                  src={tip.img}
                  alt={tip.title}
                  width={355}
                  height={180}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const nextElement = target.nextElementSibling as HTMLElement;
                    target.style.display = 'none';
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    background: "#f0f0f0",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    color: "#ccc",
                  }}
                >
                  🏥
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    background: GRADIENT_STYLE,
                    color: "#fff",
                    borderRadius: 8,
                    padding: "7px 15px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: "0 2px 6px rgba(56,112,255,0.09)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {tip.date}
                </div>
              </div>
              <div style={{ marginTop: "auto", padding: "4px 20px 0 20px" }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.09rem",
                    marginBottom: 4,
                    color: "#1a1c24",
                  }}
                >
                  {tip.title}
                </div>
                <div
                  style={{
                    color: "#444",
                    fontSize: "1rem",
                    marginBottom: 8,
                  }}
                >
                  {tip.desc}
                </div>
              </div>
              <div style={{ padding: "0 20px 8px 20px" }}>
                <button
                  onClick={() => {

                    window.location.href = '/login'

                  }}
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: PRIMARY_COLOR,
                    border: `2px solid ${PRIMARY_COLOR}`,
                    borderRadius: 28,
                    padding: "8px 22px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: "0 2px 8px rgba(56,112,255,0.09)",
                    textDecoration: "none",
                    transition: "background 0.18s, color 0.18s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = GRADIENT_STYLE;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = PRIMARY_COLOR;
                  }}
                >
                  Learn More &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}