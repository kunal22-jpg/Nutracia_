import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ArchedCard from '../components/ArchedCard.jsx'

const WORKOUTS = [
  {
    id: 1, title: 'HIIT Cardio', description: 'Fast-paced high-intensity interval training',
    videoUrl: 'https://www.youtube.com/embed/ml6cT4AZdqI',
    duration: '20 min', level: 'Intermediate', muscle_groups: ['Full body', 'Cardiovascular'],
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Mat', 'Water bottle'],
    steps: ['Warm-up jog 2 min', 'Jump squats 30s on/15s rest', 'Burpees 30s on/15s rest', 'Plank jacks 30s on/15s rest', 'High knees 30s on/15s rest', 'Mountain climbers 30s on/15s rest', 'Cool down stretch']
  },
  {
    id: 2, title: 'Core Strength', description: 'Focused abs and obliques workout',
    videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
    duration: '15 min', level: 'Beginner', muscle_groups: ['Core', 'Abs', 'Obliques'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Mat'],
    steps: ['Crunches 3×15', 'Leg raises 3×12', 'Plank 3×45s', 'Russian twists 3×20', 'Dead bug 3×10 each', 'Stretch']
  },
  {
    id: 4, title: 'Upper Body', description: 'Dumbbell arm, chest and back routine',
    videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
    duration: '30 min', level: 'Intermediate', muscle_groups: ['Chest', 'Arms', 'Shoulders', 'Back'],
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Dumbbells', 'Bench', 'Mat'],
    steps: ['Chest press 3×12', 'Bicep curls 3×15', 'Shoulder press 3×10', 'Tricep dips 3×12', 'Bent rows 3×12', 'Stretch']
  },
  {
    id: 5, title: 'Stretch', description: 'Cooldown and muscle release session',
    videoUrl: 'https://www.youtube.com/embed/QXwz1u0vpy4',
    duration: '15 min', level: 'All Levels', muscle_groups: ['Full body flexibility'],
    image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Mat'],
    steps: ['Hamstring stretch 30s each', 'Cat-cow 10 reps', 'Childs pose 45s', 'Hip flexor 30s each', 'Shoulder rolls', 'Deep breathing']
  },
  {
    id: 6, title: 'Resistance Band', description: 'Resistance-based strength training',
    videoUrl: 'https://www.youtube.com/embed/Hlj6lgV5wUQ',
    duration: '30 min', level: 'Intermediate', muscle_groups: ['Full body', 'Functional strength'],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Resistance bands', 'Mat'],
    steps: ['Band chest press 3×15', 'Banded squats 3×12', 'Overhead press 3×12', 'Band rows 3×15', 'Lateral walks 3×10', 'Stretch']
  },
  {
    id: 7, title: 'Mobility Flow', description: 'Joint flexibility and full motion range',
    videoUrl: 'https://www.youtube.com/embed/8BcPHWGQO44',
    duration: '10 min', level: 'Beginner', muscle_groups: ['Joints', 'Mobility'],
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Mat'],
    steps: ['Arm circles 30s', 'Hip openers 10 each', 'Spinal roll 5 reps', 'Shoulder shrugs 10', 'Deep lunge twist 30s', 'Breathing']
  }
]

export default function WorkoutPage() {
  const [selected, setSelected] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const theme = { accent: '#8C3B1F', bg: '#FFFFF0' }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % WORKOUTS.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + WORKOUTS.length) % WORKOUTS.length)

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
                    item={WORKOUTS[(currentIndex - 1 + WORKOUTS.length) % WORKOUTS.length]} 
                    isActive={false}
                    onClick={prevSlide}
                    theme={theme}
                  />
                </div>
                <ArchedCard 
                  item={WORKOUTS[currentIndex]} 
                  isActive={true} 
                  onClick={setSelected}
                  theme={theme}
                />
                <div className="hidden lg:block">
                  <ArchedCard 
                    item={WORKOUTS[(currentIndex + 1) % WORKOUTS.length]} 
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
              {WORKOUTS.length.toString().padStart(2, '0')}
            </span>
          </div>
          <button onClick={nextSlide} className="flex items-center group" style={{ color: theme.bg }}>
            <div className="w-10 h-[1px] mr-1 opacity-50" style={{ backgroundColor: theme.bg }}></div>
            <ArrowRight size={20} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} item={selected} type="workout" />
    </div>
  )
}
