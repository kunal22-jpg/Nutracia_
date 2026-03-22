import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/auth.routes.js'
import chatRoutes from './routes/chat.routes.js'
import groceryRoutes from './routes/grocery.routes.js'
import diaryRoutes from './routes/diary.routes.js'
import voiceRoutes from './routes/voice.routes.js'
import wellnessRoutes from './routes/wellness.routes.js'
import mapsRoutes from './routes/maps.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet({ crossOriginResourcePolicy: false }))

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(null, true) // allow all in dev
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', message: '🌿 Nutracia API is running' })
})
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/grocery', groceryRoutes)
app.use('/api/diary', diaryRoutes)
app.use('/api/voice', voiceRoutes)
app.use('/api/wellness', wellnessRoutes)
app.use('/api/maps', mapsRoutes)



app.use(errorHandler)

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n🌿 Nutracia server running on http://localhost:${PORT}`)
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   CORS: ${allowedOrigins.join(', ')}`)
    console.log('\n📋 API Routes:')
    console.log('   POST /api/auth/signup')
    console.log('   POST /api/auth/login')
    console.log('   POST /api/chat')
    console.log('   POST /api/grocery/recommendations')
    console.log('   POST /api/diary/text')
    console.log('   POST /api/diary/upload')
    console.log('   GET  /api/diary/entries')
    console.log('   POST /api/voice/chat')
    console.log('   POST /api/voice/tts')
    console.log('   POST /api/wellness/symptoms/analyze')
    console.log('   GET  /api/maps/nearby\n')
  })
}

start()
