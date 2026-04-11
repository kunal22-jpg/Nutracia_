import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Navigation, Search, ChevronRight, Activity, Brain, Pill, Crosshair, Map as MapIcon, List, Info } from 'lucide-react'
import Iridescence from '../components/Iridescence'
import api from '../utils/api.js'

const TYPE_OPTIONS = [
  { id: 'doctor', label: 'Doctors', icon: Activity, color: '#38bdf8' },
  { id: 'therapist', label: 'Therapists', icon: Brain, color: '#818cf8' },
  { id: 'psychiatrist', label: 'Psychiatrists', icon: Pill, color: '#fb7185' },
]

const DEMO_DATA = {
  doctor: [
    { id: 'd1', name: 'City Health Clinic', address: 'MG Road', rating: 4.5, isOpen: true, isDemo: true },
    { id: 'd2', name: 'Apollo Clinic', address: 'Sector 12', rating: 4.7, isOpen: true, isDemo: true },
    { id: 'd3', name: 'Dr. Mehta Practice', address: 'Park Street', rating: 4.3, isOpen: false, isDemo: true },
  ],
  therapist: [
    { id: 't1', name: 'MindWell Therapy', address: 'Brigade Road', rating: 4.9, isOpen: true, isDemo: true },
    { id: 't2', name: 'Rainbow Counseling', address: 'Koramangala', rating: 4.7, isOpen: true, isDemo: true },
  ],
  psychiatrist: [
    { id: 'p1', name: 'Dr. Sharma Psychiatry', address: 'Whitefield', rating: 4.8, isOpen: true, isDemo: true },
    { id: 'p2', name: 'NIMHANS Centre', address: 'Hosur Road', rating: 4.9, isOpen: true, isDemo: true },
  ],
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
  item: { hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } } },
}

