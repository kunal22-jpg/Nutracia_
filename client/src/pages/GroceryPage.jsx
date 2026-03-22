import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import VideoBackground from '../components/VideoBackground.jsx'
import api from '../utils/api.js'

const BG = 'https://images.pexels.com/photos/668353/pexels-photo-668353.jpeg'
const SAMPLES = ['I need high protein supplements for my workout','Get me organic vegetables under ₹300','Find muscle building supplements from MuscleBlaze','I want healthy snacks for my gym routine','Need protein powder for post-workout recovery','Looking for organic skincare supplements']
const DIETS = ['high protein','keto','vegan','vegetarian','paleo','low carb','organic','weight loss']

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/60" />
      <div className="relative z-10 pt-24 px-4 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">Order Up 🛒</h1>
            <p className="text-white/60">AI-Powered Smart Shopping with Gemini</p>
          </motion.div>

          {step === 'input' && (
            <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-4 text-center">🎤 What do you need today?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                {SAMPLES.map((s, i) => <button key={i} onClick={() => setQuery(s)} className="text-left glass px-3 py-2.5 rounded-xl text-white/80 text-sm hover:bg-white/15 transition-colors">"{s}"</button>)}
              </div>
              <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Type your grocery needs..." rows="3"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none mb-4" />
              <div className="mb-4">
                <label className="text-white/80 text-sm font-medium block mb-2">💰 Budget: ₹{budget}</label>
                <input type="range" min="100" max="5000" step="50" value={budget} onChange={e => setBudget(+e.target.value)}
                  className="w-full accent-purple-500" />
                <div className="flex justify-between text-xs text-white/40 mt-1"><span>₹100</span><span>₹5,000</span></div>
              </div>
              <div className="mb-6">
                <label className="text-white/80 text-sm font-medium block mb-2">Diet Preference</label>
                <div className="flex flex-wrap gap-2">
                  {DIETS.map(d => <button key={d} onClick={() => setDiet(d)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${diet === d ? 'bg-purple-500 text-white' : 'glass text-white/70 hover:bg-white/15'}`}>{d}</button>)}
                </div>
              </div>
              <button onClick={getRecs} disabled={loading || !query.trim()} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />🤖 AI is analyzing...</> : '🤖 Get AI Recommendations'}
              </button>
            </div>
          )}

          {step === 'recs' && (
            <div className="space-y-5">
              {aiResponse && <div className="glass rounded-2xl p-5"><h3 className="text-white font-semibold mb-2">🧠 AI Analysis</h3><p className="text-white/70 text-sm">{aiResponse.slice(0,300)}...</p></div>}
              <div className="glass rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-5">AI Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recs.map((p, i) => (
                    <div key={i} onClick={() => toggleSelect(i)}
                      className={`rounded-2xl p-4 cursor-pointer transition-all border-2 ${p.selected ? 'border-green-500 bg-green-500/10' : 'glass border-white/15 hover:border-white/30'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white text-sm flex-1 mr-2 line-clamp-2">{p.name}</h4>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${p.selected ? 'bg-green-500 border-green-500' : 'border-white/40'}`}>
                          {p.selected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-300 text-xl font-bold">{p.price}</span>
                        <span className="text-yellow-400 flex items-center gap-1 text-sm"><Star size={12} />{p.rating}</span>
                      </div>
                      {p.protein && <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-200 rounded-full text-xs mb-2">💪 {p.protein}</span>}
                      <p className="text-white/60 text-xs line-clamp-2">{p.description}</p>
                      <div className="flex justify-between mt-2 text-xs text-white/50">
                        <span>🏪 {p.platform}</span>
                        <span className="text-green-400">✓ In Stock</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep('input')} className="flex-1 btn-glass">← Back</button>
                  <button onClick={makeCart} disabled={!recs.filter(r=>r.selected).length} className="flex-1 btn-primary disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #065f46)' }}>
                    🛒 Cart ({recs.filter(r=>r.selected).length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'cart' && (
            <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">🛒 Your Smart Cart</h2>
              <div className="space-y-3 mb-6">
                {(cart.cart_items || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center glass rounded-xl p-4">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <div className="flex gap-3 mt-0.5 text-xs text-white/50">
                        <span>🏪 {item.platform}</span>
                        {item.protein && <span>💪 {item.protein}</span>}
                        <span className="text-yellow-400">⭐ {item.rating}</span>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold text-lg">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(219,39,119,0.2))' }}>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-green-400">₹{cart.total_cost}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60 mt-1">
                  <span>{cart.item_count} items</span><span>Free delivery</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('recs')} className="flex-1 btn-glass">← Modify</button>
                <button onClick={() => { alert('🎉 Order placed! Your AI-curated groceries will be delivered soon.'); setStep('input'); setQuery(''); setRecs([]); }}
                  className="flex-1 btn-primary" style={{ background: 'linear-gradient(135deg, #16a34a, #065f46)' }}>
                  🎉 Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
