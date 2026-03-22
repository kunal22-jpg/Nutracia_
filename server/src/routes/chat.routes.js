import { Router } from 'express'
import { chatWithAI } from '../services/groq.service.js'
import ChatHistory from '../models/ChatHistory.model.js'

const router = Router()

const SYSTEM_PROMPT = `You are Nutracia — a friendly, knowledgeable AI health and wellness coach.
You specialize in: fitness, nutrition, skincare, mental wellness, and healthy lifestyles.
You're warm, encouraging, and give practical advice. Keep responses concise but helpful.
If asked about serious medical issues, recommend consulting a doctor.
You serve Indian users — be culturally aware (Indian foods, Ayurveda, etc. when relevant).`

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { user_id, message, user_profile } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' })

    // Build context messages
    let messages = []

    // Load history from DB
    try {
      const history = await ChatHistory.findOne({ userId: user_id })
      if (history?.messages?.length) {
        messages = history.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      }
    } catch {}

    // Add profile context if provided
    let systemWithProfile = SYSTEM_PROMPT
    if (user_profile) {
      systemWithProfile += `\n\nUser profile: Weight: ${user_profile.weight || 'unknown'}, Allergies: ${user_profile.allergies || 'none'}, Skin concern: ${user_profile.skin_concern || 'general'}`
    }

    messages.push({ role: 'user', content: message })
    const response = await chatWithAI(messages, systemWithProfile)

    // Save to history
    try {
      await ChatHistory.findOneAndUpdate(
        { userId: user_id },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: message },
                { role: 'assistant', content: response }
              ]
            }
          },
          updatedAt: new Date()
        },
        { upsert: true }
      )
    } catch {}

    res.json({ response, requires_profile: false })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ response: 'I\'m having trouble right now. Please try again in a moment.', error: err.message })
  }
})

export default router
