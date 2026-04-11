import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ArchedCard from '../components/ArchedCard.jsx'
import Aurora from '../components/Aurora.jsx'

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
  const [currentIndex, setCurrentIndex] = useState(1)
  const theme = { accent: '#004e64', bg: '#E0E5E9' }

  const scrollRef = useRef(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToItem(1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToItem = (idx) => {
    if (scrollRef.current && scrollRef.current.children[idx]) {
      scrollRef.current.children[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  const nextSlide = () => setCurrentIndex((prev) => {
    const newIdx = (prev + 1) % DIETS.length;
    scrollToItem(newIdx);
    return newIdx;
  })
  const prevSlide = () => setCurrentIndex((prev) => {
    const newIdx = (prev - 1 + DIETS.length) % DIETS.length;
    scrollToItem(newIdx);
    return newIdx;
  })

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-[#050507]">
      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; } 
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Background (Matching VoicePage) */}
      <div className="absolute inset-0 bg-[#050507] overflow-hidden z-0">
        <div className="absolute inset-0 opacity-[0.8]">
          <Aurora colorStops={['#3b82f6', '#8b5cf6', '#3b82f6']} amplitude={0.9} blend={0.6} />
        </div>
        {/* Dotted Grid */}
        <div className="absolute inset-0 opacity-[0.35]" style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />
        {/* Dark gradient to fade out the top */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#050507]/80 to-transparent" />
      </div>

      <div className="flex-1 relative flex items-center justify-center pt-10 pb-24 z-10">
        <div className="w-full flex items-center justify-center max-w-[100vw]">
          <div ref={scrollRef} className="w-full overflow-x-auto flex items-center gap-12 px-[50vw] snap-x snap-mandatory h-[700px] hidden-scrollbar" style={{ paddingLeft: 'calc(50vw - 225px)', paddingRight: 'calc(50vw - 225px)' }}>
            {DIETS.map((item, i) => (
              <div key={item.id} className="snap-center shrink-0">
                <ArchedCard 
                  item={item}
                  isActive={currentIndex === i}
                  onClick={(clickedItem) => {
                    setSelected(clickedItem);
                    setCurrentIndex(i);
                    scrollToItem(i);
                  }}
                  theme={theme}
                />
              </div>
            ))}
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
