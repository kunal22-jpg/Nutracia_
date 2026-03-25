import mongoose from 'mongoose'

const chatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('ChatHistory', chatHistorySchema)
