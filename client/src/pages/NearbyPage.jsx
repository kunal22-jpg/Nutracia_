import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Star, Navigation } from 'lucide-react'
import VideoBackground from '../components/VideoBackground.jsx'
import api from '../utils/api.js'

const BG = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=80'

const TYPE_OPTIONS = [
  { id: 'doctor', label: '🏥 Doctors & Clinics' },
  { id: 'therapist', label: '🧠 Therapists' },
  { id: 'psychiatrist', label: '💊 Psychiatrists' },
]

const DEMO_DATA = {
  doctor: [
    { id: '1', name: 'City Health Clinic', address: 'MG Road', rating: 4.5, isOpen: true },
    { id: '2', name: 'Apollo Clinic', address: 'Sector 12, 1.2 km', rating: 4.7, isOpen: true },
    { id: '3', name: 'Dr. Mehta General Practice', address: 'Park Street, 2.1 km', rating: 4.3, isOpen: false },
    { id: '4', name: 'Fortis Healthcare', address: 'Main Road, 3.4 km', rating: 4.6, isOpen: true },
    { id: '5', name: 'Manipal Hospital', address: 'Highway, 4.1 km', rating: 4.4, isOpen: true },
    { id: '6', name: 'Columbia Asia', address: 'Ring Road, 4.8 km', rating: 4.2, isOpen: true },
  ],
  therapist: [
    { id: '1', name: 'MindWell Therapy Centre', address: 'Brigade Road, 0.8 km', rating: 4.9, isOpen: true },
    { id: '2', name: 'Rainbow Counseling', address: 'Koramangala, 1.5 km', rating: 4.7, isOpen: true },
    { id: '3', name: 'Inner Peace Wellness', address: 'Indiranagar, 2.3 km', rating: 4.6, isOpen: false },
    { id: '4', name: 'Mpower Mental Health', address: 'HSR Layout, 3.1 km', rating: 4.8, isOpen: true },
    { id: '5', name: 'The Mindful Space', address: 'Jayanagar, 3.8 km', rating: 4.5, isOpen: true },
    { id: '6', name: 'Vandrevala Foundation', address: 'BTM Layout, 4.5 km', rating: 4.4, isOpen: true },
  ],
  psychiatrist: [
    { id: '1', name: 'Dr. Sharma Psychiatry', address: 'Whitefield, 1.1 km', rating: 4.8, isOpen: true },
    { id: '2', name: 'NIMHANS Centre', address: 'Hosur Road, 2.0 km', rating: 4.9, isOpen: true },
    { id: '3', name: 'Cadabams Hospitals', address: 'Marathahalli, 2.7 km', rating: 4.6, isOpen: true },
    { id: '4', name: 'Dr. Priya Mental Wellness', address: 'Electronic City, 3.3 km', rating: 4.5, isOpen: false },
    { id: '5', name: 'Sequoia Hospital', address: 'JP Nagar, 4.0 km', rating: 4.7, isOpen: true },
    { id: '6', name: 'Spandana Hospital', address: 'Banashankari, 4.6 km', rating: 4.4, isOpen: true },
  ],
}

function PlaceCard({ place, selected, onClick }) {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`glass rounded-xl p-4 cursor-pointer transition-all border-2 ${
        selected ? 'border-amber-400/60 bg-amber-500/10' : 'border-transparent hover:border-white/20'
      }`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="text-white font-medium text-sm leading-tight flex-1 mr-2">{place.name}</h3>
        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
          place.isOpen === true ? 'bg-green-500/20 text-green-300' :
          place.isOpen === false ? 'bg-red-500/20 text-red-300' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {place.isOpen === true ? '● Open' : place.isOpen === false ? '● Closed' : '?'}
        </span>
      </div>

      <div className="flex items-center gap-1 text-white/50 text-xs mb-1.5">
        <MapPin size={11} />
        <span className="line-clamp-1">{place.address}</span>
      </div>

      {place.rating && (
        <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
          <Star size={11} />
          <span>{place.rating}</span>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          window.open(mapsUrl, '_blank')
        }}
        className="w-full text-center text-xs btn-glass py-1.5 mt-1"
      >
        📍 Open in Maps
      </button>
    </motion.div>
  )
}

