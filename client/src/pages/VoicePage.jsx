import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, VolumeX, MessageSquare, ChevronLeft, Send, X, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Aurora from '../components/Aurora.jsx'
import api from '../utils/api.js'

// Browser built-in TTS — works without any API key
const speakText = (text, onEnd) => {
  window.speechSynthesis.cancel() // stop any current speech
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.1
  utterance.volume = 1
  // Pick a female voice if available
  const voices = window.speechSynthesis.getVoices()
  const female = voices.find(v =>
    v.name.includes('Female') ||
    v.name.includes('Samantha') ||
    v.name.includes('Google UK English Female') ||
    v.name.includes('Zira') ||
    v.name.includes('Susan')
  )
  if (female) utterance.voice = female
  utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}

const WaveLayer = ({ color, duration, reverse }) => (
  <motion.div
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration, repeat: Infinity, ease: 'linear' }}
    className={`absolute inset-0 rounded-full border border-white/20 mix-blend-screen opacity-70 blur-[0.5px] ${color}`}
    style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
  />
)

const MorphingOrb = ({ state }) => {
  const scale = state === 'speaking' || state === 'listening' ? 1.05 : 1

  return (
    <motion.div animate={{ scale }} transition={{ duration: 0.5 }} className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Glow behind */}
      <div className={`absolute inset-0 rounded-full blur-[80px] opacity-40 transition-all duration-1000 ${
        state === 'listening' ? 'bg-blue-600' :
        state === 'speaking' ? 'bg-cyan-500' :
        state === 'thinking' ? 'bg-purple-600' :
        'bg-blue-500/20'
      }`} />
      
      {/* Morphing layers - particle wave simulation */}
      <WaveLayer color={state === 'listening' ? 'border-blue-400' : state === 'speaking' ? 'border-cyan-300' : state === 'thinking' ? 'border-purple-400' : 'border-white/20'} duration={8} />
      <WaveLayer color={state === 'listening' ? 'border-indigo-400' : state === 'speaking' ? 'border-blue-300' : state === 'thinking' ? 'border-pink-400' : 'border-white/10'} duration={12} reverse />
      <WaveLayer color={state === 'listening' ? 'border-blue-300' : state === 'speaking' ? 'border-teal-300' : state === 'thinking' ? 'border-indigo-400' : 'border-white/15'} duration={10} />
      <WaveLayer color={state === 'listening' ? 'border-purple-300' : state === 'speaking' ? 'border-blue-200' : state === 'thinking' ? 'border-fuchsia-400' : 'border-white/5'} duration={15} reverse />
      <WaveLayer color={state === 'listening' ? 'border-blue-500' : state === 'speaking' ? 'border-cyan-400' : state === 'thinking' ? 'border-purple-500' : 'border-white/20'} duration={9} />
      
      {/* Inner fine particles/lines simulated with a repeating conic gradient mask */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full opacity-30 mix-blend-overlay"
        style={{
           background: 'repeating-conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.8) 1deg, transparent 3deg)',
           maskImage: 'radial-gradient(circle, transparent 40%, black 100%)',
           WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 100%)'
        }}
      />

      {/* Core Equalizer Bars */}
      <div className="flex gap-[6px] items-center justify-center z-10 h-24">
        {[1, 2, 3, 4, 5].map((i) => {
          // make the middle ones taller
          const baseHeight = i === 3 ? 32 : i === 2 || i === 4 ? 24 : 16;
          const activeHeight = i === 3 ? 60 : i === 2 || i === 4 ? 45 : 25;
          return (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              animate={{
                height: state === 'speaking' || state === 'listening' 
                  ? [baseHeight, activeHeight + Math.random() * 20, baseHeight] 
                  : state === 'thinking'
                  ? [baseHeight, baseHeight + 10, baseHeight]
                  : baseHeight
              }}
              transition={{
                duration: state === 'idle' ? 2 : 0.3 + Math.random() * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

export default function VoicePage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [orbState, setOrbState] = useState('idle') // idle | listening | thinking | speaking
  const [chatMode, setChatMode] = useState(false) // Toggle text chat view
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const ANNE_INTRO = "Hello, I'm Anne. I'm here to listen without judgment. How are you feeling today?"

  useEffect(() => {
    setMessages([{ role: 'assistant', content: ANNE_INTRO }])

    // Load voices (Chrome needs this)
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()

    // Setup speech recognition
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      const recognition = new SR()
      recognition.continuous = true      // keep listening until manually stopped
      recognition.interimResults = true  // show words as they come
      recognition.lang = 'en-IN'

      recognition.onresult = (e) => {
        let final = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript
        }
        if (final) setInput(prev => prev + ' ' + final)
      }

      recognition.onerror = (e) => {
        console.error('Speech error:', e.error)
        setListening(false)
        setOrbState('idle')
      }

      recognition.onend = () => {
        // Only stop if we manually stopped (not auto-stop)
        if (recognitionRef.current?._manualStop) {
          setListening(false)
          setOrbState('idle')
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      window.speechSynthesis.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatMode])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Please use Chrome or Edge.')
      return
    }

    if (listening) {
      // STOP listening — send what we have
      recognitionRef.current._manualStop = true
      recognitionRef.current.stop()
      setListening(false)
      setOrbState('idle')
      // Auto-send after short delay if there's input
      setTimeout(() => {
        setInput(prev => {
          if (prev.trim()) sendMessage(prev.trim())
          return ''
        })
      }, 300)
    } else {
      // START listening
      recognitionRef.current._manualStop = false
      setInput('')
      setListening(true)
      setOrbState('listening')
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Already started, restart
        recognitionRef.current.stop()
        setTimeout(() => recognitionRef.current.start(), 300)
      }
    }
  }

  const sendMessage = async (textOverride) => {
    const text = textOverride || input
    if (!text.trim() || loading) return
    setInput('')

    const newMsg = { role: 'user', content: text }
    const updatedMsgs = [...messages, newMsg]
    setMessages(updatedMsgs)
    setLoading(true)
    setOrbState('thinking')

    try {
      const history = updatedMsgs.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/voice/chat', { message: text, history })
      const reply = res.data.response

      setMessages(p => [...p, { role: 'assistant', content: reply }])
      setLoading(false)
      setOrbState('speaking')
      setSpeaking(true)

      // Speak the reply using browser TTS
      speakText(reply, () => {
        setSpeaking(false)
        setOrbState('idle')
      })
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }])
      setLoading(false)
      setOrbState('idle')
    }
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setOrbState('idle')
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans">
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Background */}
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

      {/* Top Title Only */}
      <div className="relative z-10 flex items-center justify-center px-6 pt-24 pb-4">
        <h1 className="text-white/90 text-lg font-medium tracking-wide">Talking with Anne</h1>
      </div>

      {/* Bot Response Bubble (Right Side) */}
      <div className="fixed top-1/3 right-6 z-30 w-72 pointer-events-none">
        <AnimatePresence>
          {orbState === 'speaking' && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, rotate: -2 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-3xl rounded-tr-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
            >
              {/* Little tail for the bubble */}
              <div className="absolute -top-[1px] -right-[1px] w-4 h-4 bg-white/10 border-t border-r border-white/20 rotate-45 translate-x-1/2 -translate-y-1/2" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
              
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 text-[10px] uppercase tracking-[0.2em] font-bold">Anne is speaking</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed font-light italic">
                "{messages[messages.length - 1].content}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-4 transition-all duration-500 ${chatMode ? 'pb-32' : 'pb-12'}`}>
        <AnimatePresence mode="wait">
          {!chatMode ? (
            // VOICE MODE VIEW
            <motion.div 
              key="voice-mode"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center w-full max-w-md"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/50 text-sm mb-12 tracking-widest uppercase h-6"
              >
                {orbState === 'idle' && 'Tap the mic to start'}
                {orbState === 'listening' && 'Listening...'}
                {orbState === 'thinking' && 'Thinking...'}
                {orbState === 'speaking' && 'Speaking...'}
              </motion.div>

              <MorphingOrb state={orbState} />
              
              {/* Spacer to keep alignment stable */}
              <div className="h-20 mt-12" />
            </motion.div>
          ) : (
            // TEXT CHAT MODE VIEW (Floating minimalist, Image 1 style)
            <motion.div 
              key="chat-mode"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-2xl flex flex-col h-[60vh] max-h-[600px] bg-[#0f0f13]/80 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-6 shadow-2xl"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
              <div className="text-white/40 text-xs tracking-widest uppercase mb-4 text-center">Conversation History</div>
              
              <div className="flex-1 overflow-y-auto hidden-scrollbar space-y-4 mb-4 pr-2">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 px-5 py-4 rounded-2xl rounded-bl-sm flex gap-1.5">
                      {[0, 1, 2].map(i => (
                         <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-4 text-white placeholder-white/30 text-sm focus:outline-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 transition-colors hover:bg-blue-500"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls (Image 2 style) */}
      <div className="fixed bottom-10 left-0 right-0 z-20 flex justify-center items-center pointer-events-none">
        <motion.div 
          className="bg-[#13141a]/80 backdrop-blur-xl border border-white/5 p-4 rounded-[2.5rem] flex items-center gap-6 pointer-events-auto"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
        >
          {/* Chat Toggle Button */}
          <button 
            onClick={() => setChatMode(!chatMode)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${chatMode ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
          >
             {chatMode ? <X size={20} /> : <MessageSquare size={20} />}
          </button>

          {/* Center Hexagonal Mic Button */}
          {/* Blue when listening OR bot is speaking, Red when idle */}
          <div className="relative" style={{ filter: (listening || speaking) ? 'drop-shadow(0 0 20px rgba(37,99,235,0.6))' : 'drop-shadow(0 0 15px rgba(220,38,38,0.4))' }}>
            <button 
              onClick={toggleMic} 
              className={`w-20 h-24 flex items-center justify-center transition-all duration-300 relative overflow-hidden group ${(listening || speaking) ? 'bg-blue-600' : 'bg-red-500 animate-pulse'}`} 
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              {/* Inner gradient/glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              {(listening || speaking) ? <Mic size={28} className="text-white relative z-10" /> : <MicOff size={28} className="text-white relative z-10" />}
            </button>
          </div>

          {/* Stop Speaking / Close Button */}
          <button 
            onClick={speaking ? stopSpeaking : () => navigate('/')}
            className="w-12 h-12 rounded-full bg-white/5 text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
          >
            {speaking ? <VolumeX size={20} className="text-red-400" /> : <X size={20} />}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
