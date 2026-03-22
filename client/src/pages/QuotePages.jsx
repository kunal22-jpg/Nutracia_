import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import VideoBackground from '../components/VideoBackground.jsx'

const PAGES = {
  workout: { bg: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg', quote: 'Push beyond yesterday, embrace tomorrow\'s strength.', accent: 'from-red-400 to-orange-400', section: 'Workout' },
  skincare: { bg: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=1200', quote: 'Radiance is your right, glow is your gift.', accent: 'from-pink-400 to-purple-400', section: 'Skincare' },
  diet: { bg: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200', quote: 'Eat vibrant, live radiant, nourish your soul.', accent: 'from-green-400 to-emerald-400', section: 'Nutrition' },
  health: { bg: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200', quote: 'Wellness is wealth, health is your treasure.', accent: 'from-red-400 to-pink-400', section: 'Health' },
  'mind-soul': { bg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', quote: 'Peace comes from within, mindfulness is the key.', accent: 'from-purple-400 to-pink-400', section: 'Mind & Soul' },
  'order-up': { bg: 'https://images.pexels.com/photos/668353/pexels-photo-668353.jpeg', quote: 'Smart shopping starts with understanding you.', accent: 'from-amber-400 to-orange-400', section: 'Smart Shopping' },
  diary: { bg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200', quote: 'Write your soul, heal your heart.', accent: 'from-rose-400 to-pink-400', section: 'Diary' },
  voice: { bg: 'https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=1200', quote: 'Your voice holds the power to heal.', accent: 'from-violet-400 to-purple-400', section: 'Voice Therapy' },
  nearby: { bg: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200', quote: 'Help is always closer than you think.', accent: 'from-teal-400 to-cyan-400', section: 'Nearby Care' },
}

export function QuotePage({ page }) {
  const config = PAGES[page] || PAGES.workout
  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={config.bg} overlay="bg-black/55" />
      <div className="relative z-10 pt-32 px-6 min-h-screen flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto">
          <div className="glass rounded-3xl p-12 mb-10">
            <p className="font-vibes text-5xl md:text-6xl text-white leading-tight mb-6">"{config.quote}"</p>
            <div className={`w-24 h-1 bg-gradient-to-r ${config.accent} mx-auto rounded-full`} />
          </div>
          <div className="glass rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">Unlock {config.section}</h3>
            <p className="text-white/60 text-sm mb-5">
              Get personalized {config.section.toLowerCase()} plans, expert guidance, and exclusive AI features.
            </p>
            <Link to="/get-started" className="btn-primary block text-center">
              Login to Access →
            </Link>
            <p className="text-white/40 text-xs mt-3">Free forever · No credit card</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
