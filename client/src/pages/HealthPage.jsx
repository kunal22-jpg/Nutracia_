import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Stethoscope, Bot, Activity, ArrowRight, Expand, Search } from 'lucide-react'
import api from '../utils/api.js'
import PixelBlast from '../components/PixelBlast.jsx'

const BGS = {
  symptoms: 'https://images.unsplash.com/photo-1576091160550-2173ff9e594b?w=1600&q=80',
  chat: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=1600&q=80'
}

const SYMPTOMS = ['Fever','Headache','Cough','Sore throat','Runny nose','Body aches','Fatigue','Nausea','Vomiting','Diarrhea','Stomach pain','Chest pain','Shortness of breath','Dizziness','Skin rash','Joint pain','Back pain','Muscle pain','Loss of appetite','Anxiety','Depression']
const BODY_PARTS = ['Head','Neck','Chest','Abdomen','Back','Arms','Legs','Hands','Feet','Eyes','Ears','Nose','Throat','Skin','Joints','Muscles']

export default function HealthPage() {
  const [tab, setTab] = useState('symptoms')
  
  // Symptoms State
  const [symptoms, setSymptoms] = useState([])
  const [customSymptoms, setCustomSymptoms] = useState('')
  const [bodyParts, setBodyParts] = useState([])
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('moderate')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Search State
  const [symptomQuery, setSymptomQuery] = useState('')
  const [bodyPartQuery, setBodyPartQuery] = useState('')
  
  // Chat State
  const [chat, setChat] = useState([{ type: 'bot', content: "Hi! I'm your AI health assistant. How can I help you today?" }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Symptom Utils
  const toggle = (arr, setArr, val) => setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val])

  const filteredSymptoms = SYMPTOMS.filter(s => s.toLowerCase().includes(symptomQuery.toLowerCase()))
  const displaySymptoms = symptomQuery ? filteredSymptoms : Array.from(new Set([...symptoms, ...SYMPTOMS.slice(0, 10)]))
  
  const filteredBodyParts = BODY_PARTS.filter(b => b.toLowerCase().includes(bodyPartQuery.toLowerCase()))
  const displayBodyParts = bodyPartQuery ? filteredBodyParts : Array.from(new Set([...bodyParts, ...BODY_PARTS.slice(0, 8)]))

  const analyze = async () => {
    if (!symptoms.length && !customSymptoms.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/wellness/symptoms/analyze', { symptoms, custom_symptoms: customSymptoms, body_parts: bodyParts, duration, severity })
      setResult(res.data)
    } catch {
      setResult({ urgency_level: 'Medium', possible_conditions: [{ name: 'General Concern', probability: '—', description: 'Symptoms need professional evaluation' }], recommendations: ['Rest and hydrate', 'Monitor symptoms', 'See a doctor if symptoms persist'], when_to_seek_care: 'If symptoms persist beyond 3 days', disclaimer: 'Not a substitute for professional medical advice.' })
    } finally { setLoading(false) }
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput; setChatInput('')
    setChat(p => [...p, { type: 'user', content: msg }])
    setChatLoading(true)
    try {
      const res = await api.post('/chat', { user_id: localStorage.getItem('userId') || 'guest', message: msg })
      setChat(p => [...p, { type: 'bot', content: res.data.response }])
    } catch {
      setChat(p => [...p, { type: 'bot', content: 'Please try again.' }])
    } finally { setChatLoading(false) }
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black font-sans">
      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; } 
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Cinematic Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#ffffff"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 pointer-events-none" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <a href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-widest text-xs font-light">
          <ArrowLeft size={16} /> Dashboard
        </a>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col pt-16 pb-24 h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 shrink-0 px-4">
          <h1 className="text-3xl md:text-5xl font-light text-white tracking-[0.2em] uppercase mb-2 drop-shadow-lg flex items-center justify-center -ml-3">
             <Activity className="mr-4 text-emerald-400" size={36} /> HEALTH
          </h1>
          <p className="text-white/50 tracking-[0.15em] text-xs uppercase font-light">AI-powered tracking and guidance</p>
        </motion.div>

        {/* CONTENT TABS */}
        <div className="flex-1 w-full overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            
            {/* 1. SYMPTOMS TAB */}
            {tab === 'symptoms' && (
              <motion.div 
                key="symptoms"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }}
                className="w-full h-full px-4 pb-20 overflow-hidden flex flex-col"
              >
                <div className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  {/* Selection Panel */}
                  <div className="p-8 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto hidden-scrollbar h-full flex flex-col">
                    <h2 className="text-xl font-light text-white tracking-widest uppercase mb-6 flex items-center gap-2"><Stethoscope size={20} className="text-emerald-400"/> Select Symptoms</h2>
                    
                    {/* Symptoms Search & Select */}
                    <div className="mb-8">
                       <div className="relative mb-4">
                          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                          <input 
                              type="text" 
                              value={symptomQuery} 
                              onChange={e => setSymptomQuery(e.target.value)} 
                              placeholder="Search symptoms..." 
                              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                          />
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {displaySymptoms.map(s => (
                           <button key={s} onClick={() => toggle(symptoms, setSymptoms, s)}
                             className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${symptoms.includes(s) ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}>
                             {s}
                           </button>
                         ))}
                         {symptomQuery && filteredSymptoms.length === 0 && (
                           <span className="text-white/40 text-xs italic py-2 px-2">No exact matches found. Describe below instead.</span>
                         )}
                       </div>
                    </div>

                    {/* Body Parts Search & Select */}
                    <div className="mb-8">
                      <label className="text-white/50 text-xs tracking-widest uppercase block mb-4">Affected Body Parts</label>
                      <div className="relative mb-4">
                          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                          <input 
                              type="text" 
                              value={bodyPartQuery} 
                              onChange={e => setBodyPartQuery(e.target.value)} 
                              placeholder="Search body parts..." 
                              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 transition-all flex-1"
                          />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {displayBodyParts.map(b => (
                          <button key={b} onClick={() => toggle(bodyParts, setBodyParts, b)}
                            className={`px-4 py-2 rounded-full text-xs transition-all duration-300 ${bodyParts.includes(b) ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-transparent'}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-auto shrink-0">
                      <textarea value={customSymptoms} onChange={e => setCustomSymptoms(e.target.value)} placeholder="Describe additional symptoms (e.g., 'Sharp pain when taking a deep breath')..." rows="2"
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none mb-6 transition-all" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="text-white/50 text-xs tracking-widest uppercase block mb-3">Duration</label>
                          <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 text-sm cursor-pointer hover:bg-white/5 transition-colors appearance-none">
                            <option value="" className="bg-gray-900">Select duration</option>
                            {['Less than 1 day','1-3 days','About a week','More than a week','Chronic (ongoing)'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs tracking-widest uppercase block mb-3">Severity</label>
                          <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 text-sm cursor-pointer hover:bg-white/5 transition-colors appearance-none">
                            {['mild','moderate','severe'].map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <button onClick={analyze} disabled={loading || (!symptoms.length && !customSymptoms.trim())} className="w-full py-4 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center justify-center gap-3 text-white font-light tracking-widest uppercase text-sm">
                          {loading ? <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />Analyzing...</> : <><Activity size={16} className="text-emerald-400" /> Analyze Symptoms</>}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div className="h-full relative overflow-y-auto hidden-scrollbar">
                    <AnimatePresence mode="wait">
                      {result ? (
                        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 pb-12 rounded-[2rem] bg-black/60 backdrop-blur-3xl border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] min-h-full">
                          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                            <h3 className="text-lg font-light text-white tracking-widest uppercase">Analysis Report</h3>
                            <div className="flex items-center gap-3">
                              <span className="text-white/50 text-xs tracking-widest uppercase">Urgency:</span>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase ${result.urgency_level === 'High' || result.urgency_level === 'Emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : result.urgency_level === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                {result.urgency_level}
                              </span>
                            </div>
                          </div>

                          {result.possible_conditions && (
                            <div className="mb-8">
                              <h4 className="text-white/50 tracking-widest text-xs uppercase mb-4 flex items-center gap-2"><Expand size={12} /> Possible Conditions</h4>
                              <div className="grid gap-3">
                                {result.possible_conditions.map((c, i) => (
                                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                    <div className="mb-2 md:mb-0 pr-4">
                                      <p className="text-white font-medium tracking-wide mb-1 flex items-center gap-2">{c.name}</p>
                                      <p className="text-white/50 text-xs leading-relaxed">{c.description}</p>
                                    </div>
                                    <span className="text-emerald-300/80 text-sm font-light tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full whitespace-nowrap self-start md:self-auto border border-emerald-500/20">{c.probability}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.recommendations && (
                            <div className="mb-8">
                              <h4 className="text-white/50 tracking-widest text-xs uppercase mb-4">Recommendations</h4>
                              <ul className="grid gap-2">
                                {result.recommendations.map((r, i) => (
                                  <li key={i} className="text-white/80 text-sm flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                    <span className="text-emerald-400 mt-0.5"><ArrowRight size={14} /></span>
                                    <span className="leading-relaxed font-light">{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-6">
                             <p className="text-red-300/80 tracking-widest text-xs uppercase mb-2 flex items-center gap-2">⚠️ When to Seek Care</p>
                             <p className="text-red-100/90 text-sm font-light leading-relaxed">{result.when_to_seek_care}</p>
                          </div>
                          
                          <p className="text-white/30 text-xs italic text-center mx-auto max-w-lg leading-relaxed">{result.disclaimer}</p>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] h-full flex flex-col items-center justify-center text-center space-y-6">
                           <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                              <Activity size={32} className="text-white/20" />
                           </div>
                           <div>
                             <h3 className="text-xl font-light text-white tracking-widest uppercase mb-2">Awaiting Analysis</h3>
                             <p className="text-white/40 text-sm max-w-sm font-light leading-relaxed">Select symptoms and provide details to generate an AI-powered possibility report.</p>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. CHAT TAB */}
            {tab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6 }}
                className="w-full h-full flex flex-col px-4 pb-20 justify-center items-center"
              >
                <div className="max-w-3xl w-full h-[75vh] flex flex-col bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden relative">
                  
                  {/* Decorative ambient light */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />

                  <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/5 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                       <Bot className="text-blue-300" size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-light tracking-widest uppercase text-white">Medical Assistant</h2>
                      <p className="text-blue-300/70 text-xs tracking-wider flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Online</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto hidden-scrollbar p-6 space-y-6 flex flex-col relative z-10">
                     {chat.map((m, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] px-5 py-4 text-sm font-light leading-relaxed shadow-lg ${m.type === 'user' ? 'bg-blue-500/30 text-white rounded-2xl rounded-tr-sm border border-blue-400/20' : 'bg-white/10 text-white/90 rounded-2xl rounded-tl-sm border border-white/10'}`}>
                          {m.content}
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm">
                          <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 border-t border-white/10 bg-black/20 relative z-10">
                    <div className="flex gap-2 mb-4 overflow-x-auto hidden-scrollbar pb-2 mask-linear">
                      {['I need workout advice','Nutrition tips for energy','Help with my skin','Ways to reduce stress'].map((s,i) => (
                        <button key={i} onClick={() => setChatInput(s)} className="flex-shrink-0 text-xs text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 py-2 px-4 rounded-full transition-all whitespace-nowrap">
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !chatLoading && sendChat()}
                        placeholder="Type your message..." disabled={chatLoading}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-light" />
                      <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all px-6 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Floating Apple-Watch-style Dock Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="flex items-center gap-1 p-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <button onClick={() => setTab('symptoms')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-500 ${tab === 'symptoms' ? 'bg-white/15 text-white shadow-inner' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
               <Stethoscope size={16} /> <span className="hidden sm:inline">Symptoms</span>
            </button>
            <button onClick={() => setTab('chat')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-500 ${tab === 'chat' ? 'bg-white/15 text-white shadow-inner' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
               <Bot size={16} /> <span className="hidden sm:inline">Assistant</span>
            </button>
        </div>
      </div>
      
    </div>
  )
}