export default function NearbyPage() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('doctor')
  const [radius, setRadius] = useState(5000)
  const [located, setLocated] = useState(false)
  const [coords, setCoords] = useState(null)
  const [selected, setSelected] = useState(null)
  const [hasRealAPI, setHasRealAPI] = useState(false)

  const getMapSrc = () => {
    const keyword =
      type === 'therapist' ? 'therapist+counselor' :
      type === 'psychiatrist' ? 'psychiatrist+mental+health' :
      'doctor+clinic+hospital'

    if (coords) {
      return `https://maps.google.com/maps?q=${keyword}&near=${coords.lat},${coords.lng}&z=14&output=embed`
    }
    return `https://maps.google.com/maps?q=${keyword}+near+me&z=13&output=embed`
  }

  const goToMaps = (place) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`
    window.open(url, '_blank')
  }

  const getLocation = () => {
    setLoading(true)
    if (!navigator.geolocation) {
      setLocated(true)
      setPlaces(DEMO_DATA[type])
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocated(true)
      },
      () => {
        setLocated(true)
        setPlaces(DEMO_DATA[type])
        setLoading(false)
      }
    )
  }

  useEffect(() => {
    if (!coords) return
    setLoading(true)
    api.get(`/maps/nearby?lat=${coords.lat}&lng=${coords.lng}&type=${type}&radius=${radius}`)
      .then(r => {
        const results = r.data.places || []
        if (results.length > 0) {
          setPlaces(results)
          setHasRealAPI(true)
        } else {
          setPlaces(DEMO_DATA[type])
        }
        setLoading(false)
      })
      .catch(() => {
        setPlaces(DEMO_DATA[type])
        setLoading(false)
      })
  }, [coords, type, radius])

  useEffect(() => {
    if (!hasRealAPI && located) {
      setPlaces(DEMO_DATA[type])
      setSelected(null)
    }
  }, [type, hasRealAPI, located])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground imgFallback={BG} overlay="bg-black/60" />

      <div className="relative z-10 pt-20 px-4 pb-6 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-5 pt-4"
          >
            <h1 className="text-4xl font-bold text-white mb-1">🗺️ Nearby Care</h1>
            <p className="text-white/60">Find doctors, therapists, and psychiatrists near you</p>
          </motion.div>

          {!located ? (
            <div className="max-w-md mx-auto text-center flex-1 flex flex-col items-center justify-center">
              <div className="glass rounded-3xl p-10 w-full">
                <div className="text-6xl mb-5 animate-float">📍</div>
                <h2 className="text-xl font-bold text-white mb-3">Find Care Near You</h2>
                <p className="text-white/60 text-sm mb-6">
                  Share your location to see providers on the map near you.
                </p>
                <button
                  onClick={getLocation}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <MapPin size={16} />
                  }
                  {loading ? 'Getting location...' : 'Find Nearby Care'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">

              {/* Filters */}
              <div className="glass rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {TYPE_OPTIONS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setType(t.id); setSelected(null) }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        type === t.id ? 'btn-primary' : 'btn-glass'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">Radius:</span>
                  <select
                    value={radius}
                    onChange={e => setRadius(+e.target.value)}
                    className="glass rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                  >
                    <option value={2000} className="bg-gray-800">2 km</option>
                    <option value={5000} className="bg-gray-800">5 km</option>
                    <option value={10000} className="bg-gray-800">10 km</option>
                  </select>
                </div>
              </div>

              {/* Map + List */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '520px' }}>

                {/* Google Maps iframe */}
                <div className="lg:col-span-2 glass rounded-2xl overflow-hidden relative" style={{ minHeight: '520px' }}>
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-white/50 text-sm">Finding providers...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <iframe
                        title="Nearby Care Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '520px', display: 'block' }}
                        loading="lazy"
                        allowFullScreen
                        src={getMapSrc()}
                      />

                      {/* Selected popup */}
                      {selected && (
                        <div className="absolute bottom-4 left-4 right-4 glass-strong rounded-2xl p-4 border border-white/20">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">{selected.name}</p>
                              <p className="text-white/60 text-sm truncate">{selected.address}</p>
                              {selected.rating && (
                                <div className="flex items-center gap-1 text-amber-400 text-sm mt-1">
                                  <Star size={12} />
                                  <span>{selected.rating}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => goToMaps(selected)}
                                className="btn-primary text-xs py-2 px-4 flex items-center gap-1"
                              >
                                <Navigation size={12} />
                                Directions
                              </button>
                              <button
                                onClick={() => setSelected(null)}
                                className="btn-glass text-xs py-2 px-4"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Sidebar list */}
                <div
                  className="flex flex-col gap-3 overflow-y-auto pr-1"
                  style={{ maxHeight: '520px' }}
                >
                  {places.map((place, i) => (
                    <PlaceCard
                      key={place.id || i}
                      place={place}
                      selected={selected?.id === place.id}
                      onClick={() => setSelected(place)}
                    />
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}