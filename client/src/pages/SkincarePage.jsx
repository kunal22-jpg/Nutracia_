import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ArchedCard from '../components/ArchedCard.jsx'
import Aurora from '../components/Aurora.jsx'

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
  const [currentIndex, setCurrentIndex] = useState(1)
  const theme = { accent: '#4B1D3F', bg: '#D6C1E8' }

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
    const newIdx = (prev + 1) % ROUTINES.length;
    scrollToItem(newIdx);
    return newIdx;
  })
  const prevSlide = () => setCurrentIndex((prev) => {
    const newIdx = (prev - 1 + ROUTINES.length) % ROUTINES.length;
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
            {ROUTINES.map((item, i) => (
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
