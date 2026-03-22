import { useState } from 'react'
import { motion } from 'framer-motion'
import VideoBackground from '../components/VideoBackground.jsx'
import AIChatbot from '../components/AIChatbot.jsx'
import api from '../utils/api.js'

const BG = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&q=80'

const SYMPTOMS = ['Fever','Headache','Cough','Sore throat','Runny nose','Body aches','Fatigue','Nausea','Vomiting','Diarrhea','Stomach pain','Chest pain','Shortness of breath','Dizziness','Skin rash','Joint pain','Back pain','Muscle pain','Loss of appetite','Anxiety','Depression']
const BODY_PARTS = ['Head','Neck','Chest','Abdomen','Back','Arms','Legs','Hands','Feet','Eyes','Ears','Nose','Throat','Skin','Joints','Muscles']

const EDU_TOPICS = [
  { icon:'❤️', title:'Heart Health', overview:'Cardiovascular health is crucial for overall well-being.', keyPoints:['Regular exercise strengthens the heart','Balanced diet low in saturated fats','Managing stress effectively','Avoiding smoking and excess alcohol','Regular check-ups and monitoring'], tips:['150 minutes moderate exercise weekly','Include omega-3 rich foods','Monitor blood pressure regularly','Practice meditation','7–9 hours sleep per night'], warning:'Consult your doctor if you experience chest pain, shortness of breath, or irregular heartbeat.' },
  { icon:'🧠', title:'Mental Wellness', overview:'Mental health is just as important as physical health.', keyPoints:['Mental health affects daily functioning','Stress management is essential','Social connections support mental health','Professional help is available','Self-care improves resilience'], tips:['Practice mindfulness daily','Maintain strong social relationships','Set realistic goals and boundaries','Engage in enjoyable activities','Seek help when overwhelmed'], warning:'If you experience persistent sadness or anxiety, reach out to a mental health professional.' },
  { icon:'🥗', title:'Nutrition Basics', overview:'Proper nutrition provides the foundation for good health.', keyPoints:['Balanced meals include all food groups','Hydration is crucial','Portion control helps weight management','Fresh whole foods are preferred','Individual needs vary'], tips:['Half your plate with fruits/veg','Choose whole grains','Include lean protein','8–10 glasses water daily','Limit processed foods'], warning:'Consult a dietitian for personalized plans, especially with allergies or medical conditions.' },
  { icon:'💪', title:'Exercise & Fitness', overview:'Regular physical activity is essential for maintaining strength and health.', keyPoints:['Exercise improves cardiovascular health','Strength training maintains muscle mass','Flexibility prevents injury','Consistency over intensity','Activity boosts mental health'], tips:['Start slowly and increase gradually','Find enjoyable activities','Include cardio and strength training','Allow rest days','Set realistic goals'], warning:'Consult your doctor before starting a new exercise program if you have existing health conditions.' },
  { icon:'🛡️', title:'Preventive Care', overview:'Preventive healthcare focuses on maintaining health and early detection.', keyPoints:['Regular check-ups detect issues early','Vaccinations prevent serious diseases','Screenings catch problems early','Lifestyle changes prevent many conditions','Prevention is cost-effective'], tips:['Schedule annual physicals','Keep up with vaccinations','Follow screening guidelines','Maintain family health history','Discuss risk factors with doctor'], warning:"Don't skip recommended screenings even if you feel healthy. Early detection saves lives." },
  { icon:'😴', title:'Sleep Health', overview:'Quality sleep is essential for physical health and cognitive function.', keyPoints:['Sleep allows body to repair','Quality matters as much as quantity','Sleep affects immune function','Poor sleep impacts mental health','Sleep patterns affect hormones'], tips:['Consistent sleep schedule','Relaxing bedtime routine','Keep bedroom cool and dark','Avoid screens 1 hour before bed','Limit caffeine before sleep'], warning:'If you experience chronic insomnia or sleep apnea symptoms, consult a sleep specialist.' },
]

