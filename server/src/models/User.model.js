import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },

  // Vital stats
  age: { type: Number },
  gender: { type: String },
  height: { type: Number },
  heightUnit: { type: String, default: 'cm' },
  weight: { type: Number },
  weightUnit: { type: String, default: 'kg' },

  // Health profile
  allergies: [String],
  chronicConditions: [String],
  wellnessGoals: [String],
  fitnessLevel: { type: String },
  dietPreference: { type: String },
  skinType: { type: String },
  smartCartOptIn: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
