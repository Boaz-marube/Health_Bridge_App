import { FaSmile, FaHeartbeat, FaCheck } from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";

const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      image: "/logo.jpg",
      rating: 5,
      text: "Health Bridge has transformed my healthcare experience. The online appointment booking is so convenient, and the doctors are incredibly professional and caring."
    },
    {
      name: "Michael Chen",
      role: "Patient",
      image: "/logo.jpg",
      rating: 5,
      text: "I love how easy it is to track my appointments and access my medical records. The AI reminders have helped me stay on top of my health routine."
    },
    {
      name: "Emily Rodriguez",
      role: "Patient",
      image: "/logo.jpg",
      rating: 5,
      text: "The queue tracking feature is amazing! No more waiting in crowded waiting rooms. I can see exactly when it's my turn from the comfort of my home."
    }
  ];

  return (
    <section id="testimonials" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         {/* Stats Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20 bg-gradient-to-r from-[#38B7FF] to-[#3870FF] rounded-2xl p-6 sm:p-8 lg:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center text-white">
            <div className="space-y-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 rounded-lg p-4 hover:-translate-y-1">
              <FaSmile className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">135k+</div>
              <div className="text-sm sm:text-base opacity-90">Satisfied Patients</div>
            </div>
            <div className="space-y-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 rounded-lg p-4 hover:-translate-y-1">
              <FaHeartbeat className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">24</div>
              <div className="text-sm sm:text-base opacity-90">Health Departments</div>
            </div>
            <div className="space-y-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 rounded-lg p-4 hover:-translate-y-1">
              <MdLocalHospital className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">19</div>
              <div className="text-sm sm:text-base opacity-90">Facilities</div>
            </div>
            <div className="space-y-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 rounded-lg p-4 hover:-translate-y-1">
              <FaCheck className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">25+</div>
              <div className="text-sm sm:text-base opacity-90">Insurance Partners</div>
            </div>
          </div>
        </div>



        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-[#38B7FF] to-[#3870FF] bg-clip-text text-transparent">
            What Our Patients Say
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 mx-auto rounded-full mb-4" style={{ background: GRADIENT_STYLE }}></div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Real experiences from our valued patients who trust Health Bridge for their healthcare needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Rating Stars */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Patient Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 p-0.5 flex-shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover rounded-full bg-white"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
}