export default function HealthPage() {
  const [tab, setTab] = useState('symptoms')
  const [symptoms, setSymptoms] = useState([])
  const [customSymptoms, setCustomSymptoms] = useState('')
  const [bodyParts, setBodyParts] = useState([])
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('moderate')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState([{ type: 'bot', content: "Hi! I'm your AI health assistant. How can I help you today?" }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [eduModal, setEduModal] = useState(null)

  const toggle = (arr, setArr, val) => setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val])

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

  const TABS = [
    { id: 'symptoms', label: '🩺 Symptom Checker' },
    { id: 'chat', label: '🤖 Medical Bot' },
    { id: 'edu', label: '📚 Health Education' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/65" />
      <div className="relative z-10 pt-24 px-4 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Health Platform</h1>
            <p className="text-white/60">AI-powered health tools for symptom checking, guidance, and wellness education</p>
          </motion.div>

          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === t.id ? 'btn-primary' : 'btn-glass'}`}>{t.label}</button>)}
          </div>

          {/* Symptom Checker */}
          {tab === 'symptoms' && (
            <div className="glass rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-5">Select Your Symptoms</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggle(symptoms, setSymptoms, s)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-center ${symptoms.includes(s) ? 'bg-blue-500 text-white border-2 border-blue-400' : 'glass text-white/80 border border-white/20 hover:bg-white/15'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="text-white/80 text-sm font-medium block mb-2">Affected Body Parts</label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {BODY_PARTS.map(b => (
                    <button key={b} onClick={() => toggle(bodyParts, setBodyParts, b)}
                      className={`px-2 py-1.5 rounded-lg text-xs transition-all ${bodyParts.includes(b) ? 'bg-green-500 text-white' : 'glass text-white/70 hover:bg-white/15'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <textarea value={customSymptoms} onChange={e => setCustomSymptoms(e.target.value)} placeholder="Describe additional symptoms..." rows="2"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-4" />

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                    <option value="" className="bg-gray-800">Select duration</option>
                    {['Less than 1 day','1-3 days','About a week','More than a week','Chronic (ongoing)'].map(d => <option key={d} value={d} className="bg-gray-800">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                    {['mild','moderate','severe'].map(s => <option key={s} value={s} className="bg-gray-800 capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={analyze} disabled={loading || (!symptoms.length && !customSymptoms.trim())} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</> : <>🔍 Analyze Symptoms</>}
              </button>

              {result && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 text-sm font-medium">Urgency Level:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${result.urgency_level === 'High' || result.urgency_level === 'Emergency' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : result.urgency_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                      {result.urgency_level}
                    </span>
                  </div>
                  {result.possible_conditions && (
                    <div className="glass rounded-2xl p-4">
                      <h4 className="text-white font-semibold mb-3">🔍 Possible Conditions</h4>
                      <div className="space-y-2">
                        {result.possible_conditions.map((c, i) => (
                          <div key={i} className="flex justify-between items-start bg-white/5 rounded-xl p-3">
                            <div><p className="text-white font-medium text-sm">{c.name}</p><p className="text-white/60 text-xs mt-0.5">{c.description}</p></div>
                            <span className="text-blue-300 text-sm ml-3 flex-shrink-0">{c.probability}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.recommendations && (
                    <div className="glass rounded-2xl p-4">
                      <h4 className="text-white font-semibold mb-3">💡 Recommendations</h4>
                      <ul className="space-y-1.5">
                        {result.recommendations.map((r, i) => <li key={i} className="text-white/80 text-sm flex gap-2"><span className="text-green-400">•</span>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-red-200 text-sm font-medium mb-1">🏥 When to Seek Care</p>
                    <p className="text-red-100/80 text-sm">{result.when_to_seek_care}</p>
                  </div>
                  <p className="text-white/40 text-xs italic px-1">{result.disclaimer}</p>
                </div>
              )}
            </div>
          )}

          {/* Medical Chat */}
          {tab === 'chat' && (
            <div className="glass rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Medical AI Assistant</h2>
                <p className="text-white/50 text-sm">Get instant health guidance and support</p>
              </div>
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.type === 'user' ? 'bg-blue-500 text-white' : 'glass text-white/90'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="flex justify-start"><div className="glass px-4 py-3 rounded-2xl"><div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />)}</div></div></div>}
              </div>
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {['💪 Workout advice','🥗 Nutrition tips','✨ Skincare help','🧘 Stress management'].map((s,i) => (
                    <button key={i} onClick={() => setChatInput(s)} className="text-xs btn-glass py-1.5 px-3">{s}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !chatLoading && sendChat()}
                    placeholder="Ask your health question..." disabled={chatLoading}
                    className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} className="btn-primary py-3 px-5 disabled:opacity-40">Send</button>
                </div>
              </div>
            </div>
          )}

          {/* Health Education */}
          {tab === 'edu' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EDU_TOPICS.map((t, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }} onClick={() => setEduModal(t)}
                    className="glass rounded-2xl p-6 cursor-pointer hover:bg-white/15 transition-all card-hover">
                    <div className="text-4xl mb-3">{t.icon}</div>
                    <h3 className="text-white font-semibold mb-1">{t.title}</h3>
                    <p className="text-white/60 text-sm">{t.overview.slice(0,70)}...</p>
                    <p className="text-amber-400 text-xs mt-3">Click to learn more →</p>
                  </motion.div>
                ))}
              </div>

              {/* Edu Modal */}
              {eduModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setEduModal(null)}>
                  <div className="glass-strong rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">{eduModal.icon}</div>
                      <h2 className="text-2xl font-bold text-white">{eduModal.title}</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="glass rounded-2xl p-4"><p className="text-white/80 text-sm leading-relaxed">{eduModal.overview}</p></div>
                      <div className="glass rounded-2xl p-4"><h4 className="text-white font-semibold mb-3">Key Points</h4><ul className="space-y-2">{eduModal.keyPoints.map((k,i)=><li key={i} className="text-white/80 text-sm flex gap-2"><span className="text-blue-400 flex-shrink-0">•</span>{k}</li>)}</ul></div>
                      <div className="glass rounded-2xl p-4"><h4 className="text-white font-semibold mb-3">💡 Practical Tips</h4><ul className="space-y-2">{eduModal.tips.map((t,i)=><li key={i} className="text-white/80 text-sm flex gap-2"><span className="text-amber-400 flex-shrink-0">•</span>{t}</li>)}</ul></div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"><p className="text-red-200 text-sm">⚠️ {eduModal.warning}</p></div>
                    </div>
                    <div className="flex justify-center mt-6"><button onClick={() => setEduModal(null)} className="btn-primary">Got It!</button></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <AIChatbot />
    </div>
  )
}
