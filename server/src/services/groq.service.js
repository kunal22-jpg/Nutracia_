import Groq from 'groq-sdk'
import OpenAI from 'openai'

let _groq = null
let _openai = null

const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}
const getOpenAI = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

export const chatWithAI = async (messages, systemPrompt, { temperature = 0.7, max_tokens = 2048 } = {}) => {
  const systemMsg = { role: 'system', content: systemPrompt }
  const allMessages = [systemMsg, ...messages]

  try {
    const completion = await getGroq().chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: allMessages,
      max_tokens,
      temperature,
    })
    return completion.choices[0]?.message?.content || ''
  } catch (groqErr) {
    console.warn('Groq failed, trying OpenAI:', groqErr.message)
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: allMessages,
        max_tokens,
        temperature,
      })
      return completion.choices[0]?.message?.content || ''
    } catch (openaiErr) {
      console.error('OpenAI also failed:', openaiErr.message)
      throw new Error('All AI providers unavailable')
    }
  }
}

export const analyzeText = async (text) => {
  const prompt = `Analyze this diary/wellness entry and respond ONLY in valid JSON (no markdown):
"${text}"

{
  "emotions": ["emotion1"],
  "themes": ["theme1"],
  "moodTags": ["tag1"],
  "sentimentScore": 0.0,
  "summary": "1-2 sentence summary"
}`

  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    })
    const text_resp = completion.choices[0]?.message?.content || ''
    const match = text_resp.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return { emotions: [], themes: [], moodTags: [], sentimentScore: 0, summary: text }
}