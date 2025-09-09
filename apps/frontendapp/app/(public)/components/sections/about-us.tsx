import Image from "next/image";

const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

export function AboutUs() {
  return (
    <section id="about" className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4" style={{ background: GRADIENT_STYLE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>About Us</h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 mx-auto rounded-full" style={{ background: GRADIENT_STYLE }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-2/5">
                <div className="h-64 sm:h-80 lg:h-full min-h-[300px] relative">
                  <Image
                    src="/about-us.jpg"
                    alt="Health Bridge Team"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>
              <div className="w-full lg:w-3/5 p-4 sm:p-6 lg:p-8 xl:p-12">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 lg:mb-6">
                  Welcome to Health Bridge
                </h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                  Welcome to Health Clinics, where your well-being is our priority. Our mission is to provide exceptional healthcare services with a focus on compassion, expertise, and personalized care. At Health Clinics, we understand that your health is invaluable, and we are committed to ensuring that you receive the highest standard of medical attention.
                </p>
                <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                  <div className="flex items-start sm:items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-4 sm:mr-5 flex-shrink-0 mt-1 sm:mt-0" style={{ background: GRADIENT_STYLE }}></div>
                    <span className="text-gray-800 dark:text-gray-100 text-sm sm:text-base lg:text-lg xl:text-xl font-medium">24/7 Medical Services through online and offline</span>
                  </div>
                  <div className="flex items-start sm:items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-4 sm:mr-5 flex-shrink-0 mt-1 sm:mt-0" style={{ background: GRADIENT_STYLE }}></div>
                    <span className="text-gray-800 dark:text-gray-100 text-sm sm:text-base lg:text-lg xl:text-xl font-medium">Using Modern technology to diagnostic disease</span>
                  </div>
                  <div className="flex items-start sm:items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-4 sm:mr-5 flex-shrink-0 mt-1 sm:mt-0" style={{ background: GRADIENT_STYLE }}></div>
                    <span className="text-gray-800 dark:text-gray-100 text-sm sm:text-base lg:text-lg xl:text-xl font-medium">Easy and flexible to appoint a doctor</span>
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