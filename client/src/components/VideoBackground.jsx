export default function VideoBackground({ src, overlay = 'bg-black/50', imgFallback }) {
  if (!src && imgFallback) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgFallback})`, filter: 'brightness(0.6)' }} />
        <div className={`absolute inset-0 ${overlay}`} />
      </div>
    )
  }
  return (
    <div className="absolute inset-0 overflow-hidden">
      {src ? (
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }}>
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  )
}
