import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import VideoBackground from '../components/VideoBackground.jsx'
import Modal from '../components/Modal.jsx'
import AIChatbot from '../components/AIChatbot.jsx'
import api from '../utils/api.js'

const BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80'

const MOODS = ['😢','😔','😐','😊','😄']
const BREATHING_STEPS = [
  { label: 'Inhale', count: 4, color: 'from-blue-400 to-cyan-400' },
  { label: 'Hold', count: 7, color: 'from-purple-400 to-violet-400' },
  { label: 'Exhale', count: 8, color: 'from-green-400 to-emerald-400' },
]

export default function MindSoulPage() {
  const [content, setContent] = useState([])
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('meditate') // meditate | breathing | mood | timer
  const [mood, setMood] = useState({ mood: 3, energy: 3, stress: 3, notes: '' })
  const [moodSaved, setMoodSaved] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timerSecs, setTimerSecs] = useState(0)
  const [timerDuration, setTimerDuration] = useState(600)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathCount, setBreathCount] = useState(4)
  const [breathActive, setBreathActive] = useState(false)

  useEffect(() => {
    api.get('/wellness/meditation-content').then(r => setContent(r.data.content || [])).catch(() => {})
  }, [])

  // Timer
  useEffect(() => {
    if (!timerActive) return
    if (timerSecs <= 0) { setTimerActive(false); return }
    const t = setTimeout(() => setTimerSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timerActive, timerSecs])

  // Breathing
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

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const saveMood = () => {
    setMoodSaved(true)
    setTimeout(() => setMoodSaved(false), 3000)
  }

  const tabs = [
    { id: 'meditate', label: '🧘 Meditate' },
    { id: 'breathing', label: '🫁 Breathing' },
    { id: 'timer', label: '⏱️ Timer' },
    { id: 'mood', label: '🎭 Mood' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/60" />

      <div className="relative z-10 pt-24 px-4 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mind & Soul</h1>
            <p className="text-white/60">Nurture your inner peace through meditation and mindfulness</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === t.id ? 'btn-primary' : 'btn-glass'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Meditation content */}
          {tab === 'meditate' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item) => (
                <motion.div key={item.id} whileHover={{ y: -4 }}
                  onClick={() => setSelected(item)}
                  className="glass rounded-2xl p-5 cursor-pointer hover:bg-white/15 transition-all card-hover"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-3 text-2xl">
                    {item.type === 'breathing_exercise' ? '🫁' : item.type === 'sleep_meditation' ? '🌙' : item.type === 'stress_relief' ? '😌' : '🧘'}
                  </div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex gap-3 text-xs text-white/50">
                    <span>⏱ {item.duration}</span>
                    <span>📊 {item.difficulty}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(item.benefits || []).slice(0,2).map((b,i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full">{b}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 4-7-8 Breathing */}
          {tab === 'breathing' && (
            <div className="max-w-md mx-auto text-center">
              <div className="glass rounded-3xl p-10">
                <h2 className="text-2xl font-bold text-white mb-2">4-7-8 Breathing</h2>
                <p className="text-white/60 mb-8">Inhale 4 → Hold 7 → Exhale 8</p>

                {breathActive ? (
                  <>
                    <div className={`relative w-40 h-40 mx-auto mb-6`}>
                      <motion.div
                        animate={{ scale: breathPhase === 0 ? 1.3 : breathPhase === 1 ? 1.3 : 0.8 }}
                        transition={{ duration: breathPhase === 0 ? 4 : breathPhase === 1 ? 7 : 8 }}
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${BREATHING_STEPS[breathPhase].color} opacity-30`}
                      />
                      <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${BREATHING_STEPS[breathPhase].color} flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white">{breathCount}</div>
                          <div className="text-white/80 text-sm">{BREATHING_STEPS[breathPhase].label}</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setBreathActive(false)} className="btn-glass">Stop</button>
                  </>
                ) : (
                  <>
                    <div className="text-8xl mb-8 animate-float">🫁</div>
                    <button onClick={() => { setBreathActive(true); setBreathPhase(0); setBreathCount(4) }} className="btn-primary">
                      Start Breathing Exercise
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Meditation Timer */}
          {tab === 'timer' && (
            <div className="max-w-sm mx-auto text-center">
              <div className="glass rounded-3xl p-10">
                <h2 className="text-2xl font-bold text-white mb-6">Meditation Timer</h2>
                {timerActive ? (
                  <>
                    <div className="text-7xl font-mono font-bold text-white mb-2">{fmt(timerSecs)}</div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-8">
                      <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${(timerSecs/timerDuration)*100}%` }} />
                    </div>
                    <button onClick={() => setTimerActive(false)} className="btn-glass px-8">Pause</button>
                  </>
                ) : (
                  <>
                    {timerSecs > 0 ? (
                      <>
                        <div className="text-7xl font-mono font-bold text-white mb-2">{fmt(timerSecs)}</div>
                        <div className="flex gap-3 justify-center mt-6">
                          <button onClick={() => setTimerActive(true)} className="btn-primary px-8">Resume</button>
                          <button onClick={() => setTimerSecs(0)} className="btn-glass">Reset</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-7xl mb-8">🧘</div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          {[[5,'5 min'],[10,'10 min'],[15,'15 min'],[20,'20 min']].map(([m,label]) => (
                            <button key={m} onClick={() => startTimer(m*60)} className="btn-glass py-3">{label}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mood Tracker */}
          {tab === 'mood' && (
            <div className="max-w-md mx-auto">
              <div className="glass rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Today's Mood Check-in</h2>
                {moodSaved ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">{MOODS[mood.mood-1]}</div>
                    <p className="text-green-400 font-semibold text-lg">Mood saved! ✓</p>
                    <p className="text-white/60 text-sm mt-2">Keep tracking daily for insights</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {[['Mood',MOODS,'mood'],['Energy','⚡⚡⚡⚡⚡'.split(''),'energy'],['Stress Level','😰','stress']].map(([label, icons, key]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white/80 text-sm font-medium">{label}</span>
                          <span className="text-2xl">{Array.isArray(icons) ? icons[mood[key]-1] : icons}</span>
                        </div>
                        <input type="range" min="1" max="5" value={mood[key]}
                          onChange={e => setMood(p => ({ ...p, [key]: +e.target.value }))}
                          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-xs text-white/40 mt-1">
                          <span>Low</span><span>High</span>
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="text-white/80 text-sm font-medium block mb-2">Notes (optional)</label>
                      <textarea value={mood.notes} onChange={e => setMood(p => ({ ...p, notes: e.target.value }))}
                        placeholder="How are you feeling today?" rows="3"
                        className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                      />
                    </div>
                    <button onClick={saveMood} className="btn-primary w-full">Save Today's Mood</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} item={selected} type="meditation" />
      <AIChatbot />
    </div>
  )
}
