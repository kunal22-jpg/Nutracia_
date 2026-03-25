import { Router } from 'express'
import { chatWithAI } from '../services/groq.service.js'

const router = Router()

const SYMPTOM_SYSTEM = `You are a medical triage AI assistant. Analyze symptoms and respond ONLY in valid JSON (no markdown).
Return a JSON object with: urgency_level (Low/Medium/High/Emergency), possible_conditions (array of {name, probability, description}),
recommendations (array of strings), when_to_seek_care (string), disclaimer (string).`

// POST /api/wellness/symptoms/analyze
router.post('/symptoms/analyze', async (req, res) => {
  try {
    const { symptoms, custom_symptoms, body_parts, duration, severity, additional_info } = req.body

    const allSymptoms = [...(symptoms || []), custom_symptoms].filter(Boolean).join(', ')
    if (!allSymptoms) return res.status(400).json({ error: 'No symptoms provided' })

    const prompt = `Patient symptoms: ${allSymptoms}
Body parts affected: ${(body_parts || []).join(', ') || 'not specified'}
Duration: ${duration || 'not specified'}
Severity: ${severity || 'moderate'}
Additional info: ${additional_info || 'none'}

Provide analysis in JSON format.`

    const response = await chatWithAI([{ role: 'user', content: prompt }], SYMPTOM_SYSTEM)
    const match = response.match(/\{[\s\S]*\}/)
    if (match) {
      return res.json(JSON.parse(match[0]))
    }

    // Fallback
    res.json({
      urgency_level: severity === 'severe' ? 'High' : severity === 'moderate' ? 'Medium' : 'Low',
      possible_conditions: [{ name: 'General Illness', probability: '—', description: 'Symptoms require professional evaluation' }],
      recommendations: ['Rest and stay hydrated', 'Monitor symptoms', 'Consult a doctor if symptoms persist beyond 3 days'],
      when_to_seek_care: 'If symptoms worsen or persist beyond 3 days',
      disclaimer: 'This is for informational purposes only. Not a substitute for professional medical advice.'
    })
  } catch (err) {
    console.error('Symptom analysis error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/wellness/meditation-content
router.get('/meditation-content', async (req, res) => {
  res.json({
    content: [
      { id: '1', title: '4-7-8 Breathing', description: 'Calm anxiety and promote sleep with this proven breathing technique', duration: '5 min', type: 'breathing_exercise', difficulty: 'Beginner', benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers heart rate'], instructions: ['Exhale completely through mouth', 'Close mouth, inhale through nose for 4 counts', 'Hold breath for 7 counts', 'Exhale through mouth for 8 counts', 'Repeat 4 cycles'], category: 'stress_relief', youtube_video: 'https://www.youtube.com/embed/gz4G31LGyog' },
      { id: '2', title: 'Body Scan Meditation', description: 'Release tension progressively from head to toe with mindful awareness', duration: '10 min', type: 'guided_meditation', difficulty: 'Beginner', benefits: ['Reduces stress', 'Improves body awareness', 'Promotes relaxation'], instructions: ['Lie down comfortably', 'Close eyes and breathe deeply', 'Focus attention on your feet', 'Slowly move awareness up through each body part', 'Notice sensations without judgment'], category: 'mindfulness', youtube_video: 'https://www.youtube.com/embed/QS2yDmWk0vs' },
      { id: '3', title: 'Loving-Kindness Meditation', description: 'Cultivate compassion for yourself and others with this heart-centered practice', duration: '12 min', type: 'guided_meditation', difficulty: 'Beginner', benefits: ['Increases positivity', 'Reduces self-criticism', 'Builds empathy'], instructions: ['Sit comfortably and close eyes', 'Breathe naturally and relax', 'Silently repeat: May I be happy, may I be well', 'Extend the same wishes to others', 'Let the feelings of warmth grow'], category: 'mindfulness', youtube_video: 'https://www.youtube.com/embed/sz7cpV7ERsM' },
      { id: '4', title: 'Sleep Meditation', description: 'Drift into restful sleep with this calming guided practice', duration: '20 min', type: 'sleep_meditation', difficulty: 'Beginner', benefits: ['Improves sleep quality', 'Reduces insomnia', 'Calms racing thoughts'], instructions: ['Lie in bed in a comfortable position', 'Take 5 deep breaths', 'Visualize a peaceful place', 'Scan body for tension and release it', 'Allow thoughts to drift past without engaging'], category: 'sleep', youtube_video: 'https://www.youtube.com/embed/aEqlQvczMJQ' },
      { id: '5', title: 'Stress Relief Visualization', description: 'Use the power of imagination to dissolve stress and find inner peace', duration: '8 min', type: 'stress_relief', difficulty: 'Beginner', benefits: ['Reduces cortisol', 'Promotes calm', 'Boosts mood'], instructions: ['Find a quiet comfortable spot', 'Close eyes and breathe deeply', 'Imagine a safe, peaceful place in nature', 'Engage all senses in the visualization', 'Return slowly, feeling refreshed'], category: 'stress_relief', youtube_video: 'https://www.youtube.com/embed/MIr3RsUWrdo' },
      { id: '6', title: 'Mindful Walking', description: 'Transform a simple walk into a meditation practice for everyday mindfulness', duration: '15 min', type: 'mindfulness', difficulty: 'Beginner', benefits: ['Grounds in present', 'Reduces anxiety', 'Improves focus'], instructions: ['Find a quiet place to walk', 'Walk slower than usual', 'Feel each foot touching the ground', 'Notice sights, sounds, and smells', 'When mind wanders, gently return to steps'], category: 'mindfulness', youtube_video: 'https://www.youtube.com/embed/6Fu6M7jgfog' },
    ]
  })
})

// POST /api/wellness/mood-tracker
router.post('/mood-tracker', async (req, res) => {
  // Simple in-memory/no-auth mood logging (could expand with DB)
  res.json({ success: true, message: 'Mood logged' })
})

export default router
