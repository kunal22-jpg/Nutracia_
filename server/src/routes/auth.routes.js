import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

const router = Router()

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, agreeTerms,
            age, gender, height, heightUnit, weight, weightUnit,
            allergies, chronicConditions, wellnessGoals,
            fitnessLevel, dietPreference, skinType, smartCartOptIn } = req.body

    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' })
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match' })
    if (!agreeTerms) return res.status(400).json({ success: false, message: 'You must agree to terms' })

    const existing = await User.findOne({ email }).catch(() => null)
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' })

    const user = new User({
      name, email, password, age, gender,
      height, heightUnit, weight, weightUnit,
      allergies: allergies || [], chronicConditions: chronicConditions || [],
      wellnessGoals: wellnessGoals || [], fitnessLevel, dietPreference, skinType,
      smartCartOptIn: smartCartOptIn || false
    })
    await user.save()

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user_id: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        height_unit: user.heightUnit,
        weight: user.weight,
        weight_unit: user.weightUnit,
        allergies: user.allergies,
        chronic_conditions: user.chronicConditions,
        goals: user.wellnessGoals,
        fitness_level: user.fitnessLevel,
        diet_type: user.dietPreference,
        skin_type: user.skinType,
      }
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ success: false, message: 'Server error during signup' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' })

    const user = await User.findOne({ email }).catch(() => null)
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user_id: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        height_unit: user.heightUnit,
        weight: user.weight,
        weight_unit: user.weightUnit,
        allergies: user.allergies,
        chronic_conditions: user.chronicConditions,
        goals: user.wellnessGoals,
        fitness_level: user.fitnessLevel,
        diet_type: user.dietPreference,
        skin_type: user.skinType,
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: 'Server error during login' })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ success: false, message: 'No token' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

export default router
