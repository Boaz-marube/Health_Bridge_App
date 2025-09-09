"use client";

import { useState } from "react";
import { X } from "lucide-react";

const GRADIENT_STYLE = "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)";

interface Tip {
  img: string;
  title: string;
  desc: string;
  label: string;
  id: string;
  fullArticle: {
    content: string;
  };
}

export function WellnessTips() {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const tips: Tip[] = [
    {
      img: "/paper.png",
      title: "Navigating the Wellness Landscape: Latest Insights in Medical Health",
      desc: "Explore groundbreaking tips and tricks to enhance your overall health and well-being.",
      label: "Health Tips",
      id: "health-tips",
      fullArticle: {
        content: "Maintaining optimal health requires a comprehensive approach that encompasses physical, mental, and emotional well-being. In today's fast-paced world, it's crucial to understand the latest insights in medical health and wellness practices.\n\nRegular health check-ups are fundamental to preventive care. Early detection of potential health issues can significantly improve treatment outcomes and quality of life. Schedule annual physical examinations and follow your healthcare provider's recommendations for screenings based on your age and risk factors.\n\nNutrition plays a pivotal role in overall wellness. Focus on consuming a balanced diet rich in fruits, vegetables, whole grains, and lean proteins. Limit processed foods, excessive sugar, and unhealthy fats. Stay hydrated by drinking adequate water throughout the day.\n\nPhysical activity is essential for maintaining cardiovascular health, muscle strength, and mental well-being. Aim for at least 150 minutes of moderate-intensity exercise per week, as recommended by health professionals.\n\nMental health is equally important as physical health. Practice stress management techniques such as meditation, deep breathing exercises, or engaging in hobbies you enjoy. Don't hesitate to seek professional help when needed."
      }
    },
    {
      img: "/food.png",
      title: "Healthy Habits 101: A Guide to Boosting Your Immune System",
      desc: "Discover the most popular and effective strategies for maintaining a robust immune health.",
      label: "Diet & Nutrition",
      id: "diet-nutrition",
      fullArticle: {
        content: "A strong immune system is your body's first line of defense against infections and diseases. Building and maintaining robust immunity requires consistent healthy habits and lifestyle choices.\n\nNutrition is the cornerstone of immune health. Include vitamin C-rich foods like citrus fruits, berries, and leafy greens in your daily diet. Zinc, found in nuts, seeds, and legumes, plays a crucial role in immune function. Vitamin D, obtained through sunlight exposure and fortified foods, is essential for immune regulation.\n\nProbiotics support gut health, which is closely linked to immune function. Include yogurt, kefir, sauerkraut, and other fermented foods in your diet to maintain a healthy gut microbiome.\n\nAdequate sleep is vital for immune system recovery and function. Aim for 7-9 hours of quality sleep each night. Establish a consistent sleep schedule and create a relaxing bedtime routine.\n\nRegular exercise boosts immune function by promoting good circulation and reducing inflammation. However, avoid overexercising, which can temporarily suppress immunity.\n\nStress management is crucial as chronic stress weakens the immune system. Practice relaxation techniques, maintain social connections, and engage in activities that bring you joy."
      }
    },
    {
      img: "/gym.png",
      title: "Mind-Body Harmony: The Power of Holistic Health Practices",
      desc: "Unlock the secrets to a balanced life with our latest tips on integrating mind and body wellness.",
      label: "Exercise & Fitness",
      id: "exercise-fitness",
      fullArticle: {
        content: "The connection between mind and body is profound, and achieving harmony between these two aspects is essential for optimal health and well-being. Holistic health practices recognize this interconnection and provide comprehensive approaches to wellness.\n\nMindfulness and meditation are powerful tools for achieving mind-body harmony. Regular meditation practice can reduce stress, improve focus, and enhance emotional regulation. Start with just 5-10 minutes daily and gradually increase the duration.\n\nYoga combines physical movement with mindfulness, making it an excellent holistic practice. It improves flexibility, strength, and balance while promoting mental clarity and stress reduction. Choose a style that suits your fitness level and preferences.\n\nBreathing exercises are simple yet effective techniques for connecting mind and body. Deep, controlled breathing activates the parasympathetic nervous system, promoting relaxation and reducing stress hormones.\n\nRegular physical exercise not only strengthens the body but also releases endorphins that improve mood and mental well-being. Find activities you enjoy, whether it's walking, swimming, dancing, or strength training.\n\nNature therapy, or spending time outdoors, has been shown to reduce stress, improve mood, and boost immune function. Make time for regular outdoor activities, even if it's just a short walk in a local park.\n\nHolistic nutrition focuses on whole, unprocessed foods that nourish both body and mind. Pay attention to how different foods make you feel and choose options that support your overall well-being."
      }
    },
  ];

  const openModal = (tip: Tip) => {
    setSelectedTip(tip);
  };

  const closeModal = () => {
    setSelectedTip(null);
  };

  return (
    <>
      <section id="wellness-tips" className="py-12 sm:py-16 lg:py-20 bg-blue-50 dark:bg-gray-800 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4" style={{ background: GRADIENT_STYLE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Wellness Tips
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 mx-auto rounded-full mb-4" style={{ background: GRADIENT_STYLE }}></div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our Latest & Most Popular Wellness Tips For You
            </p>
          </div>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer w-full flex flex-col"
              >
                <div className="relative h-48 sm:h-56 lg:h-48">
                  <img
                    src={tip.img}
                    alt={tip.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-full">
                      {tip.label}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 line-clamp-3 flex-1">
                    {tip.desc}
                  </p>
                  <button
                    onClick={() => openModal(tip)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 font-semibold rounded-lg transition-all duration-500 text-xs sm:text-sm lg:text-base border-2 border-blue-500 text-blue-500 hover:text-white hover:shadow-lg relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-out" style={{ background: GRADIENT_STYLE }}></span>
                    <span className="relative z-10">Learn More →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedTip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 text-white text-sm font-medium rounded-full" style={{ background: GRADIENT_STYLE }}>
                  {selectedTip.label}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <img 
                src={selectedTip.img} 
                alt={selectedTip.title} 
                className="w-full h-64 sm:h-80 object-cover rounded-lg mb-6"
                onError={(e) => {
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedTip.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {selectedTip.desc}
              </p>
              <div className="prose prose-lg max-w-none">
                {selectedTip.fullArticle.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 dark:text-gray-200 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}