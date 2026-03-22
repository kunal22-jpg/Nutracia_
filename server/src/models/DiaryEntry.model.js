import mongoose from 'mongoose'

const diaryEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mediaType: { type: String, enum: ['text', 'audio', 'video', 'image'], required: true },
  rawText: { type: String, default: '' },
  extractedText: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  moodTags: [String],
  sentimentScore: { type: Number, default: 0 },
  geminiAnalysis: { type: String, default: '' },
  mood: { type: Number, default: 3 },        // 1-5 scale
  energy: { type: Number, default: 3 },      // 1-5 scale
  title: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

diaryEntrySchema.index({ rawText: 'text', extractedText: 'text' })

export default mongoose.model('DiaryEntry', diaryEntrySchema)
