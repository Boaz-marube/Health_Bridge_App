"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent } from "./components/ui/card"
import { Navbar } from "./components/layout/nav"
import { Footer } from "./components/layout/footer"
import { FaSmile, FaHeartbeat, FaCheck } from "react-icons/fa"
import { MdLocalHospital } from "react-icons/md"

export default function HomePage() {
  const gradientButtonStyle = {
    backgroundColor: "#3870FF", // Fallback solid color
    backgroundImage: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
    color: "#ffffff",
    border: "none",
    outline: "none",
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main id="home" className="relative h-[80vh]">
        {/* Hero Background Area - Ready for your background image */}
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

        {/* Welcome Card - Positioned as overlay on the right */}
        <div className="relative z-10 flex items-center justify-end p-8 lg:p-12 h-[80vh]">
          <Card className="w-full max-w-sm border-0 shadow-lg mr-8 lg:mr-16 animate-slide-in" style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}>
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
                <button
                  className="w-full font-medium py-2 px-4 rounded-md hover:opacity-90 transition-opacity cursor-pointer text-center text-white"
                  style={gradientButtonStyle}
                >
                  Get Started
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* About Us Section */}
      <section id="about" className="relative min-h-[70vh] bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4" style={{ background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>About Us</h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)" }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2/5">
                  <div className="h-64 lg:h-full relative">
                    <Image
                      src="/about.jpg"
                      alt="Health Bridge Team"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="lg:w-3/5 p-8 lg:p-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Welcome to Health Bridge
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    Welcome to Health Clinics, where your well-being is our priority. Our mission is to provide exceptional healthcare services with a focus on compassion, expertise, and personalized care. At Health Clinics, we understand that your health is invaluable, and we are committed to ensuring that you receive the highest standard of medical attention.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-4 flex-shrink-0" style={{ background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)" }}></div>
                      <span className="text-gray-700 text-lg">24/7 Medical Services through online and offline</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-4 flex-shrink-0" style={{ background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)" }}></div>
                      <span className="text-gray-700 text-lg">Using Modern technology to diagnostic disease</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-4 flex-shrink-0" style={{ background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)" }}></div>
                      <span className="text-gray-700 text-lg">Easy and flexible to appoint a doctor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <DoctorsSection />
      
      {/* Section Divider */}
      <div style={{ 
        height: "2px", 
        background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)", 
        margin: "0 auto", 
        maxWidth: "600px",
        marginTop: "-10px",
        marginBottom: "20px"
      }}></div>
      
      {/* Testimonials Header */}
      <div id="testimonials" style={{ textAlign: "center", padding: "0px 0 20px 0", background: "#fff", marginTop: "-20px" }}>
        <h1 style={{
          color: "#3870FF",
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
  const maxIndex = doctors.length - visible;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "sans-serif",
        padding: "40px 0 0px 0",
      }}
    >
        <h1
          style={{
            textAlign: "center",
            color: "#3870FF",
            fontWeight: 600,
            fontSize: "2.2rem",
            marginBottom: "8px",
          }}
        >
          Doctors
        </h1>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.24rem",
            margin: 0,
            marginBottom: 6,
          }}
        >
          Our Best Doctors At Your Service
        </h2>
        <p
          style={{
            textAlign: "center",
            margin: "0 auto",
            marginBottom: 12,
            maxWidth: 850,
            fontSize: "1rem",
            color: "#333",
            lineHeight: 1.6,
          }}
        >
          Experience unparalleled medical expertise with our team of best-in-class doctors.<br />
          At Health Clinics, we take pride in offering you the highest standard of care, delivered by dedicated professionals committed to your well-being.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "30px 0 16px 0",
            position: "relative",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <button
            aria-label="Previous"
            disabled={start <= 0}
            style={{
              border: "2px solid #3870FF",
              background: "#fff",
              color: "#3870FF",
              borderRadius: "50%",
              width: 50,
              height: 50,
              fontSize: 20,
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(56,112,255,0.2)",
              cursor: start > 0 ? "pointer" : "not-allowed",
              opacity: start > 0 ? 1 : 0.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
            }}
            onClick={() => setStart(Math.max(start - 1, 0))}
            onMouseEnter={e => {
              if (start > 0) {
                e.currentTarget.style.background = "#3870FF";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#3870FF";
            }}
          >
            &lt;
          </button>
          <div style={{ display: "flex", gap: 24 }}>
            {doctors.slice(start, start + visible).map((doctor, idx) => (
              <div
                key={doctor.name}
                style={{
                  background: "#eaf5fa",
                  borderRadius: 18,
                  boxShadow: "0 2px 12px rgba(56,112,255,0.12)",
                  padding: "22px 18px 16px 18px",
                  width: 210,
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
          <button
            aria-label="Next"
            disabled={start >= maxIndex}
            style={{
              border: "2px solid #3870FF",
              background: "#fff",
              color: "#3870FF",
              borderRadius: "50%",
              width: 50,
              height: 50,
              fontSize: 20,
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(56,112,255,0.2)",
              cursor: start < maxIndex ? "pointer" : "not-allowed",
              opacity: start < maxIndex ? 1 : 0.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "20px",
            }}
            onClick={() => setStart(Math.min(start + 1, maxIndex))}
            onMouseEnter={e => {
              if (start < maxIndex) {
                e.currentTarget.style.background = "#3870FF";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#3870FF";
            }}
          >
            &gt;
          </button>
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
        <div style={{ textAlign: "center", marginBottom: "0px" }}>
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
    <div
      style={{
        width: "100%",
        background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "28px 0",
        marginTop: "0px",
      }}
    >
      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: 1260,
        justifyContent: "space-between",
        gap: "0px"
      }}>
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
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      minWidth: 0,
      borderRight: "1px solid rgba(255,255,255,0.13)"
    }}>
      <div style={{ marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: "2.3rem", fontWeight: 600, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: "1.08rem", fontWeight: 400, opacity: 0.92 }}>
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
  const maxIndex = specialties.length - visible;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "sans-serif",
        padding: "0",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 1300,
          padding: "44px 0 60px 0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div
            style={{
              background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 500,
              fontSize: "1rem",
              marginBottom: 6,
            }}
          >
            Health Clinics Services
          </div>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "1.34rem",
              margin: 0,
              marginBottom: 6,
            }}
          >
            Medical Services of The Specialties
          </h2>
          <p
            style={{
              color: "#444",
              fontSize: "1.04rem",
              margin: 0,
              marginBottom: 32,
            }}
          >
            Our commitment to your health extends beyond routine care.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            gap: 24,
            marginBottom: "22px",
            position: "relative",
          }}
        >
          <button
            aria-label="Previous"
            disabled={start <= 0}
            style={{
              border: "none",
              background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
              color: "#fff",
              borderRadius: "50%",
              width: 36,
              height: 36,
              fontSize: 26,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              position: "absolute",
              left: -52,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: start > 0 ? "pointer" : "not-allowed",
              opacity: start > 0 ? 1 : 0.4,
              zIndex: 2,
            }}
            onClick={() => setStart(Math.max(start - 1, 0))}
          >
            &#60;
          </button>
          {specialties.slice(start, start + visible).map((item, idx) => (
            <div
              key={item.title}
              style={{
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 2px 14px rgba(56,112,255,0.11)",
                padding: "38px 18px 22px 18px",
                width: 287,
                minHeight: 340,
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
                    e.currentTarget.style.display = 'none';
                    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextSibling) {
                      nextSibling.style.display = 'flex';
                    }
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
              <a
                href={item.link}
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
                }}
                onClick={() => alert(`Learn more about ${item.title}`)}
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
              </a>
            </div>
          ))}
          <button
            aria-label="Next"
            disabled={start >= maxIndex}
            style={{
              border: "none",
              background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
              color: "#fff",
              borderRadius: "50%",
              width: 36,
              height: 36,
              fontSize: 26,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              position: "absolute",
              right: -52,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: start < maxIndex ? "pointer" : "not-allowed",
              opacity: start < maxIndex ? 1 : 0.4,
              zIndex: 2,
            }}
            onClick={() => setStart(Math.min(start + 1, maxIndex))}
          >
            &#62;
          </button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {Array.from({ length: specialties.length - visible + 1 }).map((_, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: start === i ? "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)" : "#e2e6f2",
                borderRadius: "50%",
                margin: "0 6px",
                transition: "background 0.2s",
              }}
            ></span>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <a
            href="/more-services"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#3870FF",
              border: "2px solid #3870FF",
              borderRadius: 28,
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(56,112,255,0.09)",
              textDecoration: "none",
              transition: "background 0.18s, color 0.18s",
            }}
            onClick={() => alert('Find More Services - Coming Soon!')}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#3870FF";
            }}
          >
            Find More Services &rarr;
          </a>
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
    <div
      style={{
        minHeight: "100vh",
        background: "#eaf0fa",
        fontFamily: "sans-serif",
        padding: "0",
        marginTop: "-40px",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 1400,
          padding: "40px 0 0px 0",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginTop: 0,
            marginBottom: 20,
            fontWeight: 700,
            fontSize: "1.32rem",
          }}
        >
          Our Latest & Most Popular Wellness Tips For You
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 60,
            flexWrap: "wrap",
          }}
        >
          {tips.map((tip, idx) => (
            <div
              key={tip.title}
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 2px 14px rgba(56,112,255,0.13)",
                width: 355,
                minHeight: 440,
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
                    console.log('Image failed to load:', tip.img);
                    e.currentTarget.style.display = 'none';
                    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextSibling) {
                      nextSibling.style.display = 'flex';
                    }
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
                    background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
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
                <a
                  href={tip.link}
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
                    transition: "background 0.18s, color 0.18s",
                  }}
                  onClick={() => alert(`Learn more about: ${tip.title}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.background =
                      "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#3870FF";
                  }}
                >
                  Learn More &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}