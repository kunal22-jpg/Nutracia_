import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, Image, Video, FileText, X, Trash2 } from 'lucide-react'
import VideoBackground from '../components/VideoBackground.jsx'
import api from '../utils/api.js'

const BG = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=80'
const MOODS = ['😢','😔','😐','😊','😄']

export default function DiaryPage() {
  const [entries, setEntries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState('text') // text | upload
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef()

  const fetchEntries = () => {
    setLoading(true)
    api.get('/diary/entries')
      .then(r => setEntries(r.data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEntries() }, [])

  const saveText = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await api.post('/diary/text', { text, title, mood, energy })
      setText(''); setTitle(''); setMood(3); setEnergy(3); setShowForm(false)
      fetchEntries()
    } catch { alert('Failed to save entry') }
    finally { setSaving(false) }
  }

  const saveUpload = async () => {
    if (!file) return
    setSaving(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('mood', mood)
    fd.append('energy', energy)
    fd.append('title', title)
    try {
      await api.post('/diary/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null); setTitle(''); setMood(3); setEnergy(3); setShowForm(false)
      fetchEntries()
    } catch { alert('Failed to upload. Cloudinary may not be configured.') }
    finally { setSaving(false) }
  }

  const deleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return
    try { await api.delete(`/diary/${id}`); fetchEntries() } catch { alert('Failed to delete') }
  }

  const getMoodColor = (score) => {
    if (score > 0.3) return 'text-green-400'
    if (score < -0.3) return 'text-red-400'
    return 'text-yellow-400'
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/65" />
      <div className="relative z-10 pt-24 px-4 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-1">📔 Anne's Diary</h1>
            <p className="font-vibes text-2xl text-white/60">"Write your soul, heal your heart"</p>
          </motion.div>

          {/* New entry button */}
          <div className="flex justify-end mb-5">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Entry
            </button>
          </div>

          {/* Entry Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="glass-strong rounded-3xl p-6 mb-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-white">New Entry</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 glass rounded-full"><X size={14} className="text-white" /></button>
                </div>

                {/* Tab switch */}
                <div className="flex gap-2 mb-5">
                  {[['text','📝 Text', FileText],['upload','📎 Media', Image]].map(([id,label,Icon]) => (
                    <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab===id ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'btn-glass'}`}>
                      <Icon size={14} />{label}
                    </button>
                  ))}
                </div>

                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title (optional)"
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 mb-4" />

                {tab === 'text' ? (
                  <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Dear diary... What's on your mind today?" rows="5"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none mb-4"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                ) : (
                  <div className="mb-4">
                    <div onClick={() => fileRef.current?.click()}
                      className="glass rounded-xl p-8 text-center cursor-pointer hover:bg-white/15 transition-colors border-2 border-dashed border-white/20 hover:border-amber-400/50">
                      {file ? (
                        <div className="flex items-center justify-center gap-3">
                          {file.type.startsWith('image') ? <Image size={20} className="text-amber-400" /> : file.type.startsWith('audio') ? <Mic size={20} className="text-amber-400" /> : <Video size={20} className="text-amber-400" />}
                          <span className="text-white/80 text-sm">{file.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center gap-4 mb-2 text-white/40"><Image size={24}/><Mic size={24}/><Video size={24}/></div>
                          <p className="text-white/60 text-sm">Click to upload image, audio, or video</p>
                          <p className="text-white/40 text-xs mt-1">AI will analyze and extract emotions</p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*,audio/*,video/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
                  </div>
                )}

                {/* Mood + Energy sliders */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/70 text-sm">Mood</span>
                      <span className="text-xl">{MOODS[mood-1]}</span>
                    </div>
                    <input type="range" min="1" max="5" value={mood} onChange={e => setMood(+e.target.value)} className="w-full accent-amber-400" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/70 text-sm">Energy</span>
                      <span className="text-xl">{'⚡'.repeat(energy)}</span>
                    </div>
                    <input type="range" min="1" max="5" value={energy} onChange={e => setEnergy(+e.target.value)} className="w-full accent-amber-400" />
                  </div>
                </div>

                <button
                  onClick={tab === 'text' ? saveText : saveUpload}
                  disabled={saving || (tab === 'text' ? !text.trim() : !file)}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : '💾 Save Entry'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entries list */}
          {loading ? (
            <div className="text-center py-12"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-white/50 text-sm">Loading entries...</p></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl">
              <p className="text-6xl mb-4">📔</p>
              <p className="text-white/60 font-vibes text-2xl">"Your story begins with the first word"</p>
              <p className="text-white/40 text-sm mt-2">Click "New Entry" to start writing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((e, i) => (
                <motion.div key={e._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{MOODS[(e.mood||3)-1]}</span>
                      <div>
                        <p className="text-white font-medium">{e.title || 'Untitled Entry'}</p>
                        <p className="text-white/40 text-xs">{fmtDate(e.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getMoodColor(e.sentimentScore)}`}>
                        {e.sentimentScore > 0.3 ? 'Positive' : e.sentimentScore < -0.3 ? 'Negative' : 'Neutral'}
                      </span>
                      <button onClick={() => deleteEntry(e._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {e.mediaUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden max-h-40">
                      {e.mediaType === 'image' ? <img src={e.mediaUrl} alt="diary media" className="w-full h-40 object-cover" /> :
                       e.mediaType === 'audio' ? <audio src={e.mediaUrl} controls className="w-full" /> :
                       <video src={e.mediaUrl} controls className="w-full max-h-40" />}
                    </div>
                  )}

                  <p className="text-white/75 text-sm leading-relaxed line-clamp-3 font-mono">{e.extractedText || e.rawText}</p>

                  {e.moodTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {e.moodTags.slice(0,5).map((t,j) => <span key={j} className="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-full text-xs">{t}</span>)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
