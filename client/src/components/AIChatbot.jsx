import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import api from '../utils/api.js'

const QUICK = ['💪 Workout plan for me', '✨ Skincare for my skin type', '🥗 Healthy diet tips', '🧘 Stress relief techniques', '💊 Supplement advice', '🩺 Symptom guidance']

export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async (msg) => {
    const text = msg || input
    if (!text.trim()) return
    setInput('')
    setMessages(prev => [...prev, { type: 'user', content: text }])
    setLoading(true)
    try {
      const userId = localStorage.getItem('userId') || 'guest'
      const res = await api.post('/chat', { user_id: userId, message: text })
      setMessages(prev => [...prev, { type: 'ai', content: res.data.response }])
    } catch {
      setMessages(prev => [...prev, { type: 'ai', content: 'Having trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[150]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/15"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold text-sm">🤖 Nutracia Health Coach</p>
                <p className="text-white/70 text-xs">AI wellness companion</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition-colors"><X size={16} className="text-white" /></button>
            </div>

            <div className="h-72 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="space-y-2">
                  <div className="bg-purple-500/20 rounded-xl p-3 text-white/80 text-sm">Hi! I'm your AI Health Coach 🌿 Ask me anything about wellness!</div>
                  <p className="text-white/50 text-xs px-1">Quick questions:</p>
                  {QUICK.map((q, i) => (
                    <button key={i} onClick={() => send(q)} className="block w-full text-left text-xs glass px-3 py-2 rounded-lg text-white/80 hover:bg-white/15 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              ) : messages.map((m, i) => (
                <div key={i} className={m.type === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${m.type === 'user' ? 'bg-purple-500 text-white' : 'glass text-white/90'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass px-3 py-2 rounded-xl">
                    <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about health, diet, fitness..."
                className="flex-1 glass rounded-xl px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="p-2 bg-purple-500 rounded-xl text-white hover:bg-purple-600 transition-colors disabled:opacity-40">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
      >
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </motion.div>
      </motion.button>
    </div>
  )
}
