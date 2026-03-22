import { v2 as cloudinary } from 'cloudinary'

const configure = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  return cloudinary
}

export const uploadToCloudinary = (buffer, mediaType, filename) => {
  return new Promise((resolve, reject) => {
    const folder = `nutracia/diary/${mediaType}`
    const resourceType = mediaType === 'image' ? 'image' : 'video'

    const uploadStream = configure().uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: `${Date.now()}_${filename}` },
      (err, result) => {
        if (err) return reject(err)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(buffer)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    await configure().uploader.destroy(publicId)
  } catch (err) {
    console.error('Cloudinary delete error:', err.message)
  }
}