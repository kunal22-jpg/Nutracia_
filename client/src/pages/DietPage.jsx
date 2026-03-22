import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ArchedCard from '../components/ArchedCard.jsx'

const DIETS = [
  {
    id: 1, title: 'Mediterranean', description: 'Heart-healthy nutrition with olive oil, fish, and vegetables',
    videoUrl: 'https://www.youtube.com/embed/NP7nHOZPPpw',
    duration: 'Lifestyle Plan', level: 'Beginner', calories: '1,800–2,200/day',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Olive oil', 'Fresh fish', 'Vegetables', 'Whole grains', 'Nuts'],
    steps: ['Greek yogurt + berries breakfast', 'Fish 2-3x per week', 'Olive oil as primary fat', 'Plenty of vegetables daily', 'Nuts and legumes daily', 'Limit red meat to 1-2x/week']
  },
  {
    id: 2, title: 'Keto Plan', description: 'Low-carb, high-fat approach for rapid weight loss',
    videoUrl: 'https://youtu.be/Qifg5hxnlJE?si=QJmkJm_9XVJ_Vs7K',
    duration: '4–12 weeks', level: 'Intermediate', calories: '1,500–2,000/day',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Avocados', 'MCT oil', 'Leafy greens', 'Quality proteins', 'Electrolytes'],
    steps: ['Keep carbs under 20-25g/day', 'Fats 70-75% of calories', 'Moderate protein 20-25%', 'Include avocados and MCT oil', 'Track ketones with test strips', 'Supplement electrolytes']
  },
  {
    id: 3, title: 'Plant-Based', description: 'Complete vegan nutrition for optimal health',
    videoUrl: 'https://www.youtube.com/embed/d5wabeFG9pM',
    duration: 'Lifestyle Plan', level: 'Beginner', calories: '1,800–2,200/day',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Legumes', 'Quinoa', 'Nutritional yeast', 'B12 supplement', 'Nuts'],
    steps: ['Focus on whole unprocessed foods', 'Protein from beans lentils quinoa tofu', 'Rainbow of fruits and vegetables', 'Include B12 vitamin D omega-3 supplements', 'Choose whole grains', 'Meal prep for balance']
  },
  {
    id: 4, title: 'DASH Diet', description: 'Designed to naturally lower blood pressure',
    videoUrl: 'https://www.youtube.com/embed/kDwjF8D2OvI',
    duration: 'Lifestyle Plan', level: 'Beginner', calories: '1,600–2,000/day',
    image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Low-sodium foods', 'Fresh produce', 'Lean proteins', 'Whole grains'],
    steps: ['Reduce sodium to 2300mg/day', '4-5 servings fruits/veg daily', 'Include low-fat dairy', 'Choose lean poultry and fish', 'Limit saturated fats', 'Whole grains at each meal']
  },
  {
    id: 5, title: 'IF 16:8', description: 'Time-restricted eating for metabolic health',
    videoUrl: 'https://www.youtube.com/embed/f67_w0lOr0M',
    duration: 'Ongoing Protocol', level: 'Intermediate', calories: 'Eat within window',
    image: 'https://tse2.mm.bing.net/th/id/OIP.3BeJ_j7Q1_v5WUwrFA2-agHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    requirements: ['Timer app', 'Electrolyte supplements', 'Quality whole foods'],
    steps: ['Fast 16 hours eat in 8-hour window', 'Start 12pm–8pm eating window', 'Break fast with nutrient-dense foods', 'Stay hydrated during fasting', 'Include protein every meal', 'Focus on whole foods']
  },
  {
    id: 6, title: 'High-Protein', description: 'Muscle building and weight management focus',
    videoUrl: 'https://www.youtube.com/embed/bfcxNRgq_54',
    duration: '8–12 weeks', level: 'Intermediate', calories: '1,800–2,400/day',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Lean meats', 'Protein powder', 'Eggs', 'Greek yogurt'],
    steps: ['1.2–1.6g protein per kg bodyweight', 'Protein at every meal', 'Lean meats fish eggs dairy', 'Protein powder if needed', 'Time protein around workouts', 'Stay hydrated']
  },
  {
    id: 7, title: 'Anti-Inflammatory', description: 'Reduce inflammation with healing foods',
    videoUrl: 'https://www.youtube.com/embed/ECr8SKS6LJU',
    duration: 'Lifestyle Plan', level: 'Beginner', calories: '1,800–2,200/day',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Turmeric', 'Ginger', 'Omega-3 sources', 'Colorful produce'],
    steps: ['Omega-3 rich foods daily', 'Colorful antioxidant fruits and veg', 'Use turmeric and ginger', 'Avoid processed foods and sugar', 'Include green tea', 'Limit inflammatory oils']
  },
  {
    id: 8, title: 'Balanced Macro', description: 'Perfect macronutrient balance for sustained energy',
    videoUrl: 'https://www.youtube.com/embed/XbpvRbgQZbw',
    duration: 'Flexible', level: 'Beginner', calories: 'Based on goals',
    image: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Food scale', 'Macro tracking app', 'Whole foods'],
    steps: ['40% carbs 30% protein 30% fat', 'Choose complex carbohydrates', 'Lean protein sources', 'Healthy fats from nuts and oils', 'Eat every 3-4 hours', 'Track macros with an app']
  }
]

export default function DietPage() {
  const [selected, setSelected] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const theme = { accent: '#004e64', bg: '#E0E5E9' }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % DIETS.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + DIETS.length) % DIETS.length)

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative" style={{ backgroundColor: theme.bg }}>
      <div className="flex-1 relative flex items-center justify-center pt-10 pb-24">
        <div className="flex items-center justify-center gap-12 max-w-[95vw]">
          <div className="relative flex items-center justify-center overflow-visible">
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={currentIndex}
                className="flex items-center justify-center gap-12"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="hidden lg:block">
                  <ArchedCard 
                    item={DIETS[(currentIndex - 1 + DIETS.length) % DIETS.length]} 
                    isActive={false}
                    onClick={prevSlide}
                    theme={theme}
                  />
                </div>
                <ArchedCard 
                  item={DIETS[currentIndex]} 
                  isActive={true} 
                  onClick={setSelected}
                  theme={theme}
                />
                <div className="hidden lg:block">
                  <ArchedCard 
                    item={DIETS[(currentIndex + 1) % DIETS.length]} 
                    isActive={false}
                    onClick={nextSlide}
                    theme={theme}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-8 py-4 rounded-full flex items-center gap-10 shadow-2xl"
          style={{ backgroundColor: theme.accent }}
        >
          <button onClick={prevSlide} className="flex items-center group" style={{ color: theme.bg }}>
            <ArrowLeft size={20} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
            <div className="w-10 h-[1px] ml-1 opacity-50" style={{ backgroundColor: theme.bg }}></div>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold leading-none mb-1" style={{ color: theme.bg }}>
              {(currentIndex + 1).toString().padStart(2, '0')}
            </span>
            <span className="text-sm font-medium opacity-60 leading-none" style={{ color: theme.bg }}>
              {DIETS.length.toString().padStart(2, '0')}
            </span>
          </div>
          <button onClick={nextSlide} className="flex items-center group" style={{ color: theme.bg }}>
            <div className="w-10 h-[1px] mr-1 opacity-50" style={{ backgroundColor: theme.bg }}></div>
            <ArrowRight size={20} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} item={selected} type="diet" />
    </div>
  )
}
