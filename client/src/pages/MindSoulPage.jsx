import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import AIChatbot from '../components/AIChatbot.jsx'
import api from '../utils/api.js'
import Aurora from '../components/Aurora.jsx'

const BACKGROUNDS = {
  meditate: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80',
  breathing: 'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=1920&q=80',
  timer: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80'
}

const TABS = [
  { id: 'meditate', label: 'Meditate', icon: '🧘' },
  { id: 'breathing', label: 'Breathe', icon: '🫁' },
  { id: 'timer', label: 'Timer', icon: '⏱️' }
]

const MOODS = ['😢', '😔', '😐', '😊', '😄']
const BREATHING_STEPS = [
  { label: 'Inhale', count: 4, light: 'rgba(56,189,248,0.6)' },
  { label: 'Hold', count: 7, light: 'rgba(167,139,250,0.6)' },
  { label: 'Exhale', count: 8, light: 'rgba(52,211,153,0.6)' }
]

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1200&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=1200&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=800&h=1200&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=1200&fit=crop&auto=format&q=80'
]

export default function MindSoulPage() {
  const [content, setContent] = useState([])
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('meditate')
  const scrollRef = useRef(null)
  const [medIndex, setMedIndex] = useState(0)

  const [mood, setMood] = useState({ mood: 3, energy: 3, stress: 3, notes: '' })
  const [moodSaved, setMoodSaved] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timerSecs, setTimerSecs] = useState(0)
  const [timerDuration, setTimerDuration] = useState(600)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathCount, setBreathCount] = useState(4)
  const [breathActive, setBreathActive] = useState(false)

  useEffect(() => {
    api.get('/wellness/meditation-content').then(r => {
      const mapped = (r.data.content || []).map((item, i) => ({
        ...item,
        image: item.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
        level: item.difficulty,
        videoUrl: item.youtube_video || item.videoUrl
      }))
      setContent(mapped)
    }).catch(() => { })
  }, [])

  useEffect(() => {
    if (!timerActive) return
    if (timerSecs <= 0) { setTimerActive(false); return }
    const t = setTimeout(() => setTimerSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timerActive, timerSecs])

  useEffect(() => {
    if (!breathActive) return
    const phases = [4, 7, 8]
    const t = setInterval(() => {
      setBreathCount(c => {
        if (c <= 1) {
          setBreathPhase(p => (p + 1) % 3)
          return phases[(breathPhase + 1) % 3]
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [breathActive, breathPhase])

  const startTimer = (secs) => {
    setTimerDuration(secs)
    setTimerSecs(secs)
    setTimerActive(true)
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const prevMed = () => {
    setMedIndex(prev => {
      const newIdx = (prev - 1 + content.length) % content.length;
      scrollToMed(newIdx);
      return newIdx;
    });
  }

  const nextMed = () => {
    setMedIndex(prev => {
      const newIdx = (prev + 1) % content.length;
      scrollToMed(newIdx);
      return newIdx;
    });
  }

  const scrollToMed = (idx) => {
    if (scrollRef.current && scrollRef.current.children[idx]) {
      scrollRef.current.children[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black text-white font-sans selection:bg-white/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap');
        .font-timer { font-family: 'Orbitron', monospace; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; } 
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fall {
            0% { opacity: 1; top: -10%; transform: translateX(20px) rotate(0deg); }
            20% { opacity: 0.8; transform: translateX(-20px) rotate(45deg); }
            40% { transform: translateX(-20px) rotate(90deg); }
            60% { transform: translateX(-20px) rotate(135deg); }
            80% { transform: translateX(-20px) rotate(180deg); }
            100% { top: 110%; transform: translateX(-20px) rotate(225deg); }
        }
        .leaf-animate-1 { left: 20%; animation: fall 15s linear infinite; animation-delay: -2s; }
        .leaf-animate-2 { left: 70%; animation: fall 15s linear infinite; animation-delay: -4s; }
        .leaf-animate-3 { left: 10%; animation: fall 20s linear infinite; animation-delay: -7s; }
        .leaf-animate-4 { left: 50%; animation: fall 18s linear infinite; animation-delay: -5s; }
        .leaf-animate-5 { left: 85%; animation: fall 14s linear infinite; animation-delay: -5s; }
        .leaf-animate-6 { left: 15%; animation: fall 16s linear infinite; animation-delay: -10s; }
        .leaf-animate-7 { left: 90%; animation: fall 15s linear infinite; animation-delay: -4s; }
      `}</style>

      {/* Immersive Fading Backgrounds */}
      <AnimatePresence>
        {tab === 'meditate' && (
          <motion.img
            key={tab}
            src={BACKGROUNDS[tab]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}
      </AnimatePresence>

      {/* Vignette & Blur Overlay */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0 pointer-events-none" />

      {/* Autumn Leaves Background (Breathe) */}
      <AnimatePresence>
        {tab === 'breathing' && (
          <motion.div
            key="breathe-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            style={{ background: 'radial-gradient(#333, #000)' }}
          >
            {[0, 180, 0].map((rotX, layerIdx) => (
              <div key={layerIdx} className="absolute inset-0 w-full h-full" style={{ transform: layerIdx === 1 ? 'rotateX(180deg)' : 'none' }}>
                {[
                  "https://www.pngmart.com/files/1/Fall-Autumn-Leaves-Transparent-PNG.png",
                  "https://www.pngmart.com/files/1/Autumn-Fall-Leaves-Pictures-Collage-PNG.png",
                  "https://www.pngmart.com/files/1/Autumn-Fall-Leaves-Clip-Art-PNG.png",
                  "https://www.pngmart.com/files/1/Green-Leaves-PNG-File.png",
                  "https://www.pngmart.com/files/1/Transparent-Autumn-Leaves-Falling-PNG.png",
                  "https://www.pngmart.com/files/1/Realistic-Autumn-Fall-Leaves-PNG.png",
                  "https://cdn.clipart-db.ru/rastr/autumn_leaves_025.png"
                ].map((src, i) => (
                  <div key={i} className={`absolute block leaf-animate-${i + 1}`}>
                    <img src={src} className="w-[75px] h-[75px] object-contain opacity-80" alt="leaf" />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
        {tab === 'timer' && (
          <motion.div
            key="timer-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 overflow-hidden mix-blend-lighten"
          >
            <Aurora colorStops={["#7cff67","#B19EEF","#5227FF"]} blend={0.5} amplitude={1.0} speed={1} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* MEDITATE: Tilt Coverflow */}
          {tab === 'meditate' && (
            <motion.div
              key="meditate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center justify-center h-full pt-10"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mix-blend-overlay drop-shadow-2xl uppercase mb-6 absolute top-24 pointer-events-none">Mind & Soul</h1>

              <div ref={scrollRef} className="w-full overflow-x-auto flex items-center gap-10 px-[10vw] snap-x snap-mandatory h-[650px] hidden-scrollbar">
                {content.map((item, i) => (
                  <motion.div
                    key={item.id} onClick={() => setSelected(item)}
                    className="snap-center shrink-0 w-[400px] h-[550px] overflow-hidden relative cursor-pointer group shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 bg-black"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ perspective: 1000, borderRadius: '225px 225px 40px 40px' }}
                  >
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-[1s] opacity-80 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
                    <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col z-10">
                      <span className="text-xs font-black text-white/50 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest self-start mb-4 border border-white/10">{item.category} • {item.level}</span>
                      <h3 className="text-3xl font-bold mb-3 tracking-tight leading-none text-white drop-shadow-lg group-hover:text-amber-100 transition-colors">{item.title}</h3>
                      <p className="text-white/70 text-sm line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                      <span className="text-yellow-400 font-bold tracking-widest text-sm uppercase flex items-center gap-2 delay-100">⏱ {item.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Navigation Pill */}
              {content.length > 0 && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="px-6 py-2 rounded-full flex items-center gap-6 shadow-md border border-white/5 bg-black/30 backdrop-blur-md"
                    style={{ color: '#fff' }}
                  >
                    <button onClick={prevMed} className="flex items-center group hover:opacity-80 transition-opacity">
                      <ArrowLeft size={16} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                      <div className="w-6 h-[1px] ml-1 opacity-50 bg-white"></div>
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-bold leading-none mb-1">
                        {(medIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium opacity-60 leading-none">
                        {content.length.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <button onClick={nextMed} className="flex items-center group hover:opacity-80 transition-opacity">
                      <div className="w-6 h-[1px] mr-1 opacity-50 bg-white"></div>
                      <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* BREATHING: Apple Watch Petals */}
          {tab === 'breathing' && (
            <motion.div
              key="breathing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8 }}
              className="w-full h-full flex flex-col items-center justify-center p-8"
            >
              <h2 className="text-3xl font-extralight tracking-[0.3em] uppercase text-white/70 mb-16 mix-blend-overlay">Breathing Protocol</h2>

              <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                {[...Array(6)].map((_, i) => {
                  const isResting = !breathActive;
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        scale: isResting ? 1 : (breathPhase === 0 ? 1.5 : breathPhase === 1 ? 1.5 : 0.6),
                        rotate: isResting ? (i * 60) : (breathPhase === 0 ? 180 + (i * 60) : breathPhase === 1 ? 180 + (i * 60) : (i * 60))
                      }}
                      transition={{ duration: isResting ? 2 : (breathPhase === 0 ? 4 : breathPhase === 1 ? 7 : 8), ease: "easeInOut", repeat: isResting ? Infinity : 0, repeatType: isResting ? 'reverse' : 'loop' }}
                      className="absolute rounded-full mix-blend-screen opacity-70"
                      style={{
                        width: '120px', height: '120px',
                        background: `radial-gradient(circle at center, ${isResting ? 'rgba(255,255,255,0.4)' : BREATHING_STEPS[breathPhase].light}, transparent)`,
                        border: '1px solid rgba(255,255,255,0.1)',
                        transformOrigin: '70px 70px'
                      }}
                    />
                  )
                })}

                {breathActive && (
                  <div className="z-10 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mix-blend-overlay">
                    <div className="text-7xl font-extralight tracking-tighter">{breathCount}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.4em] opacity-80 mt-2">{BREATHING_STEPS[breathPhase].label}</div>
                  </div>
                )}
              </div>

              <div className="mt-20 z-10">
                {!breathActive ? (
                  <button onClick={() => { setBreathActive(true); setBreathPhase(0); setBreathCount(4) }}
                    className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-lg tracking-widest font-light transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    B E G I N
                  </button>
                ) : (
                  <button onClick={() => setBreathActive(false)}
                    className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
                    Abort Sequence
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* TIMER: Cinematic Thin Typography */}
          {tab === 'timer' && (
            <motion.div
              key="timer" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}
              className="w-full h-full flex flex-col items-center justify-center p-8"
            >
              <h2 className="text-2xl font-light tracking-[0.4em] uppercase text-white/50 mb-10 mix-blend-overlay">Meditation Focus</h2>

              <div className="relative mb-16">
                {timerActive || timerSecs > 0 ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[12rem] font-timer font-bold tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.5)] leading-none text-white z-10 tabular-nums">
                    {fmt(timerSecs)}
                  </motion.div>
                ) : (
                  <div className="text-[12rem] font-timer font-bold tracking-tighter text-white/40 leading-none select-none z-10 tabular-nums">
                    00:00
                  </div>
                )}
              </div>

              <div className="z-10 w-full max-w-lg">
                {timerActive || timerSecs > 0 ? (
                  <div className="flex gap-4 justify-center">
                    {!timerActive ? (
                      <button onClick={() => setTimerActive(true)} className="px-10 py-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-lg uppercase tracking-widest transition-all">Resume</button>
                    ) : (
                      <button onClick={() => setTimerActive(false)} className="px-10 py-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/20 text-lg uppercase tracking-widest transition-all text-white/80">Pause</button>
                    )}
                    <button onClick={() => { setTimerSecs(0); setTimerActive(false); }} className="px-6 py-4 rounded-full border border-white/10 hover:bg-white/10 text-white/50 hover:text-white uppercase tracking-widest text-sm transition-all">Stop</button>
                  </div>
                ) : (
                  <div className="flex justify-center gap-3 flex-wrap">
                    {[[2, '2m'], [5, '5m'], [10, '10m'], [15, '15m']].map(([m, l]) => (
                      <button key={m} onClick={() => startTimer(m * 60)}
                        className="w-20 h-20 rounded-full flex items-center justify-center bg-black/20 hover:bg-white/10 backdrop-blur-md border border-white/20 transition-all font-light text-xl">
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}



        </AnimatePresence>
      </div>

      {/* Floating iPad-style Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-2 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 rounded-2xl flex items-center gap-3 overflow-hidden transition-all duration-300 ${tab === t.id ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
              {tab === t.id && <motion.div layoutId="dock-indicator" className="absolute inset-0 bg-white/10 rounded-2xl border border-white/20 shadow-inner" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              <span className="relative z-10 text-2xl drop-shadow-md grayscale-[20%]">{t.icon}</span>
              {tab === t.id && (
                <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} className="relative z-10 text-sm font-bold tracking-wider uppercase pr-1 hidden sm:block">
                  {t.label}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} item={selected} type="meditation" />
      {tab !== 'breathing' && <AIChatbot />}
    </div>
  )
}
