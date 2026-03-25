import { Router } from 'express'
import { chatWithAI } from '../services/groq.service.js'

const router = Router()

router.post('/recommendations', async (req, res) => {
  try {
    const { query, budget, diet } = req.body
    if (!query?.trim()) return res.status(400).json({ error: 'Query is required' })

    const prompt = `You are a smart grocery shopping assistant for India.
User request: "${query}"
Budget: ₹${budget || 500}
Diet preference: ${diet || 'balanced'}

Recommend 6 products available on Amazon India or Flipkart.
Respond ONLY in valid JSON (no markdown, no extra text):
{
  "ai_response": "brief analysis in one line",
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

    const response = await chatWithAI(
      [{ role: 'user', content: prompt }],
      'You are a grocery shopping assistant. Always respond with valid JSON only, no markdown.'
    )

    const match = response.match(/\{[\s\S]*\}/)
    if (match) {
      return res.json(JSON.parse(match[0]))
    }

    throw new Error('No valid JSON in response')

  } catch (err) {
    console.error('Grocery error:', err.message)
    // Fallback
    res.json({
      ai_response: 'Here are some popular health products within your budget.',
      recommendations: [
        { name: 'MuscleBlaze Whey Protein', price: '₹1,399', rating: '4.3', description: 'High quality whey protein for muscle building', protein: '24g per serving', platform: 'Amazon', category: 'supplement', selected: false },
        { name: 'Organic India Tulsi Green Tea', price: '₹299', rating: '4.5', description: 'Antioxidant-rich herbal tea', protein: '-', platform: 'Amazon', category: 'beverage', selected: false },
        { name: 'Himalaya Ashwagandha', price: '₹199', rating: '4.4', description: 'Natural stress relief supplement', protein: '-', platform: 'Flipkart', category: 'supplement', selected: false },
        { name: 'Saffola Oats', price: '₹249', rating: '4.1', description: 'High fiber oats for healthy breakfast', protein: '5g per serving', platform: 'Amazon', category: 'food', selected: false },
        { name: 'Dabur Honey', price: '₹179', rating: '4.6', description: 'Pure natural honey, great for immunity', protein: '-', platform: 'Amazon', category: 'food', selected: false },
        { name: 'Patanjali Amla Juice', price: '₹99', rating: '4.0', description: 'Vitamin C rich amla juice', protein: '-', platform: 'Flipkart', category: 'beverage', selected: false }
      ]
    })
  }
})

router.post('/create-cart', async (req, res) => {
  try {
    const products = req.body
    const selected = Array.isArray(products) ? products.filter(p => p.selected) : []
    const parsePrice = (p) => {
      const n = parseFloat((p.price || '₹0').replace(/[^0-9.]/g, ''))
      return isNaN(n) ? 0 : n
    }
    const total = selected.reduce((sum, p) => sum + parsePrice(p), 0)
    res.json({ cart_items: selected, total_cost: total.toFixed(0), item_count: selected.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create cart' })
  }
})

export default router