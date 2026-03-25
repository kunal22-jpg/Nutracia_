import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, VolumeX, Volume2 } from 'lucide-react'
import VideoBackground from '../components/VideoBackground.jsx'
import api from '../utils/api.js'

const BG = 'https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=1600&q=80'

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

export default function VoicePage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [orbState, setOrbState] = useState('idle') // idle | listening | thinking | speaking
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  const ANNE_INTRO = "Hello, I'm Anne 🌸 — your voice therapy companion. I'm here to listen without judgment and support you on your wellness journey. How are you feeling today?"

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
  }, [messages])

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

  const ORB_CONTENT = {
    idle: '🌸',
    listening: '👂',
    thinking: '💭',
    speaking: '🔊',
  }

  const ORB_COLOR = {
    idle: 'radial-gradient(circle at 35% 35%, #a78bfa, #7c3aed, #4c1d95)',
    listening: 'radial-gradient(circle at 35% 35%, #f87171, #dc2626, #7f1d1d)',
    thinking: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb, #1e3a8a)',
    speaking: 'radial-gradient(circle at 35% 35%, #34d399, #059669, #064e3b)',
  }

  const QUICK_PROMPTS = [
    "I'm feeling anxious lately",
    "I can't sleep well",
    "I feel overwhelmed at work",
    "I need help with stress",
    "I'm feeling lonely",
    "How do I build better habits?",
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/60" />

      <div className="relative z-10 pt-24 px-4 pb-16 min-h-screen flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-1">🎙️ Voice Therapy</h1>
            <p className="text-white/60">Talk with Anne — your empathetic AI wellness companion</p>
          </motion.div>

          {/* Animated Orb */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-36 h-36">
              {/* Pulse rings */}
              {(orbState === 'listening' || orbState === 'speaking') && [1, 2, 3].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.4 + i * 0.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, delay: i * 0.25, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: orbState === 'listening' ? 'rgba(248,113,113,0.5)' : 'rgba(52,211,153,0.5)' }}
                />
              ))}

              {/* Orb */}
              <motion.div
                animate={{
                  scale: orbState === 'speaking' ? [1, 1.06, 1] : orbState === 'listening' ? [1, 1.04, 1] : 1,
                }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-4 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: ORB_COLOR[orbState] }}
                onClick={toggleMic}
              >
                <span className="text-4xl select-none">{ORB_CONTENT[orbState]}</span>
              </motion.div>
            </div>

            {/* Status label */}
            <p className="text-white/50 text-sm mt-3">
              {orbState === 'idle' && 'Click orb or mic button to start talking'}
              {orbState === 'listening' && '🎤 Listening... click mic to stop & send'}
              {orbState === 'thinking' && '💭 Anne is thinking...'}
              {orbState === 'speaking' && '🔊 Anne is speaking...'}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 glass rounded-3xl p-5 mb-4 overflow-y-auto space-y-3" style={{ maxHeight: '280px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-purple-500 text-white' : 'glass-strong text-white/90 border border-purple-500/20'}`}>
                  {m.role === 'assistant' && <span className="text-purple-300 text-xs font-medium block mb-1">Anne 🌸</span>}
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex gap-2 flex-wrap mb-4">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)}
                className="text-xs btn-glass py-1.5 px-3 text-white/70 hover:text-white transition-colors">
                {p}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="glass rounded-2xl p-3 flex gap-3 items-center">
            {/* Mic toggle button */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${listening ? 'bg-red-500 text-white animate-pulse' : 'btn-glass'}`}
              title={listening ? 'Click to stop recording & send' : 'Click to start recording'}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} className="text-white" />}
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder={listening ? '🎤 Listening... speak now' : 'Type or click mic to talk with Anne...'}
              className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
            />

            {/* Stop speaking button */}
            {speaking && (
              <button onClick={stopSpeaking} className="p-3 rounded-xl btn-glass flex-shrink-0" title="Stop speaking">
                <VolumeX size={18} className="text-green-300" />
              </button>
            )}

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-all flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
            >
              Send
            </button>
          </div>

          <p className="text-center text-white/30 text-xs mt-3">
            Anne is an AI companion. For serious mental health concerns, please consult a professional. 🌿
          </p>
        </div>
      </div>
    </div>
  )
}