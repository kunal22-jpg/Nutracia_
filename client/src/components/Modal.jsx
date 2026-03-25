import { AnimatePresence, motion } from 'framer-motion'
import { X, Play, Clock, Star } from 'lucide-react'

export default function Modal({ isOpen, onClose, item, type }) {
  if (!isOpen || !item) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative glass-strong rounded-3xl p-6 max-w-3xl w-full max-h-[88vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-5 right-5 p-2.5 rounded-full glass hover:bg-white/20 transition-colors z-10">
            <X size={18} className="text-white" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-1 pr-10">{item.title || item.name}</h2>
          <p className="text-white/70 mb-5">{item.description}</p>

          {/* Video embed */}
          {(item.videoUrl || item.video || item.youtube_video) && (
            <div className="mb-5 rounded-2xl overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={item.videoUrl || item.video || item.youtube_video}
                  title={item.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap gap-3 mb-5">
            {item.duration && (
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-white text-sm">{item.duration}</span>
              </div>
            )}
            {(item.level || item.difficulty) && (
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <Star size={16} className="text-amber-400" />
                <span className="text-white text-sm capitalize">{item.level || item.difficulty}</span>
              </div>
            )}
            {item.calories && (
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-orange-400">🔥</span>
                <span className="text-white text-sm">{item.calories}</span>
              </div>
            )}
            {item.skinType && (
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-pink-400">✨</span>
                <span className="text-white text-sm">{item.skinType}</span>
              </div>
            )}
          </div>

          {/* Steps / instructions */}
          {(item.steps || item.instructions) && (
            <div className="glass rounded-2xl p-4 mb-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-green-400">✓</span> Steps
              </h4>
              <ol className="space-y-2">
                {(item.steps || item.instructions).map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-xs">{i+1}</span>
                    <span className="text-white/85 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Requirements */}
          {item.requirements?.length > 0 && (
            <div className="glass rounded-2xl p-4 mb-4">
              <h4 className="font-semibold text-white mb-3">🎯 Requirements</h4>
              <div className="flex flex-wrap gap-2">
                {item.requirements.map((r, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-xs">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {item.benefits?.length > 0 && (
            <div className="glass rounded-2xl p-4 mb-4">
              <h4 className="font-semibold text-white mb-3">✨ Benefits</h4>
              <div className="flex flex-wrap gap-2">
                {item.benefits.map((b, i) => (
                  <span key={i} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-xs">{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Muscle groups */}
          {item.muscle_groups?.length > 0 && (
            <div className="glass rounded-2xl p-4 mb-4">
              <h4 className="font-semibold text-white mb-3">💪 Target Muscles</h4>
              <div className="flex flex-wrap gap-2">
                {item.muscle_groups.map((m, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-xs">{m}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button onClick={onClose} className="btn-primary">
              ✨ Start {type === 'workout' ? 'Workout' : type === 'skincare' ? 'Routine' : type === 'diet' ? 'Diet Plan' : 'Practice'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
