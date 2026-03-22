# 🌿 Nutracía — AI-Powered Wellness Platform

> *Redefine Your Limits*

A unified AI health & wellness web app: fitness, nutrition, skincare, mental health, voice therapy, emotional diary, AI grocery, and nearby care — all free.

---

## ⚡ Quick Start (3 steps)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up environment variables
cp server/.env.example server/.env
# Edit server/.env and fill in your API keys

# 3. Run both client + server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Required API Keys

All services have **free tiers** — no paid subscriptions needed.

| Service | Where to get | Used for |
|---------|-------------|---------|
| `MONGO_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) (free M0) | Database |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (free, no card) | AI Chat (primary LLM) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) (free, no card) | Grocery AI + Diary analysis |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) ($5 free credit) | AI fallback |
| `DEEPGRAM_API_KEY` | [console.deepgram.com](https://console.deepgram.com) ($200 free credit) | Voice STT + TTS |
| `CLOUDINARY_*` | [cloudinary.com](https://cloudinary.com) (free 25GB) | Diary media uploads |
| `GOOGLE_MAPS_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) ($200/mo free) | Nearby care map |
| `JWT_SECRET` | Generate: `openssl rand -hex 64` | Auth tokens |

> **Minimal setup:** Only `MONGO_URI`, `GROQ_API_KEY`, and `JWT_SECRET` are required to run core features. Everything else enhances optional features.

---

## 📁 Project Structure

```
nutracia/
├── package.json          ← root (runs both with concurrently)
├── client/               ← React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/        ← HomePage, WorkoutPage, DiaryPage, etc.
│   │   ├── components/   ← Header, Modal, CircularGallery, AIChatbot...
│   │   └── utils/api.js
│   └── vite.config.js    ← proxies /api → localhost:5000
└── server/               ← Node.js + Express backend
    ├── .env.example      ← copy to .env and fill keys
    └── src/
        ├── index.js      ← entry point
        ├── routes/       ← auth, chat, diary, grocery, voice, wellness, maps
        ├── models/       ← User, DiaryEntry, ChatHistory
        └── services/     ← groq, gemini, deepgram, cloudinary
```

---

## 🌟 Features

| Feature | Route | Description |
|---------|-------|-------------|
| 🏋️ Workout Plans | `/workout` | 8 plans in circular WebGL gallery + YouTube embeds |
| ✨ Skincare Routines | `/skincare` | 8 science-backed routines with step-by-step guide |
| 🥗 Diet Plans | `/diet` | 8 nutrition plans (Keto, Mediterranean, Plant-based...) |
| 🧠 Mind & Soul | `/mind-soul` | Meditation library, 4-7-8 breathing, timer, mood tracker |
| 🩺 Health Platform | `/health` | Symptom checker, medical chatbot, health education |
| 🛒 AI Grocery | `/order-up` | Gemini-powered smart shopping with budget filtering |
| 📔 Anne's Diary | `/diary` | Emotional journal with image/audio/video + AI mood analysis |
| 🎙️ Voice Therapy | `/voice` | Animated orb, voice input (Web Speech API), AI therapist Anne |
| 🗺️ Nearby Care | `/nearby` | Google Maps to find doctors/therapists within 5km |
| 🤖 AI Chatbot | (floating) | 24/7 health coach powered by Groq LLaMA-3 |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express (ESM)
- **Database:** MongoDB Atlas (Mongoose)
- **AI:** Groq LLaMA-3 (primary) + OpenAI GPT-3.5 (fallback) + Gemini 1.5 Flash
- **Voice:** Deepgram Nova-2 STT + Aura TTS + Web Speech API
- **Media:** Cloudinary (diary uploads)
- **Maps:** Google Maps Places API

---

## 📝 Notes

- The Vite dev server proxies all `/api` requests to `http://localhost:5000` — no CORS issues in dev
- Voice therapy uses browser's Web Speech API for STT (free, no API needed), with Deepgram as optional backend TTS
- Diary uploads require Cloudinary to be configured; text-only entries work without it
- Maps feature requires Google Maps API key; shows demo results without it
- The circular gallery is a CSS scroll-based carousel that works on all browsers
