import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Dumbbell, Apple, Sparkles, Heart, ShoppingCart, BookOpen, Mic, Camera, SmilePlus, Loader2 } from 'lucide-react'
import VideoBackground from '../components/VideoBackground.jsx'
import api from '../utils/api.js'

const BG = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80'

const ALLERGIES = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Peanuts']
const CONDITIONS = ['PCOS', 'Diabetes', 'Asthma', 'Hypertension', 'Thyroid', 'Arthritis', 'Heart Disease', 'None']
const GOALS = [
  { id: 'muscle-gain', label: 'Muscle Gain', icon: '💪' },
  { id: 'fat-loss', label: 'Fat Loss', icon: '🔥' },
  { id: 'glowing-skin', label: 'Glowing Skin', icon: '✨' },
  { id: 'acne-control', label: 'Acne Control', icon: '🎯' },
  { id: 'anti-aging', label: 'Anti-Aging', icon: '🧴' },
  { id: 'boost-immunity', label: 'Boost Immunity', icon: '🛡️' },
  { id: 'manage-health', label: 'Manage Health', icon: '📊' },
  { id: 'flexibility', label: 'Flexibility', icon: '🤸' },
  { id: 'healthy-aging', label: 'Healthy Aging', icon: '🌱' },
  { id: 'general-fitness', label: 'General Fitness', icon: '🏃' },
]
const FEATURES = [
  { icon: Dumbbell, label: 'Workout Plans', color: 'from-red-400 to-orange-400' },
  { icon: Apple, label: 'Diet Plans', color: 'from-green-400 to-emerald-400' },
  { icon: Sparkles, label: 'Skincare', color: 'from-pink-400 to-purple-400' },
  { icon: Heart, label: 'Health Tools', color: 'from-red-400 to-pink-400' },
  { icon: ShoppingCart, label: 'AI Grocery', color: 'from-amber-400 to-yellow-400' },
  { icon: BookOpen, label: "Anne's Diary", color: 'from-rose-400 to-pink-400' },
  { icon: Mic, label: 'Voice Therapy', color: 'from-violet-400 to-purple-400' },
]

