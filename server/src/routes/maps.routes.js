import { Router } from 'express'
import axios from 'axios'

const router = Router()

// GET /api/maps/nearby?lat=&lng=&type=&radius=
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, type = 'doctor', radius = 5000 } = req.query
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' })

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return res.status(503).json({ error: 'Maps API not configured' })

    const keyword = type === 'therapist' ? 'therapist psychologist counselor' :
                    type === 'psychiatrist' ? 'psychiatrist mental health' : 'doctor clinic hospital'

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`
    const response = await axios.get(url)

    const places = (response.data.results || []).slice(0, 10).map(p => ({
      id: p.place_id,
      name: p.name,
      address: p.vicinity,
      rating: p.rating || null,
      isOpen: p.opening_hours?.open_now ?? null,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      types: p.types,
      photo: p.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
        : null
    }))

    res.json({ places, count: places.length })
  } catch (err) {
    console.error('Maps error:', err.message)
    res.status(500).json({ error: 'Failed to fetch nearby places' })
  }
})

export default router
