import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShoppingCart, Search, ArrowLeft, CheckCircle2, ChevronRight, Package, Leaf, Bot, Sparkles, Zap, TrendingUp } from 'lucide-react'
import api from '../utils/api.js'
import Iridescence from '../components/Iridescence'

const SAMPLES = ['High protein supplements for workout', 'Organic vegetables under ₹300', 'Muscle building supplements from MuscleBlaze', 'Healthy snacks for my gym routine']
const DIETS = ['high protein', 'keto', 'vegan', 'vegetarian', 'paleo', 'low carb', 'organic', 'weight loss']

// Floating ambient particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1.5,
            height: Math.random() * 3 + 1.5,
            background: `rgba(245, 158, 11, ${Math.random() * 0.25 + 0.08})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 16 - 8, 0],
            opacity: [0.15, 0.5, 0.15],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } },
}

const slideUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } } }

export default function GroceryPage() {
  const [query, setQuery] = useState('')
  const [budget, setBudget] = useState(500)
  const [diet, setDiet] = useState('high protein')
  const [recs, setRecs] = useState([])
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('input') // input | recs | cart
  const [cart, setCart] = useState({})

  const getRecs = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/grocery/recommendations', { query, budget, diet })
      setRecs((res.data.recommendations || []).map(r => ({ ...r, selected: false })))
      setAiResponse(res.data.ai_response || '')
      setStep('recs')
    } catch { alert('Error getting recommendations. Please try again.') }
    finally { setLoading(false) }
  }

  const toggleSelect = (i) => setRecs(r => r.map((item, idx) => idx === i ? { ...item, selected: !item.selected } : item))

  const makeCart = async () => {
    const selected = recs.filter(r => r.selected)
    if (!selected.length) return
    try {
      const res = await api.post('/grocery/create-cart', selected)
      setCart(res.data)
      setStep('cart')
    } catch { alert('Failed to create cart.') }
  }

  const budgetPercent = ((budget - 100) / 4900) * 100

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans" style={{ background: 'linear-gradient(145deg, #0a0c08 0%, #141610 35%, #181a14 60%, #0e100b 100%)' }}>
      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; } 
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shimmer-gold {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-panel-strong {
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .shimmer-text {
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f97316, #f59e0b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-gold 3s linear infinite;
        }

        .budget-track {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
        }
        .budget-track::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg, rgba(245,158,11,0.3), rgba(249,115,22,0.15));
        }
        .budget-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 0 12px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.3);
          margin-top: -7px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .budget-track::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(245,158,11,0.7), 0 2px 12px rgba(0,0,0,0.4);
        }
        .budget-track::-moz-range-track {
          height: 6px; border-radius: 3px;
          background: linear-gradient(90deg, rgba(245,158,11,0.3), rgba(249,115,22,0.15));
        }
        .budget-track::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 0 12px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.3);
        }

        .product-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card:hover {
          transform: translateY(-4px) scale(1.01);
        }

        .glow-btn {
          position: relative;
          overflow: hidden;
        }
        .glow-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(245,158,11,0.6), rgba(249,115,22,0.3), rgba(245,158,11,0.6));
          background-size: 200% 200%;
          animation: border-flow 3s ease infinite;
          border-radius: inherit;
          z-index: -1;
          filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-btn:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Iridescence WebGL background */}
      <div className="absolute inset-0 z-0" style={{ opacity: 0.6 }}>
        <Iridescence
          color={[0.2, 0.6, 0.8]}
          mouseReact
          amplitude={0.1}
          speed={1}
        />
      </div>

      {/* Subtle overlay gradient for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(10,12,8,0.3) 50%, rgba(10,12,8,0.7) 100%)',
      }} />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Back Button */}
      <motion.div
        className="absolute top-6 left-6 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <a href="/" className="group flex items-center gap-2.5 text-white/50 hover:text-amber-400 transition-all duration-300 uppercase tracking-[0.2em] text-[10px] font-medium">
          <div className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center group-hover:border-amber-400/30 transition-colors">
            <ArrowLeft size={14} />
          </div>
          Dashboard
        </a>
      </motion.div>

      <div className="relative z-10 w-full h-full flex flex-col pt-16 pb-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.1 }}
          className="text-center mb-6 shrink-0 px-4"
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
                <ShoppingCart size={22} className="text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[0.15em] uppercase">
                <span className="shimmer-text">ORDER UP</span>
              </h1>
              <p className="text-white/40 tracking-[0.2em] text-[10px] uppercase font-medium mt-1">AI-Powered Smart Shopping</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {['Search', 'Select', 'Checkout'].map((label, i) => {
              const stepMap = { 'input': 0, 'recs': 1, 'cart': 2 }
              const currentIdx = stepMap[step]
              const isActive = i === currentIdx
              const isComplete = i < currentIdx
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={`w-8 h-[1px] transition-colors duration-500 ${isComplete ? 'bg-amber-400/60' : 'bg-white/10'}`} />
                  )}
                  <motion.div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-500 ${isActive
                        ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                        : isComplete
                          ? 'text-amber-400/60 bg-transparent border border-amber-400/20'
                          : 'text-white/25 bg-transparent border border-white/5'
                      }`}
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isComplete ? <CheckCircle2 size={10} /> : <span className="text-[8px]">{String(i + 1).padStart(2, '0')}</span>}
                    {label}
                  </motion.div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Content Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto overflow-hidden px-4 flex flex-col min-h-0">
          <AnimatePresence mode="wait">

            {/* 1. INPUT STEP */}
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="w-full max-w-3xl flex flex-col mx-auto glass-panel-strong rounded-[2rem] p-8 my-auto overflow-y-auto hidden-scrollbar"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(245,158,11,0.04)' }}
              >
                <motion.h2
                  variants={slideUp} initial="hidden" animate="show"
                  className="text-lg font-bold text-white tracking-[0.15em] uppercase mb-6 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1))' }}>
                    <Search size={15} className="text-amber-400" />
                  </div>
                  <span>Find Your Needs</span>
                  <Sparkles size={14} className="text-amber-400/50 ml-auto" />
                </motion.h2>

                {/* Quick Samples */}
                <motion.div
                  variants={stagger.container} initial="hidden" animate="show"
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {SAMPLES.map((s, i) => (
                    <motion.button
                      key={i}
                      variants={stagger.item}
                      onClick={() => setQuery(s)}
                      className="text-left px-4 py-2 rounded-full text-white/70 text-xs font-medium transition-all duration-300 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-400/10 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      "{s}"
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div
                  variants={slideUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
                  className="mb-6 relative"
                >
                  <textarea
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Type your grocery needs... (e.g., 'Fresh vegetables for salad')"
                    rows="3"
                    className="w-full rounded-2xl px-6 py-4 text-white placeholder-white/30 text-sm focus:outline-none resize-none transition-all hidden-scrollbar"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.3)'; e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3), 0 0 20px rgba(245,158,11,0.06)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                  />
                </motion.div>

                <motion.div
                  variants={stagger.container} initial="hidden" animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
                >
                  {/* Budget */}
                  <motion.div variants={stagger.item}>
                    <label className="text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase flex justify-between mb-4">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp size={10} className="text-amber-400/60" />
                        Budget Range
                      </span>
                      <motion.span
                        className="font-bold px-2 py-0.5 rounded-md"
                        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1))', color: '#f59e0b' }}
                        key={budget}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        ₹{budget}
                      </motion.span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full pointer-events-none"
                        style={{ width: `${budgetPercent}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)', boxShadow: '0 0 10px rgba(245,158,11,0.3)' }} />
                      <input
                        type="range" min="100" max="5000" step="50" value={budget}
                        onChange={e => setBudget(+e.target.value)}
                        className="budget-track relative z-10"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-3 font-medium tracking-wider">
                      <span>₹100</span><span>₹5,000</span>
                    </div>
                  </motion.div>

                  {/* Diet */}
                  <motion.div variants={stagger.item}>
                    <label className="text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase block mb-4">
                      <span className="flex items-center gap-1.5">
                        <Leaf size={10} className="text-amber-400/60" />
                        Diet Preference
                      </span>
                    </label>
                    <div className="flex gap-2 pb-2 overflow-x-auto hidden-scrollbar">
                      {DIETS.map(d => (
                        <motion.button
                          key={d}
                          onClick={() => setDiet(d)}
                          className={`px-4 py-2 shrink-0 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-400 ${diet === d
                              ? 'text-white border'
                              : 'text-white/50 hover:text-white/80 border hover:border-white/15'
                            }`}
                          style={diet === d ? {
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(249,115,22,0.15))',
                            borderColor: 'rgba(245,158,11,0.5)',
                            boxShadow: '0 0 20px rgba(245,158,11,0.2)',
                          } : {
                            background: 'rgba(255,255,255,0.04)',
                            borderColor: 'rgba(255,255,255,0.06)',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {d}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

                <motion.button
                  onClick={getRecs}
                  disabled={loading || !query.trim()}
                  className="w-full py-4 rounded-xl relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed mt-auto glow-btn"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                  }}
                  whileHover={{ scale: 1.01, boxShadow: '0 6px 30px rgba(245,158,11,0.5)' }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer-gold 2s linear infinite',
                    }} />
                  <div className="relative flex items-center justify-center gap-3 text-white font-bold tracking-[0.15em] uppercase text-xs">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Analyzing & Sourcing...
                      </>
                    ) : (
                      <>
                        <Search size={15} />
                        Find Products
                        <ChevronRight size={14} className="opacity-60" />
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* 2. RECOMMENDATIONS STEP */}
            {step === 'recs' && (
              <motion.div
                key="recs"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="w-full h-full flex flex-col md:flex-row gap-5 min-h-0"
              >
                {/* Left Panel: AI Insights + Actions */}
                <div className="w-full md:w-[340px] flex flex-col gap-5 shrink-0 h-full overflow-hidden">
                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="glass-panel-strong rounded-[1.5rem] overflow-y-auto hidden-scrollbar flex-1 relative p-7"
                      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
                    >
                      <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
                      <h3 className="text-white/80 border-b border-white/8 pb-4 tracking-[0.2em] text-[10px] font-bold uppercase mb-5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1))' }}>
                          <Bot size={12} className="text-amber-400" />
                        </div>
                        AI Analysis
                        <Sparkles size={10} className="text-amber-400/40 ml-auto" />
                      </h3>
                      <p className="text-white/70 text-sm font-normal leading-[1.8] whitespace-pre-wrap">{aiResponse}</p>
                    </motion.div>
                  )}

                  {/* Action Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-panel rounded-2xl shrink-0 p-5"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                  >
                    <div className="flex justify-between items-center mb-4 px-1">
                      <span className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase">Selected</span>
                      <motion.span
                        className="text-xs font-bold tracking-widest px-3 py-1 rounded-full"
                        style={{
                          background: recs.filter(r => r.selected).length > 0
                            ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                            : 'rgba(255,255,255,0.06)',
                          color: recs.filter(r => r.selected).length > 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                          boxShadow: recs.filter(r => r.selected).length > 0 ? '0 4px 15px rgba(245,158,11,0.3)' : 'none',
                        }}
                        key={recs.filter(r => r.selected).length}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                      >
                        {recs.filter(r => r.selected).length} Items
                      </motion.span>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setStep('input')}
                        className="w-12 shrink-0 flex items-center justify-center rounded-xl text-white/60 hover:text-amber-400 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft size={16} />
                      </motion.button>
                      <motion.button
                        onClick={makeCart}
                        disabled={!recs.filter(r => r.selected).length}
                        className="flex-1 py-3 rounded-xl text-white font-bold tracking-[0.15em] uppercase text-[10px] flex justify-center items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                        }}
                        whileHover={{ boxShadow: '0 6px 30px rgba(245,158,11,0.5)', scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <ShoppingCart size={13} /> Review Cart <ChevronRight size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Recommendation Grid */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full md:flex-1 h-full overflow-y-auto hidden-scrollbar relative glass-panel rounded-[1.5rem] p-6"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  <h3 className="text-white/40 tracking-[0.2em] text-[10px] font-bold uppercase mb-5 ml-1 flex items-center gap-2">
                    <Package size={12} className="text-amber-400/50" />
                    Sourced Products
                    <span className="text-amber-400/40 ml-1">({recs.length})</span>
                  </h3>
                  <motion.div
                    variants={stagger.container} initial="hidden" animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8"
                  >
                    {recs.map((p, i) => (
                      <motion.div
                        key={i}
                        variants={stagger.item}
                        onClick={() => toggleSelect(i)}
                        className="product-card relative rounded-2xl p-5 cursor-pointer overflow-hidden"
                        style={{
                          background: p.selected ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                          border: p.selected ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.05)',
                          boxShadow: p.selected ? '0 0 30px rgba(245,158,11,0.1), inset 0 0 30px rgba(245,158,11,0.03)' : 'none',
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {p.selected && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ background: 'radial-gradient(circle at top right, rgba(245,158,11,0.08), transparent 60%)' }}
                          />
                        )}

                        <div className="flex justify-between items-start mb-3 gap-3 relative z-10">
                          <h4 className="font-semibold text-white text-sm leading-tight flex-1">{p.name}</h4>
                          <motion.div
                            className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${p.selected ? 'border-amber-400' : 'border-white/20'
                              }`}
                            style={p.selected ? { background: 'linear-gradient(135deg, #f59e0b, #f97316)' } : {}}
                            animate={p.selected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {p.selected && <CheckCircle2 size={11} className="text-white" />}
                          </motion.div>
                        </div>

                        <div className="flex justify-between items-end mb-3 relative z-10">
                          <span className="text-xl font-bold" style={{
                            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {p.price}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{ background: 'rgba(250,204,21,0.1)', color: '#fbbf24', border: '1px solid rgba(250,204,21,0.15)' }}>
                            <Star size={9} className="fill-yellow-400 text-yellow-400" />{p.rating}
                          </span>
                        </div>

                        {p.protein && p.protein !== '-' && (
                          <div className="mb-3 relative z-10">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider"
                              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                              <Zap size={9} /> Protein: {p.protein}
                            </span>
                          </div>
                        )}

                        <p className="text-white/50 text-xs font-normal leading-relaxed line-clamp-2 mb-4 relative z-10">{p.description}</p>

                        <div className="flex justify-between items-center pt-3 border-t relative z-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <span className="text-white/30 text-[9px] uppercase tracking-[0.15em] font-bold flex items-center gap-1"><Package size={10} /> {p.platform}</span>
                          <span className="text-[9px] uppercase tracking-[0.15em] font-extrabold" style={{ color: '#86efac' }}>● In Stock</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* 3. CART STEP */}
            {step === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="w-full max-w-2xl mx-auto flex flex-col h-full glass-panel-strong rounded-[2rem] overflow-hidden shrink-0 mt-4 mb-auto"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(245,158,11,0.04)' }}
              >
                <motion.div
                  className="p-7 shrink-0 flex items-center justify-center gap-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
                    <ShoppingCart size={17} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-[0.15em] uppercase">Order Summary</h2>
                </motion.div>

                <div className="flex-1 overflow-y-auto hidden-scrollbar p-6 space-y-3">
                  {(cart.cart_items || []).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex justify-between items-center group rounded-xl p-4 transition-all duration-300 hover:bg-white/[0.04]"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="mr-6 flex-1 min-w-0">
                        <p className="text-white font-medium text-sm mb-1.5 truncate">{item.name}</p>
                        <div className="flex flex-wrap gap-3 text-[9px] text-white/40 font-bold tracking-[0.15em] uppercase">
                          <span className="flex items-center gap-1"><Package size={10} /> {item.platform}</span>
                          {item.protein && item.protein !== '-' && <span className="flex items-center gap-1 text-amber-400/60"> {item.protein}</span>}
                        </div>
                      </div>
                      <span className="font-bold text-base shrink-0" style={{
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>{item.price}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="p-7 shrink-0"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.04))',
                      border: '1px solid rgba(245,158,11,0.12)',
                      boxShadow: '0 0 30px rgba(245,158,11,0.04)',
                    }}
                  >
                    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
                    <div className="flex justify-between items-end mb-2 relative z-10">
                      <span className="text-white/50 font-bold tracking-[0.15em] text-[10px] uppercase">Estimated Total</span>
                      <motion.span
                        className="font-extrabold text-2xl"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        ₹{cart.total_cost}
                      </motion.span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold tracking-wider relative z-10" style={{ color: 'rgba(245,158,11,0.6)' }}>
                      <span>{cart.item_count} items</span><span>Free Prime Delivery</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setStep('recs')}
                      className="py-3.5 px-5 rounded-xl text-white/70 font-bold tracking-[0.12em] uppercase text-[10px] transition-all hover:text-amber-400"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← Modify
                    </motion.button>
                    <motion.button
                      onClick={() => { alert('🎉 Order placed! Your AI-curated groceries will be delivered soon.'); setStep('input'); setQuery(''); setRecs([]); }}
                      className="flex-1 py-3.5 rounded-xl text-white font-bold tracking-[0.15em] uppercase text-[10px] transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                      }}
                      whileHover={{ boxShadow: '0 6px 30px rgba(245,158,11,0.5)', scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Confirm Purchase
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
