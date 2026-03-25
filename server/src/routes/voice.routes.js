import { Router } from 'express'
import { textToSpeech } from '../services/deepgram.service.js'
import { chatWithAI } from '../services/groq.service.js'

const router = Router()

const VOICE_THERAPY_PROMPT = `You are Anne, a warm and empathetic AI voice therapist for Nutracia.
Your role is to provide emotional support, active listening, and gentle guidance.
Keep responses SHORT (2-3 sentences max) — this is a voice conversation.
Be warm, calm, and supportive. Use CBT-inspired techniques when appropriate.
Encourage professional help for serious issues. Never give medical diagnoses.`

// POST /api/voice/chat — text-based voice therapy (send text, get text back)
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' })

    const messages = (history || []).slice(-6)
    messages.push({ role: 'user', content: message })

    const response = await chatWithAI(messages, VOICE_THERAPY_PROMPT)
    res.json({ response })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/voice/tts — text to speech audio
router.post('/tts', async (req, res) => {
  try {
    const { text, voice } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' })

    const audioBuffer = await textToSpeech(text, voice || 'aura-asteria-en')
    res.set('Content-Type', 'audio/mpeg')
    res.send(audioBuffer)
  } catch (err) {
    console.error('TTS error:', err.message)
    res.status(500).json({ error: 'TTS unavailable' })
  }
})

export default router
