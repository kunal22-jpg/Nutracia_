import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy init — only created when actually used
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const groceryRecommendations = async ({ query, budget, diet }) => {
  try {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a smart grocery shopping assistant for India. 
User request: "${query}"
Budget: ₹${budget}
Diet preference: ${diet}

Recommend 6 products available on Amazon India or Flipkart.
Respond ONLY in valid JSON (no markdown, no extra text):
{
  "ai_response": "brief analysis",
  "recommendations": [
    {
      "name": "Product Name",
      "price": "₹299",
      "rating": "4.2",
      "description": "brief description",
      "protein": "25g per serving",
      "platform": "Amazon",
      "category": "supplement",
      "selected": false
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch (err) {
    console.error('Gemini grocery error:', err.message)
  }

  // Fallback if Gemini fails or key not set
  return {
    ai_response: 'Here are some popular health products within your budget.',
    recommendations: [
      { name: 'MuscleBlaze Whey Protein', price: '₹1,399', rating: '4.3', description: 'High quality whey protein for muscle building', protein: '24g per serving', platform: 'Amazon', category: 'supplement', selected: false },
      { name: 'Organic India Tulsi Green Tea', price: '₹299', rating: '4.5', description: 'Antioxidant-rich herbal tea', protein: '-', platform: 'Amazon', category: 'beverage', selected: false },
      { name: 'Himalaya Ashwagandha', price: '₹199', rating: '4.4', description: 'Natural stress relief supplement', protein: '-', platform: 'Flipkart', category: 'supplement', selected: false },
      { name: 'Saffola Oats', price: '₹249', rating: '4.1', description: 'High fiber oats for healthy breakfast', protein: '5g per serving', platform: 'Amazon', category: 'food', selected: false },
      { name: 'Dabur Honey', price: '₹179', rating: '4.6', description: 'Pure natural honey, great for immunity', protein: '-', platform: 'Amazon', category: 'food', selected: false },
      { name: 'Patanjali Amla Juice', price: '₹99', rating: '4.0', description: 'Vitamin C rich amla juice', protein: '-', platform: 'Flipkart', category: 'beverage', selected: false }
    ]
  }
}

export const analyzeImageWithGemini = async (imageUrl) => {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `Analyze this diary image and respond ONLY in valid JSON:
{
  "transcription": "description of image",
  "emotions": ["emotion1"],
  "themes": ["theme1"],
  "moodTags": ["tag1"],
  "sentimentScore": 0.0,
  "summary": "brief summary"
}`
    const response = await fetch(imageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: 'image/jpeg' } }
    ])
    const text = result.response.text()
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch (err) {
    console.error('Gemini image error:', err.message)
  }

  // Fallback
  return {
    transcription: 'Image uploaded',
    emotions: [],
    themes: [],
    moodTags: ['visual'],
    sentimentScore: 0,
    summary: 'Image diary entry'
  }
}