function PlaceCard({ place, selected, onClick, typeColor }) {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`

  return (
    <motion.div
      variants={stagger.item}
      onClick={onClick}
      className={`relative group rounded-2xl p-4 cursor-pointer transition-all duration-500 border backdrop-blur-md ${
        selected 
          ? 'bg-white/[0.12] border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.4)] translate-x-[-8px]' 
          : 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-white font-bold text-sm leading-tight flex-1 mr-3">{place.name}</h3>
        {place.isDemo && (
          <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Sample</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-white/40 text-[11px] mb-3 relative z-10">
        <MapPin size={10} style={{ color: typeColor }} />
        <span className="line-clamp-1">{place.address}</span>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
            {place.rating && (
                <div className="flex items-center gap-1 text-amber-400 text-[11px] font-black">
                    <Star size={10} className="fill-amber-400" />
                    <span>{place.rating}</span>
                </div>
            )}
            <span className={`text-[9px] font-bold uppercase tracking-wider ${place.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {place.isOpen ? '● Available' : '● Closed'}
            </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); window.open(mapsUrl, '_blank'); }}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Navigation size={14} />
        </button>
      </div>
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

  const activeType = TYPE_OPTIONS.find(t => t.id === type)

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

  const getLocation = () => {
    setLoading(true)
    if (!navigator.geolocation) {
      setLocated(true); setPlaces(DEMO_DATA[type]); setLoading(false);
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocated(true); },
      () => { setLocated(true); setPlaces(DEMO_DATA[type]); setLoading(false); }
    )
  }

  useEffect(() => {
    if (!coords) {
      setPlaces(DEMO_DATA[type])
      return
    }
    setLoading(true)
    api.get(`/maps/nearby?lat=${coords.lat}&lng=${coords.lng}&type=${type}&radius=${radius}`)
      .then(r => {
        const results = r.data.places || []
        if (results.length > 0) {
          setPlaces(results)
          setHasRealAPI(true)
        } else {
          setPlaces(DEMO_DATA[type])
          setHasRealAPI(false)
        }
        setLoading(false)
      })
      .catch(() => {
        setPlaces(DEMO_DATA[type])
        setHasRealAPI(false)
        setLoading(false)
      })
  }, [coords, type, radius])

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col bg-[#020617] font-sans">
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Iridescent Medical Background */}
      <div className="absolute inset-0 z-0">
        <Iridescence color={[0.01, 0.15, 0.3]} speed={0.4} amplitude={0.25} mouseReact={true} />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 opacity-[0.1]" style={{
          backgroundImage: `radial-gradient(rgba(56,189,248,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col pt-24 pb-12 px-8">
        {!located ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-16 max-w-xl w-full text-center shadow-2xl"
            >
              <div className="w-24 h-24 mx-auto mb-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl rotate-12 flex items-center justify-center text-white shadow-[0_20px_40px_rgba(56,189,248,0.3)]">
                <MapPin size={40} className="-rotate-12" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Active Geo-Scan</h2>
              <p className="text-white/40 text-sm leading-relaxed mb-10 px-4 uppercase tracking-[0.2em] font-medium">
                Initialize location services to map healthcare professionals in your area.
              </p>
              <button
                onClick={getLocation}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-white text-[#020617] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:tracking-[0.4em] active:scale-95 disabled:opacity-50"
              >
                {loading ? "Syncing..." : "Activate Scanner"}
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex gap-8 min-h-0">
            
            {/* 1. LEFT: Vertical Type Strip */}
            <div className="flex flex-col gap-4 py-8 shrink-0">
               {TYPE_OPTIONS.map(t => (
                 <button
                   key={t.id}
                   onClick={() => { setType(t.id); setSelected(null); }}
                   className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-500 border ${
                     type === t.id 
                       ? 'bg-white/10 border-white/20 text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-110' 
                       : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                   }`}
                   title={t.label}
                 >
                    <t.icon size={20} style={{ color: type === t.id ? t.color : 'inherit' }} />
                    <span className="text-[7px] font-black uppercase tracking-tighter">{t.label}</span>
                 </button>
               ))}
            </div>

            {/* 2. CENTER: Main HUD Map Container */}
            <div className="flex-1 flex flex-col gap-6 min-h-0">
              <div className="flex-1 relative glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                <iframe
                  title="Nearby Care Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(90%) contrast(100%) grayscale(0.2)' }}
                  src={getMapSrc()}
                />
                
                {/* HUD Overlay Elements */}
                <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-[2.5rem] bg-gradient-to-t from-[#020617]/40 to-transparent" />
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-[#020617]/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Live Scanner Active</span>
                </div>

                {/* Floating Radius Control at bottom of map */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-[#020617]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-2xl pointer-events-auto">
                    {[5000, 10000].map(r => (
                      <button
                        key={r}
                        onClick={() => setRadius(r)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all duration-300 tracking-[0.2em] ${
                          radius === r ? 'bg-white text-[#020617]' : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {r/1000}KM
                      </button>
                    ))}
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-14 shrink-0 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center px-6 gap-6">
                 <div className="flex items-center gap-2">
                    <Info size={14} className="text-blue-400" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      {hasRealAPI ? "Displaying live coordinates data" : "Displaying sample medical providers for preview"}
                    </span>
                 </div>
                 <div className="ml-auto flex items-center gap-4 text-[10px] font-black text-white/20 tracking-tighter">
                    <span>SYSTEM: READY</span>
                    <span>LAT: {coords?.lat?.toFixed(4) || '---'}</span>
                    <span>LNG: {coords?.lng?.toFixed(4) || '---'}</span>
                 </div>
              </div>
            </div>

            {/* 3. RIGHT: Data List HUD */}
            <div className="w-[380px] shrink-0 flex flex-col min-h-0 relative">
               <div className="absolute -top-12 right-0 flex items-center gap-2 text-white/30">
                  <List size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Registry</span>
               </div>
               
               <div className="flex-1 overflow-y-auto pr-2">
                 <AnimatePresence mode="wait">
                   {loading ? (
                     <motion.div 
                       key="loading"
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                       className="h-full flex flex-col items-center justify-center gap-4 opacity-20"
                     >
                        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                        <span className="text-xs font-black tracking-widest uppercase">Processing...</span>
                     </motion.div>
                   ) : (
                     <motion.div 
                       key="list"
                       variants={stagger.container} initial="hidden" animate="show"
                       className="space-y-4 pb-8"
                     >
                       {places.map((place, i) => (
                         <PlaceCard
                           key={place.id || i}
                           place={place}
                           selected={selected?.id === place.id}
                           onClick={() => setSelected(place)}
                           typeColor={activeType.color}
                         />
                       ))}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Selected Detail Popup Overlay */}
               <AnimatePresence>
                 {selected && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 20, scale: 0.95 }}
                     className="absolute bottom-0 left-0 right-0 z-50 bg-[#0ea5e9] rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(14,165,233,0.4)]"
                   >
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                           <Navigation size={20} />
                        </div>
                        <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest mt-1">Close</button>
                     </div>
                     <h4 className="text-white font-black text-lg leading-tight mb-1">{selected.name}</h4>
                     <p className="text-white/80 text-xs mb-6 line-clamp-2">{selected.address}</p>
                     <button 
                       onClick={() => { const url = `https://www.google.com/maps/search/${encodeURIComponent(selected.name + ' ' + selected.address)}`; window.open(url, '_blank'); }}
                       className="w-full py-3.5 bg-white rounded-xl text-[#0ea5e9] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                     >
                       Navigate via Maps
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
