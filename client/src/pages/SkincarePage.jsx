import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ArchedCard from '../components/ArchedCard.jsx'

const ROUTINES = [
  {
    id: 'hydration', title: 'Hydration Boost', skinType: 'Dry Skin', time: 'Morning & Night', level: 'Beginner',
    video: 'https://www.youtube.com/embed/rXxNGl7YQcA',
    description: 'Deep hydration for dry, flaky skin',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Hydrating Cleanser', 'Hyaluronic Serum', 'Moisturizer', 'Facial Mist'],
    steps: ['Cleanse with gentle hydrating face wash', 'Apply hyaluronic acid serum', 'Seal with thick moisturizer', 'Mist with facial spray']
  },
  {
    id: 'acne', title: 'Acne Defense', skinType: 'Oily / Acne-Prone', time: 'Night Only', level: 'Intermediate',
    video: 'https://www.youtube.com/embed/wnTLCuRXEIc',
    description: 'Targeted acne treatment and prevention',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Salicylic Cleanser', 'Niacinamide', 'Spot Treatment', 'Oil-Free Moisturizer'],
    steps: ['Use salicylic acid cleanser', 'Apply niacinamide serum', 'Spot treat with benzoyl peroxide', 'Finish with lightweight gel moisturizer']
  },
  {
    id: 'glow', title: 'Glow Ritual', skinType: 'All Types', time: 'Morning', level: 'Beginner',
    video: 'https://www.youtube.com/embed/VVNNS2MDA00',
    description: 'Achieve that natural glow every morning',
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Vitamin C Cleanser', 'Antioxidant Serum', 'Sunscreen SPF 50'],
    steps: ['Vitamin C cleanse', 'Apply antioxidant serum', 'Apply SPF 50 sunscreen', 'Dab cream highlighter']
  },
  {
    id: 'antiaging', title: 'Anti-Aging', skinType: 'Mature Skin', time: 'Night Only', level: 'Advanced',
    video: 'https://www.youtube.com/embed/Sq3lNHgzwzE',
    description: 'Advanced anti-aging night routine',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Oil Cleanser', 'Retinol', 'Peptide Cream', 'Eye Serum'],
    steps: ['Double cleanse (oil then foam)', 'Apply retinol serum', 'Moisturize with peptide cream', 'Neck & under-eye massage']
  },
  {
    id: 'sensitive', title: 'Sensitive Repair', skinType: 'Sensitive', time: 'Evening', level: 'Beginner',
    video: 'https://www.youtube.com/embed/hv1zvKZTFnA',
    description: 'Gentle care for sensitive, reactive skin',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Micellar Cleanser', 'Calming Mist', 'Ceramide Cream', 'Barrier Balm'],
    steps: ['Use micellar water', 'Apply calming chamomile mist', 'Moisturize with ceramide cream', 'Optional overnight barrier balm']
  },
  {
    id: 'pore', title: 'Pore Minimizer', skinType: 'Oily / Combo', time: 'Morning', level: 'Intermediate',
    video: 'https://www.youtube.com/embed/X81ZRHZLkB8',
    description: 'Minimize pores and control oil',
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Clay Cleanser', 'BHA Toner', 'Mattifying Primer', 'Mineral SPF'],
    steps: ['Clay mask cleanse', 'Apply BHA toner', 'Apply mattifying primer', 'Finish with mineral SPF']
  },
  {
    id: 'detox', title: 'Weekend Detox', skinType: 'All Types', time: 'Weekly', level: 'Intermediate',
    video: 'https://www.youtube.com/embed/AoFzAkLDvlM',
    description: 'Weekly detox for refreshed skin',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Steam Device', 'Detox Mask', 'Jade Roller', 'Sleeping Pack'],
    steps: ['Steam face 5 minutes', 'Apply charcoal/green tea mask', 'Jade roller with detox oil', 'Seal with sleeping pack']
  },
  {
    id: 'brighten', title: 'Brighten & Tone', skinType: 'Dull Skin', time: 'Morning', level: 'Advanced',
    video: 'https://www.youtube.com/embed/UKwmsAhWwN0',
    description: 'Brighten complexion and even skin tone',
    image: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&h=1200&fit=crop&auto=format&q=80',
    requirements: ['Lactic Acid Toner', 'Niacinamide', 'Light Moisturizer', 'Glow SPF'],
    steps: ['Exfoliate with lactic acid toner', 'Apply brightening niacinamide', 'Layer lightweight moisturizer', 'Finish with glow SPF cream']
  }
]

export default function SkincarePage() {
  const [selected, setSelected] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const theme = { accent: '#4B1D3F', bg: '#D6C1E8' }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % ROUTINES.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + ROUTINES.length) % ROUTINES.length)

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
                    item={ROUTINES[(currentIndex - 1 + ROUTINES.length) % ROUTINES.length]} 
                    isActive={false}
                    onClick={prevSlide}
                    theme={theme}
                  />
                </div>
                <ArchedCard 
                  item={ROUTINES[currentIndex]} 
                  isActive={true} 
                  onClick={setSelected}
                  theme={theme}
                />
                <div className="hidden lg:block">
                  <ArchedCard 
                    item={ROUTINES[(currentIndex + 1) % ROUTINES.length]} 
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
              {ROUTINES.length.toString().padStart(2, '0')}
            </span>
          </div>
          <button onClick={nextSlide} className="flex items-center group" style={{ color: theme.bg }}>
            <div className="w-10 h-[1px] mr-1 opacity-50" style={{ backgroundColor: theme.bg }}></div>
            <ArrowRight size={20} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} item={selected} type="skincare" />
    </div>
  )
}
