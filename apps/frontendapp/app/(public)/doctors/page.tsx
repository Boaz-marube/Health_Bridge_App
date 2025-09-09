"use client";



import { FaUserMd, FaGraduationCap, FaAward, FaStar } from "react-icons/fa";

const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

export default function DoctorsPage() {






  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      experience: "15 years",
      education: "MD from Harvard Medical School",
      rating: 4.9,
      patients: "2,500+",
      image: "/logo.jpg",
      description: "Specialized in cardiovascular diseases and preventive cardiology with extensive experience in heart surgery."
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Neurologist",
      experience: "12 years",
      education: "MD from Johns Hopkins University",
      rating: 4.8,
      patients: "1,800+",
      image: "/logo.jpg",
      description: "Expert in neurological disorders, brain injuries, and advanced neurosurgical procedures."
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      experience: "10 years",
      education: "MD from Stanford Medical School",
      rating: 4.9,
      patients: "3,200+",
      image: "/logo.jpg",
      description: "Dedicated to children's health and development with a focus on preventive care and family medicine."
    },
    {
      id: 4,
      name: "Dr. David Wilson",
      specialization: "Orthopedic Surgeon",
      experience: "18 years",
      education: "MD from Mayo Clinic College",
      rating: 4.7,
      patients: "2,100+",
      image: "/logo.jpg",
      description: "Specializes in joint replacement, sports medicine, and minimally invasive orthopedic procedures."
    },
    {
      id: 5,
      name: "Dr. Lisa Thompson",
      specialization: "Dermatologist",
      experience: "8 years",
      education: "MD from UCLA Medical School",
      rating: 4.8,
      patients: "1,500+",
      image: "/logo.jpg",
      description: "Expert in skin conditions, cosmetic dermatology, and advanced laser treatments."
    },
    {
      id: 6,
      name: "Dr. James Anderson",
      specialization: "General Surgeon",
      experience: "20 years",
      education: "MD from University of Pennsylvania",
      rating: 4.9,
      patients: "2,800+",
      image: "/logo.jpg",
      description: "Experienced in complex surgical procedures with a focus on minimally invasive techniques."
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-8 sm:py-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
                Our Doctors
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Meet our experienced healthcare professionals dedicated to providing exceptional care.
              </p>
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="py-8 sm:py-12 mb-8 sm:mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Doctor Image */}
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 p-1">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover rounded-full bg-white"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {doctor.specialization}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center justify-center mb-4">
                      <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {doctor.rating}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaUserMd className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {doctor.experience} experience
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaGraduationCap className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {doctor.education}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaAward className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {doctor.patients} patients treated
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                    {doctor.description}
                  </p>


                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 sm:py-12 mb-8 sm:mb-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
                Why Choose Our Doctors
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaUserMd className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Expert Care</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Board-certified doctors with years of specialized experience in their fields.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaAward className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Proven Results</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  High patient satisfaction rates and successful treatment outcomes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: GRADIENT_STYLE }}>
                  <FaGraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Continuous Learning</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Committed to staying updated with the latest medical advances and techniques.
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}