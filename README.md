# 🌿 NUTRACIA — Redefine Your Limits

> **One platform. Every dimension of you.**  
> A unified, 100% free AI-powered wellness platform built for India — combining physical fitness, nutrition, skincare, and mental health into a single seamless experience.

🌐 **Live Demo:**(https://nutracia1.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [AI Services Deep Dive](#ai-services-deep-dive)
- [Deployment](#deployment)

---

## Overview

India faces a dual crisis: rising lifestyle diseases and unaddressed mental health needs, yet existing wellness solutions are fragmented across multiple expensive apps. NUTRACIA is a **unified, free** alternative.

**The Problem:**
- 197 million Indians need mental health support
- 800 million cannot afford professional wellness guidance
- Existing solutions are siloed, expensive, and not built for Indian users

**The Solution:**  
A single React + Node.js web app that brings together 10 health modules powered by free-tier AI APIs — making premium health guidance accessible regardless of income.

---

## Core Features

### 🔐 Smile Gate (Emotion-Aware Entry)
The landing experience uses **webcam-based smile detection** running entirely on-device (no data sent to any server). A confident smile unlocks the session — functioning as a real-time emotional wellness check-in before the user even logs in.

### 🏋️ Workout Plans
Interactive 3D workout galleries powered by **React Three Fiber / WebGL**. Users select their program (HIIT, Yoga, Strength) and receive a day-wise exercise plan rendered in a 3D circular gallery. Automatically switches to a lighter 2D fallback on low-end Android devices for inclusive performance.

### 🥗 Diet Plans
AI-generated, personalized diet plans tailored to user health profiles — weight, allergies, fitness goals, and dietary preferences stored in MongoDB.

### 🧴 Skincare Routines
Science-backed skincare routines personalized to the user's skin type and concerns.

### 🧘 Mind & Soul
Cognitive Behavioral Therapy (CBT) tools including 4-7-8 breathing, guided meditation, and sleep protocols.

### 🎙️ Voice Therapy (Flagship Feature)
Real-time AI voice therapy with **Anne**, a warm and empathetic AI therapist. The pipeline:
1. **Browser Web Speech API** — captures voice input
2. **Groq LLaMA-3** — generates a short, empathetic response (2-3 sentences, optimised for voice)
3. **Browser Speech Synthesis API** — speaks the response back  
4. **Deepgram Nova-2 / Aura** — available as STT/TTS backend via `/api/voice` for higher accuracy

Sub-800ms end-to-end response latency. Supports both a voice orb UI and a text chat fallback.

### 📓 Anne's Diary (Multimodal Emotional Journal)
Users log mood via text, image, audio, or video. The analysis pipeline:
- **Text entries** → Groq LLaMA-3.1 (8B) for emotion/sentiment JSON extraction
- **Image entries** → Gemini 2.0 Flash multimodal analysis
- **Audio/Video entries** → Deepgram Nova-2 transcription → Groq sentiment analysis
- Entries stored in MongoDB with mood score (1-5), energy score (1-5), sentiment score, and mood tags
- Media files stored in Cloudinary (25 GB free tier)

### 🛒 AI Grocery Agent
LLM-powered smart grocery assistant for Indian e-commerce. Users describe their nutritional goals and budget in natural language (e.g., _"Plan a Keto diet for ₹800 this week"_). The agent:
- Reasons through macros, validates nutritional values, checks cost
- Returns 6 real, specific products from Amazon India / Flipkart with ratings and protein content
- Powered by **Groq LLaMA-3.3-70b** (primary) with **Gemini 2.0 Flash** as an alternative path

### 🗺️ Nearby Care
Google Maps Places API integration to find verified psychiatrists, doctors, and therapists within a 5 km radius. Includes ratings, hours, and one-tap calling.

### 🤖 AI Health Chatbot
A floating **Groq LLaMA-3** health chatbot available on every page. Culturally aware of Indian foods, Ayurveda, and regional wellness practices. Maintains conversation history per user in MongoDB.

### 🩺 Wellness / Symptom Analyser
AI-powered symptom analysis with appropriate suggestions and reminders to consult professionals.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS |
| **3D / Animation** | Three.js, React Three Fiber, Drei, Framer Motion, GSAP, OGL |
| **Backend** | Node.js 18+, Express 4, ES Modules |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Primary LLM** | Groq LLaMA-3.3-70b-versatile |
| **Fallback LLM** | OpenAI GPT-3.5-turbo |
| **Multimodal AI** | Google Gemini 2.0 Flash (grocery + diary images) |
| **STT** | Deepgram Nova-2 (prerecorded + streaming) |
| **TTS** | Deepgram Aura (aura-asteria-en voice) |
| **Browser STT/TTS** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Media Storage** | Cloudinary (images, audio, video) |
| **Maps** | Google Maps Places API |
| **Security** | Helmet, CORS, express-rate-limit |
| **Dev Tooling** | Nodemon, concurrently, PostCSS, Autoprefixer |

---

## Architecture

```
Browser (React SPA)
       │
       │  HTTPS
       ▼
Express REST API (Node.js)
       │
       ├─── /api/auth      → JWT auth, MongoDB user CRUD
       ├─── /api/chat      → Groq/OpenAI health chatbot
       ├─── /api/voice     → Voice therapy (Groq LLM + Deepgram TTS)
       ├─── /api/diary     → Multimodal diary (Gemini + Deepgram + Cloudinary)
       ├─── /api/grocery   → AI grocery agent (Groq + Gemini)
       ├─── /api/wellness  → Symptom analysis
       └─── /api/maps      → Nearby care (Google Maps Places)
              │
              ├── MongoDB Atlas   (users, diary entries, chat history)
              ├── Groq API        (LLaMA-3.3-70b — chat, voice, grocery)
              ├── Gemini API      (2.0 Flash — images, grocery alt)
              ├── Deepgram API    (Nova-2 STT, Aura TTS)
              ├── Cloudinary      (media uploads)
              └── Google Maps API (nearby places)
```

### AI Fallback Chain

```
Groq LLaMA-3.3-70b (Primary — free, fast)
        │ fails/rate-limited
        ▼
OpenAI GPT-3.5-turbo (Fallback)
        │ fails
        ▼
Hardcoded graceful fallback response
```

---

## Project Structure

```
nutracia/
├── package.json                    # Root — concurrently scripts
├── package-lock.json
├── .gitignore
│
├── client/                         # React Frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   │
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Router + protected routes
│   │   ├── index.css               # Global styles
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing + module hub
│   │   │   ├── GetStartedPage.jsx  # Signup / Login
│   │   │   ├── WorkoutPage.jsx     # 3D workout gallery
│   │   │   ├── DietPage.jsx        # AI diet plans
│   │   │   ├── SkincarePage.jsx    # Skincare routines
│   │   │   ├── MindSoulPage.jsx    # CBT tools, meditation
│   │   │   ├── VoicePage.jsx       # Voice therapy with Anne
│   │   │   ├── DiaryPage.jsx       # Multimodal diary
│   │   │   ├── GroceryPage.jsx     # AI grocery agent
│   │   │   ├── NearbyPage.jsx      # Nearby doctors/therapists
│   │   │   ├── HealthPage.jsx      # Symptom analysis
│   │   │   └── QuotePages.jsx      # Auth fallback quote screens
│   │   │
│   │   ├── components/
│   │   │   ├── Header.jsx          # Navigation bar
│   │   │   ├── AuthRoute.jsx       # JWT-based route guard
│   │   │   ├── AIChatbot.jsx       # Floating health chatbot
│   │   │   ├── Aurora.jsx          # WebGL aurora background
│   │   │   ├── CircularGallery.jsx # 3D WebGL circular gallery
│   │   │   ├── MagicBento.jsx      # Bento grid layout
│   │   │   ├── ArchedCard.jsx      # Arched module cards
│   │   │   ├── Modal.jsx           # Reusable modal
│   │   │   ├── PixelBlast.jsx      # Pixel burst animation
│   │   │   ├── ClickSpark.jsx      # Click spark effect (wraps app)
│   │   │   ├── DecryptedText.jsx   # Decryption text animation
│   │   │   ├── ShapeGrid.jsx       # Animated shape grid
│   │   │   ├── Iridescence.jsx     # Iridescent surface shader
│   │   │   ├── LightRays.jsx       # God-ray light effect
│   │   │   └── VideoBackground.jsx # Video background component
│   │   │
│   │   └── utils/
│   │       └── api.js              # Axios instance (base URL, JWT header)
│   │
│   └── dist/                       # Production build output
│       ├── index.html
│       └── assets/
│
└── server/                         # Node.js + Express Backend
    ├── package.json
    ├── package-lock.json
    ├── .env                        # Environment variables (DO NOT COMMIT)
    │
    └── src/
        ├── index.js                # Server entry — Express app, routes, startup
        │
        ├── config/
        │   └── db.js               # MongoDB Atlas connection (Mongoose)
        │
        ├── middleware/
        │   ├── auth.middleware.js   # JWT verification middleware
        │   └── errorHandler.js     # Global Express error handler
        │
        ├── models/
        │   ├── User.model.js        # User schema (profile, health data, JWT auth)
        │   ├── DiaryEntry.model.js  # Diary entry schema (multimodal, sentiment)
        │   └── ChatHistory.model.js # Chat history schema (per-user conversation)
        │
        ├── routes/
        │   ├── auth.routes.js       # POST /signup, POST /login
        │   ├── chat.routes.js       # POST /chat (health chatbot)
        │   ├── voice.routes.js      # POST /voice/chat, POST /voice/tts
        │   ├── diary.routes.js      # POST /text, POST /upload, GET /entries, DELETE /:id
        │   ├── grocery.routes.js    # POST /recommendations, POST /create-cart
        │   ├── wellness.routes.js   # POST /symptoms/analyze
        │   └── maps.routes.js       # GET /nearby
        │
        └── services/
            ├── deepgram.service.js  # STT (Nova-2) + TTS (Aura) via Deepgram SDK
            ├── groq.service.js      # LLM chat + text sentiment analysis (Groq → OpenAI fallback)
            ├── gemini.service.js    # Grocery recommendations + image analysis (Gemini 2.0 Flash)
            └── cloudinary.service.js# Media upload to Cloudinary
```

---

## API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/signup` | No | `{ name, email, password, ...profile }` | `{ token, user }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user }` |

### Chat (Health Chatbot)

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/chat` | No | `{ user_id, message, user_profile? }` | `{ response }` |

### Voice Therapy

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/voice/chat` | No | `{ message, history[] }` | `{ response }` |
| POST | `/api/voice/tts` | No | `{ text, voice? }` | `audio/mpeg` binary |

The `/tts` endpoint streams Deepgram Aura audio directly as an MP3 buffer. Default voice is `aura-asteria-en`.

### Diary (Anne's Diary)

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/diary/text` | **Yes** | `{ text, title?, mood?, energy? }` | `{ entry }` |
| POST | `/api/diary/upload` | **Yes** | `multipart/form-data` — `file`, `mood?`, `energy?`, `title?` | `{ entry }` |
| GET | `/api/diary/entries` | **Yes** | — | `{ entries[] }` |
| DELETE | `/api/diary/:id` | **Yes** | — | `{ message }` |

Supported upload MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `audio/mpeg`, `audio/wav`, `audio/webm`, `audio/ogg`, `audio/mp4`, `video/mp4`, `video/webm`, `video/quicktime`. Max file size: **100 MB**.

### Grocery Agent

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/grocery/recommendations` | No | `{ query, budget, diet }` | `{ ai_response, recommendations[] }` |
| POST | `/api/grocery/create-cart` | No | `[ ...products ]` | `{ cart_items[], total_cost, item_count }` |

### Maps

| Method | Endpoint | Auth | Query | Response |
|---|---|---|---|---|
| GET | `/api/maps/nearby` | No | `lat`, `lng`, `type?` | `{ places[] }` |

### Wellness

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/wellness/symptoms/analyze` | No | `{ symptoms, profile? }` | `{ analysis }` |

### Health Check

| Method | Endpoint | Response |
|---|---|---|
| GET | `/` | `{ status: "ok", version: "2.0.0" }` |
| GET | `/api/health` | `{ status: "ok" }` |

---

## Data Models

### User

```js
{
  name: String,           // required
  email: String,          // required, unique, lowercase
  password: String,       // bcrypt-hashed, min 6 chars
  age: Number,
  gender: String,
  height: Number,
  heightUnit: 'cm' | 'ft',
  weight: Number,
  weightUnit: 'kg' | 'lb',
  allergies: [String],
  chronicConditions: [String],
  wellnessGoals: [String],
  fitnessLevel: String,
  dietPreference: String,
  skinType: String,
  smartCartOptIn: Boolean,
  createdAt: Date
}
```

### DiaryEntry

```js
{
  userId: ObjectId,       // ref: User, indexed
  mediaType: 'text' | 'audio' | 'video' | 'image',
  rawText: String,
  extractedText: String,  // transcription or AI description
  mediaUrl: String,       // Cloudinary URL
  mediaPublicId: String,
  moodTags: [String],     // e.g. ['anxious', 'hopeful']
  sentimentScore: Number, // -1.0 to 1.0
  geminiAnalysis: String, // JSON string of full AI analysis
  mood: Number,           // 1-5 scale
  energy: Number,         // 1-5 scale
  title: String,
  createdAt: Date
}
```

Indexed on `userId` and full-text search on `rawText` + `extractedText`.

### ChatHistory

```js
{
  userId: String,
  messages: [{ role: 'user' | 'assistant', content: String }],
  updatedAt: Date
}
```

Stores the last 10 messages per user for context-aware chatbot responses.

---

## Environment Setup

Create `server/.env` by copying the template below. **All services listed have free tiers — no paid subscriptions required to run this project.**

```env
# ─── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── MongoDB Atlas (Free M0 cluster) ──────────────────────
# https://cloud.mongodb.com → Create free M0 cluster
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/nutracia?retryWrites=true&w=majority

# ─── JWT ──────────────────────────────────────────────────
# Generate: openssl rand -hex 64
JWT_SECRET=your_random_64_char_hex_string
JWT_EXPIRES_IN=7d

# ─── Groq (Primary LLM — FREE, no card required) ─────────
# https://console.groq.com
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# ─── OpenAI (Fallback LLM) ────────────────────────────────
# https://platform.openai.com ($5 credit on new accounts)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-3.5-turbo

# ─── Google Gemini (FREE, no card required) ───────────────
# https://aistudio.google.com/app/apikey
# Used for: grocery agent + diary image analysis
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash

# ─── Deepgram (STT + TTS — FREE $200 credit) ─────────────
# https://console.deepgram.com
# STT model: nova-2 | TTS voice: aura-asteria-en
DEEPGRAM_API_KEY=...

# ─── Cloudinary (FREE — 25GB storage) ────────────────────
# https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Google Maps Places API (FREE $200/mo credit) ─────────
# https://console.cloud.google.com → Enable Places API
GOOGLE_MAPS_API_KEY=AIza...

# ─── CORS ─────────────────────────────────────────────────
# Comma-separated for multiple origins
CLIENT_URL=http://localhost:5173

# ─── Rate Limiting ────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100


## Getting Started

### Prerequisites

- Node.js **18.0.0 or higher**
- npm 8+
- A modern browser (Chrome or Edge recommended for Web Speech API)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nutracia.git
cd nutracia

# 2. Install all dependencies (root + server + client) in one command
npm run install:all

# 3. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your API keys
```

### Development

```bash
# Run frontend + backend concurrently (from root)
npm run dev

# Or run individually:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### Production Build

```bash
# Build the React frontend
cd client && npm run build

# Start the backend server
cd ../server && npm start
```

The `client/dist/` folder contains the static build. Point your static host (Vercel, Netlify) at this folder, and deploy the backend separately (Render, Railway, Fly.io).

---

## AI Services Deep Dive

### Deepgram (STT + TTS)

```
STT: Deepgram Nova-2
  - transcribeFromUrl()    → prerecorded URL transcription
  - transcribeFromBuffer() → prerecorded buffer transcription
  - Model: nova-2, smart_format: true, punctuate: true, language: en

TTS: Deepgram Aura
  - textToSpeech(text, voice)
  - Default voice: aura-asteria-en
  - Output: MP3 buffer streamed directly to client
```

The Voice Therapy page also uses the **browser's built-in Web Speech API** (`SpeechRecognition` for STT, `SpeechSynthesis` for TTS) as the default path — requiring no API calls for the voice interaction loop. The Deepgram `/api/voice/tts` endpoint is available as a higher-quality alternative.

### Groq + OpenAI (LLM)

The `chatWithAI()` service function provides a unified interface with automatic fallback:

```
Primary:  Groq LLaMA-3.3-70b-versatile  (fast, free)
Fallback: OpenAI GPT-3.5-turbo          (if Groq fails)
```

Separate models are used contextually:
- `llama-3.3-70b-versatile` — main chat, voice therapy, grocery agent
- `llama-3.1-8b-instant` — lightweight sentiment analysis for diary text entries

### Gemini 2.0 Flash (Multimodal)

Used for two distinct tasks:
1. **Grocery recommendations** — text-only prompt with Indian product context
2. **Diary image analysis** — image uploaded as base64 inline data; returns emotions, themes, mood tags, and sentiment score as structured JSON

### Rate Limiting

All API routes are protected by `express-rate-limit`. Default: **100 requests per 15 minutes** per IP. Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` in `.env`.

---

## Deployment

### Frontend → Vercel

1. Connect your GitHub repo to (https://vercel.com)
2. Set **Root Directory** to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

### Backend → Render / Railway

1. Set **Root Directory** to `server`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all environment variables from `server/.env`
5. Set `CLIENT_URL` to your Vercel frontend URL

### Update CORS

After deploying, update `CLIENT_URL` in your backend environment to match your production frontend URL:

```env
CLIENT_URL=https://nutracia1.vercel.app
```

---

## Security Notes

- Passwords are hashed with **bcrypt (12 rounds)** before storage
- JWTs expire after **7 days** by default
- All routes are protected by **Helmet** (security headers) and **CORS** (origin allowlist)
- Media uploads are validated by MIME type on the server before processing
- Rate limiting is applied globally to prevent API abuse

---

## License

This project is open source and free to use. Built with ❤️ for India's wellness future.

**NUTRACIA — Redefine Your Limits.**
