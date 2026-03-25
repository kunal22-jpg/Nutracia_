import { Router } from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth.middleware.js'
import DiaryEntry from '../models/DiaryEntry.model.js'
import { uploadToCloudinary } from '../services/cloudinary.service.js'
import { analyzeImageWithGemini } from '../services/gemini.service.js'
import { analyzeText } from '../services/groq.service.js'
import { transcribeFromBuffer } from '../services/deepgram.service.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4',
      'video/mp4', 'video/webm', 'video/quicktime']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not supported'))
  }
})

const getMediaType = (mime) => {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('video/')) return 'video'
  return 'text'
}

// POST /api/diary/text
router.post('/text', auth, async (req, res) => {
  try {
    const { text, title, mood, energy } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Text is required' })

    const analysis = await analyzeText(text)

    const entry = new DiaryEntry({
      userId: req.userId,
      mediaType: 'text',
      rawText: text,
      extractedText: text,
      title: title || '',
      mood: mood || 3,
      energy: energy || 3,
      moodTags: analysis.moodTags || [],
      sentimentScore: analysis.sentimentScore || 0,
      geminiAnalysis: JSON.stringify(analysis)
    })
    await entry.save()

    res.status(201).json({ message: 'Entry saved', entry: { id: entry._id, ...entry.toObject() } })
  } catch (err) {
    console.error('Diary text error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/diary/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const mediaType = getMediaType(req.file.mimetype)
    const { mood, energy, title } = req.body

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, mediaType, req.file.originalname)

    // Analyze based on type
    let analysis = { transcription: '', moodTags: [], sentimentScore: 0, summary: '' }
    if (mediaType === 'image') {
      analysis = await analyzeImageWithGemini(url)
    } else if (mediaType === 'audio' || mediaType === 'video') {
      const { transcript } = await transcribeFromBuffer(req.file.buffer, req.file.mimetype)
      if (transcript) {
        const textAnalysis = await analyzeText(transcript)
        analysis = { transcription: transcript, ...textAnalysis }
      }
    }

    const entry = new DiaryEntry({
      userId: req.userId,
      mediaType,
      rawText: '',
      extractedText: analysis.transcription || analysis.summary || '',
      mediaUrl: url,
      mediaPublicId: publicId,
      title: title || '',
      mood: parseInt(mood) || 3,
      energy: parseInt(energy) || 3,
      moodTags: analysis.moodTags || [],
      sentimentScore: analysis.sentimentScore || 0,
      geminiAnalysis: JSON.stringify(analysis)
    })
    await entry.save()

    res.status(201).json({ message: 'Entry saved', entry: { id: entry._id, ...entry.toObject() } })
  } catch (err) {
    console.error('Diary upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/diary/entries
router.get('/entries', auth, async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ entries })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/diary/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!entry) return res.status(404).json({ error: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
