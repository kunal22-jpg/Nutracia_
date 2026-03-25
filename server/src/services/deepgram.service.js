import { createClient } from '@deepgram/sdk'

let _deepgram = null

const getDG = () => {
  if (!_deepgram) _deepgram = createClient(process.env.DEEPGRAM_API_KEY)
  return _deepgram
}

export const transcribeFromUrl = async (mediaUrl) => {
  try {
    const { result } = await getDG().listen.prerecorded.transcribeUrl(
      { url: mediaUrl },
      { model: 'nova-2', smart_format: true, punctuate: true, language: 'en' }
    )
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
    return { transcript, confidence }
  } catch (err) {
    console.error('Deepgram STT URL error:', err.message)
    return { transcript: '', confidence: 0 }
  }
}

export const transcribeFromBuffer = async (buffer, mimetype) => {
  try {
    const { result } = await getDG().listen.prerecorded.transcribeFile(
      buffer,
      { model: 'nova-2', smart_format: true, punctuate: true, language: 'en', mimetype }
    )
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
    return { transcript, confidence }
  } catch (err) {
    console.error('Deepgram STT buffer error:', err.message)
    return { transcript: '', confidence: 0 }
  }
}

export const textToSpeech = async (text, voice = 'aura-asteria-en') => {
  try {
    const response = await getDG().speak.request(
      { text },
      { model: voice, encoding: 'mp3', container: 'mp3' }
    )
    const stream = await response.getStream()
    const chunks = []
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    return Buffer.concat(chunks)
  } catch (err) {
    console.error('Deepgram TTS error:', err.message)
    throw err
  }
}