// ─── Smile Detection Component ──────────────────────────────────────────────
function SmileDetector({ onSmileDetected, onCancel, userName }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const faceApiRef = useRef(null)

  const [status, setStatus] = useState('loading') // loading | ready | detecting | success | error
  const [message, setMessage] = useState('Loading face detection models…')
  const [smileProgress, setSmileProgress] = useState(0)
  const smileCountRef = useRef(0)
  const SMILE_THRESHOLD = 0.75
  const REQUIRED_FRAMES = 3  // consecutive frames with smile

  // Load face-api.js from CDN
  useEffect(() => {
    let cancelled = false

    const loadFaceApi = async () => {
      try {
        // Load face-api.js script if not already loaded
        if (!window.faceapi) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
            script.onload = resolve
            script.onerror = () => reject(new Error('Failed to load face-api.js'))
            document.head.appendChild(script)
          })
        }

        if (cancelled) return
        const faceapi = window.faceapi
        faceApiRef.current = faceapi

        // Load models from a reliable CDN mirror
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
        setMessage('Loading detection models… (first time may take a moment)')

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ])

        if (cancelled) return
        setMessage('Starting camera…')

        // Start webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setStatus('ready')
        setMessage('😊 Smile to confirm your identity!')
      } catch (err) {
        if (!cancelled) {
          console.error('Face-api setup error:', err)
          setStatus('error')
          setMessage(err.message || 'Could not start camera. Please allow camera access.')
        }
      }
    }

    loadFaceApi()
    return () => { cancelled = true; stopStream() }
  }, [])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Start continuous detection once video is ready
  const startDetecting = useCallback(() => {
    if (!faceApiRef.current || !videoRef.current) return
    const faceapi = faceApiRef.current
    setStatus('detecting')
    smileCountRef.current = 0

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return
      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
          .withFaceExpressions()

        if (detections.length === 0) {
          smileCountRef.current = 0
          setSmileProgress(0)
          setMessage('No face detected – move closer 🙂')
          return
        }

        const expressions = detections[0].expressions
        const happyScore = expressions.happy || 0

        // Draw on canvas overlay
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, detections.map(d => d.detection))
        }

        if (happyScore >= SMILE_THRESHOLD) {
          smileCountRef.current += 1
          setSmileProgress(Math.min(100, (smileCountRef.current / REQUIRED_FRAMES) * 100))
          setMessage(`Big smile detected! Hold it… ${smileCountRef.current}/${REQUIRED_FRAMES}`)

          if (smileCountRef.current >= REQUIRED_FRAMES) {
            clearInterval(intervalRef.current)
            stopStream()
            setStatus('success')
            setMessage(`Welcome, ${userName || 'friend'}! 🎉`)
            setTimeout(() => onSmileDetected(), 800)
          }
        } else {
          smileCountRef.current = Math.max(0, smileCountRef.current - 1)
          setSmileProgress(Math.max(0, (smileCountRef.current / REQUIRED_FRAMES) * 100))
          if (happyScore > 0.3) {
            setMessage('Almost! Give us a bigger smile 😄')
          } else {
            setMessage('😊 Smile wide to log in!')
          }
        }
      } catch (err) {
        // silently skip frame errors
      }
    }, 400)
  }, [onSmileDetected, userName])

  const handleCancel = () => {
    stopStream()
    onCancel()
  }

  const statusColors = {
    loading: 'text-white/60',
    ready: 'text-amber-300',
    detecting: 'text-blue-300',
    success: 'text-green-400',
    error: 'text-red-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
          <SmilePlus size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Smile to Confirm</h3>
        <p className="text-white/50 text-sm mt-1">We verify your identity with a smile 😊</p>
      </div>

      {/* Camera feed */}
      <div className="relative w-64 h-48 rounded-2xl overflow-hidden glass mb-4">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
          onLoadedMetadata={startDetecting}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
        />
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-3">
            <Loader2 size={32} className="text-amber-400 animate-spin" />
            <span className="text-white/70 text-xs px-4 text-center">Loading AI models…</span>
          </div>
        )}
        {status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
            <span className="text-6xl">😄</span>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <Camera size={40} className="text-red-400" />
          </div>
        )}
      </div>

      {/* Smile progress bar */}
      {(status === 'detecting' || status === 'ready') && (
        <div className="w-64 mb-3">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-green-400"
              animate={{ width: `${smileProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      <p className={`text-sm font-medium mb-5 ${statusColors[status]}`}>{message}</p>

      <div className="flex gap-3 w-full">
        <button
          onClick={handleCancel}
          className="btn-glass flex-1 text-sm"
        >
          Cancel
        </button>
        {status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="btn-primary flex-1 text-sm"
          >
            Retry
          </button>
        )}
      </div>

      <p className="text-white/30 text-xs mt-4 px-4">
        Camera is used locally — no images are stored or sent to any server.
      </p>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GetStartedPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [showSmile, setShowSmile] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', agreeTerms: false,
    age: '', gender: '', height: '', heightUnit: 'cm', weight: '', weightUnit: 'kg',
    allergies: [], customAllergy: '', chronicConditions: [],
    wellnessGoals: [], fitnessLevel: '', dietPreference: '', skinType: '', smartCartOptIn: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }))

  const validate = () => {
    if (tab === 'login') {
      if (!form.email || !form.password) return 'Email and password required'
    } else {
      if (step === 1 && (!form.name || !form.email || !form.password)) return 'Please fill all required fields'
      if (step === 1 && form.password !== form.confirmPassword) return 'Passwords do not match'
      if (step === 1 && !form.agreeTerms) return 'You must agree to the terms'
      if (step === 2 && (!form.age || !form.gender || !form.height || !form.weight)) return 'Please fill all vital stats'
      if (step === 4 && form.wellnessGoals.length === 0) return 'Select at least one wellness goal'
      if (step === 5 && (!form.fitnessLevel || !form.dietPreference || !form.skinType)) return 'Please complete all preferences'
    }
    return null
  }

  const next = () => {
    const err = validate()
    if (err) { setMsg({ text: err, type: 'error' }); return }
    setMsg({ text: '', type: '' })
    setStep(s => Math.min(s + 1, 5))
  }

  // Called when smile is confirmed
  const handleSmileSuccess = async () => {
    setShowSmile(false)
    await doSubmit()
  }

  // Pre-validate then show smile prompt
  const submit = () => {
    const err = validate()
    if (err) { setMsg({ text: err, type: 'error' }); return }
    setMsg({ text: '', type: '' })
    setShowSmile(true)
  }

  // Actual API call after smile
  const doSubmit = async () => {
    setLoading(true)
    setMsg({ text: '', type: '' })
    try {
      let res
      if (tab === 'login') {
        res = await api.post('/auth/login', { email: form.email, password: form.password })
      } else {
        res = await api.post('/auth/signup', {
          name: form.name, email: form.email, password: form.password,
          confirmPassword: form.confirmPassword, agreeTerms: form.agreeTerms,
          age: +form.age, gender: form.gender,
          height: +form.height, heightUnit: form.heightUnit,
          weight: +form.weight, weightUnit: form.weightUnit,
          allergies: form.allergies, chronicConditions: form.chronicConditions,
          wellnessGoals: form.wellnessGoals, fitnessLevel: form.fitnessLevel,
          dietPreference: form.dietPreference, skinType: form.skinType,
          smartCartOptIn: form.smartCartOptIn,
        })
      }
      const d = res.data
      if (d.success) {
        localStorage.setItem('token', d.token)
        localStorage.setItem('user', JSON.stringify(d.user))
        localStorage.setItem('userId', d.user_id)
        window.dispatchEvent(new Event('authChange'))
        setMsg({ text: '🎉 Success! Redirecting…', type: 'success' })
        setTimeout(() => navigate('/'), 1200)
      } else {
        setMsg({ text: d.message || 'Authentication failed', type: 'error' })
      }
    } catch (e) {
      setMsg({ text: e.response?.data?.message || 'Server error. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const addAllergy = () => {
    if (form.customAllergy.trim() && !form.allergies.includes(form.customAllergy.trim())) {
      setForm(f => ({ ...f, allergies: [...f.allergies, f.customAllergy.trim()], customAllergy: '' }))
    }
  }

  const inputCls = 'w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400'
  const selectCls = 'w-full glass rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-400'

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/55" />
      <div className="relative z-10 pt-20 px-4 pb-10 min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-5 gap-6 items-center">

          {/* Left panel */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="hidden lg:flex lg:col-span-1 flex-col gap-3">
            {FEATURES.slice(0, 4).map(({ icon: Icon, label, color }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                  <Icon size={17} className="text-white" />
                </div>
                <p className="text-white font-semibold text-sm">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Main form */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 glass-strong rounded-3xl p-8 max-h-[80vh] overflow-y-auto shadow-2xl">

            <div className="text-center mb-6">
              <h1 className="text-3xl font-cinzel nutracia-gradient mb-1">Nutracía</h1>
              <p className="text-white/60 text-sm">Your AI wellness journey starts here</p>
            </div>

            {/* Smile detector overlay */}
            <AnimatePresence>
              {showSmile && (
                <motion.div
                  key="smile-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                  style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
                >
                  <div className="glass-strong rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                    <SmileDetector
                      onSmileDetected={handleSmileSuccess}
                      onCancel={() => setShowSmile(false)}
                      userName={form.name || form.email.split('@')[0]}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab */}
            <div className="flex glass rounded-xl p-1 mb-6">
              {['login', 'signup'].map(t => (
                <button key={t} onClick={() => { setTab(t); setStep(1); setMsg({ text: '', type: '' }) }}
                  className={`flex-1 py-2.5 rounded-lg capitalize font-medium text-sm transition-all ${tab === t ? 'btn-primary' : 'text-white/60'}`}>
                  {t === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Progress for signup */}
            {tab === 'signup' && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-white/50 mb-1.5">
                  <span>Step {step} of 5</span><span>{Math.round(step / 5 * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${step / 5 * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
                </div>
              </div>
            )}

            {/* Message */}
            {msg.text && (
              <div className={`rounded-xl px-4 py-3 mb-4 text-sm text-center ${msg.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {msg.text}
              </div>
            )}

            {/* ── LOGIN ── */}
            {tab === 'login' && (
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="your@email.com" className={inputCls} />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Password</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="••••••••" className={inputCls} />
                </div>

                {/* Smile-to-login button */}
                <button
                  onClick={submit}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Logging in…</>
                    : <><SmilePlus size={18} /> Smile to Login</>
                  }
                </button>

                <p className="text-center text-white/40 text-xs">
                  You'll be asked to smile to verify your identity 😊
                </p>
              </div>
            )}

            {/* ── SIGNUP MULTI-STEP ── */}
            {tab === 'signup' && (
              <div>
                {/* Step 1 — Credentials */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Basic Credentials</h3>
                    {[
                      ['name', 'text', 'Full Name', 'Your full name'],
                      ['email', 'email', 'Email Address', 'you@example.com'],
                      ['password', 'password', 'Password', 'Create a password'],
                      ['confirmPassword', 'password', 'Confirm Password', 'Repeat password'],
                    ].map(([k, t, label, ph]) => (
                      <div key={k}>
                        <label className="text-white/70 text-sm mb-1.5 block">{label}</label>
                        <input type={t} value={form[k]} onChange={e => set(k, e.target.value)}
                          placeholder={ph} className={inputCls} />
                      </div>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.agreeTerms} onChange={e => set('agreeTerms', e.target.checked)}
                        className="w-4 h-4 accent-amber-400" />
                      <span className="text-white/70 text-sm">I agree to the <span className="text-amber-400">Terms & Privacy Policy</span></span>
                    </label>
                  </div>
                )}

                {/* Step 2 — Vital Stats */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Vital Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm mb-1.5 block">Age</label>
                        <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                          placeholder="25" min="1" max="120" className={inputCls} />
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-1.5 block">Gender</label>
                        <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectCls}>
                          <option value="" className="bg-gray-800">Select</option>
                          {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                            <option key={g} value={g.toLowerCase()} className="bg-gray-800">{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm mb-1.5 block">Height</label>
                        <div className="flex gap-2">
                          <input type="number" value={form.height} onChange={e => set('height', e.target.value)}
                            placeholder="170" className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                          <select value={form.heightUnit} onChange={e => set('heightUnit', e.target.value)}
                            className="glass rounded-xl px-3 py-3 text-white text-sm focus:outline-none">
                            <option value="cm" className="bg-gray-800">cm</option>
                            <option value="ft" className="bg-gray-800">ft</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-1.5 block">Weight</label>
                        <div className="flex gap-2">
                          <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)}
                            placeholder="65" className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                          <select value={form.weightUnit} onChange={e => set('weightUnit', e.target.value)}
                            className="glass rounded-xl px-3 py-3 text-white text-sm focus:outline-none">
                            <option value="kg" className="bg-gray-800">kg</option>
                            <option value="lbs" className="bg-gray-800">lbs</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 — Allergies */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h3 className="text-white font-semibold">Allergies & Medical History</h3>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Allergies (tap to select)</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ALLERGIES.map(a => (
                          <button key={a} type="button" onClick={() => toggle('allergies', a)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${form.allergies.includes(a) ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'glass text-white/70 hover:bg-white/15'}`}>
                            {a}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={form.customAllergy} onChange={e => set('customAllergy', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addAllergy()} placeholder="Add custom allergy…"
                          className="flex-1 glass rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                        <button onClick={addAllergy} className="btn-glass px-4 text-sm">Add</button>
                      </div>
                      {form.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {form.allergies.map(a => (
                            <span key={a} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs flex items-center gap-1.5">
                              {a}
                              <button onClick={() => toggle('allergies', a)} className="text-amber-400 hover:text-white">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Chronic Conditions</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CONDITIONS.map(c => (
                          <label key={c} className="flex items-center gap-2 cursor-pointer glass rounded-xl px-3 py-2.5 hover:bg-white/15 transition-colors">
                            <input type="checkbox" checked={form.chronicConditions.includes(c)}
                              onChange={() => toggle('chronicConditions', c)} className="w-4 h-4 accent-amber-400" />
                            <span className="text-white/80 text-sm">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4 — Goals */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">
                      Wellness Goals <span className="text-white/40 font-normal text-sm">({form.wellnessGoals.length} selected)</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {GOALS.map(g => (
                        <button key={g.id} type="button" onClick={() => toggle('wellnessGoals', g.id)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${form.wellnessGoals.includes(g.id) ? 'border-amber-400 bg-amber-400/15 text-white' : 'glass border-white/15 text-white/75 hover:bg-white/10'}`}>
                          <div className="text-2xl mb-1.5">{g.icon}</div>
                          <div className="text-sm font-medium">{g.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5 — Preferences */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Lifestyle & Preferences</h3>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Fitness Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['beginner', 'intermediate', 'advanced'].map(l => (
                          <button key={l} type="button" onClick={() => set('fitnessLevel', l)}
                            className={`py-3 rounded-xl border-2 capitalize text-sm transition-all ${form.fitnessLevel === l ? 'border-amber-400 bg-amber-400/15 text-white' : 'glass border-white/15 text-white/70 hover:bg-white/10'}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-1.5 block">Diet Preference</label>
                      <select value={form.dietPreference} onChange={e => set('dietPreference', e.target.value)} className={selectCls}>
                        <option value="" className="bg-gray-800">Select diet preference</option>
                        {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto', 'Jain', 'Gluten-Free'].map(d => (
                          <option key={d} value={d.toLowerCase()} className="bg-gray-800">{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-1.5 block">Skin Type</label>
                      <select value={form.skinType} onChange={e => set('skinType', e.target.value)} className={selectCls}>
                        <option value="" className="bg-gray-800">Select skin type</option>
                        {['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map(s => (
                          <option key={s} value={s.toLowerCase()} className="bg-gray-800">{s}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer glass rounded-xl px-4 py-3">
                      <input type="checkbox" checked={form.smartCartOptIn} onChange={e => set('smartCartOptIn', e.target.checked)}
                        className="w-4 h-4 accent-amber-400" />
                      <span className="text-white/70 text-sm">Allow Smart Cart to suggest products weekly</span>
                    </label>

                    {/* Smile info on last signup step */}
                    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                      <SmilePlus size={20} className="text-amber-400 flex-shrink-0" />
                      <p className="text-white/60 text-xs">
                        After clicking <strong className="text-amber-400">Join Nutracía</strong>, you'll need to smile at your camera to complete signup.
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)} className="btn-glass flex-1">← Back</button>
                  )}
                  {step < 5 ? (
                    <button type="button" onClick={next} className="btn-primary flex-1">Next →</button>
                  ) : (
                    <button type="button" onClick={submit} disabled={loading}
                      className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                        : <><SmilePlus size={18} /> Join Nutracía</>
                      }
                    </button>
                  )}
                </div>
              </div>
            )}

            <p className="text-center text-white/50 text-sm mt-5">
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setStep(1); setMsg({ text: '', type: '' }) }}
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                {tab === 'login' ? 'Sign up' : 'Login'}
              </button>
            </p>
          </motion.div>

          {/* Right panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="hidden lg:flex lg:col-span-1 flex-col gap-3">
            {FEATURES.slice(4).map(({ icon: Icon, label, color }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                  <Icon size={17} className="text-white" />
                </div>
                <p className="text-white font-semibold text-sm">{label}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  )
}