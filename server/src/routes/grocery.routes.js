import { Router } from 'express'
import { chatWithAI } from '../services/groq.service.js'

const router = Router()

router.post('/recommendations', async (req, res) => {
  try {
    const { query, budget, diet } = req.body
    if (!query?.trim()) return res.status(400).json({ error: 'Query is required' })

    const safeBudget = budget || 500
    const safeDiet = diet || 'balanced'

    const prompt = `You are an expert Indian grocery shopping assistant with deep knowledge of products available on Amazon India and Flipkart.

USER'S REQUEST: "${query}"
BUDGET LIMIT: ₹${safeBudget} (total for all products combined must not exceed this)
DIET PREFERENCE: ${safeDiet}

INSTRUCTIONS:
1. Recommend exactly 6 real, specific products that DIRECTLY match what the user asked for.
2. Each product price must be realistic for Indian e-commerce (Amazon India / Flipkart actual prices).
3. The TOTAL cost of all 6 products combined must stay within ₹${safeBudget}.
4. Each product must be compatible with the "${safeDiet}" diet preference.
5. Include actual brand names (e.g., "MuscleBlaze Biozyme Whey Protein 1kg" not just "Whey Protein").
6. If the user asks for supplements, recommend supplements. If vegetables, recommend vegetables. Match the category exactly.
7. Provide accurate protein content where applicable, or "-" if not relevant.
8. Give a helpful 2-3 sentence "ai_response" analyzing the user's needs and explaining your recommendations.

Respond ONLY with valid JSON (no markdown fences, no backticks, no extra text before or after):
{
  "ai_response": "2-3 sentence analysis of the user's needs and why these products were chosen",
  "recommendations": [
    {
      "name": "Full Product Name with Brand and Size",
      "price": "₹299",
      "rating": "4.2",
      "description": "2 sentence description explaining why this product fits the user's needs",
      "protein": "25g per serving",
      "platform": "Amazon",
      "category": "supplement",
      "selected": false
    }
  ]
}`

    const response = await chatWithAI(
      [{ role: 'user', content: prompt }],
      'You are an expert Indian grocery and health product shopping assistant. You must respond with ONLY valid JSON — no markdown, no code fences, no explanation outside the JSON. Every product you recommend must be a real product available on Indian e-commerce platforms with realistic pricing. Match the user query precisely.',
      { temperature: 0.4, max_tokens: 2048 }
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