import { motion } from 'framer-motion'

export default function ArchedCard({ item, onClick, isActive, theme = { accent: '#8C3B1F', bg: '#FFFFF0' } }) {
  return (
    <div
      className={`relative flex-shrink-0 cursor-pointer transition-all duration-700 ${
        isActive ? 'opacity-100 z-10' : 'opacity-40 grayscale-[0.5]'
      }`}
      style={{ width: '450px', height: '650px' }}
      onClick={() => onClick(item)}
    >
      {/* Dome Shape Container */}
      <div 
        className="w-full h-full overflow-hidden relative"
        style={{ 
          borderRadius: '225px 225px 40px 40px',
          boxShadow: isActive ? `0 30px 60px -12px ${theme.accent}4D` : 'none'
        }}
      >
        <img
          src={item.image || item.image_url}
          alt={item.title || item.name}
          className="w-full h-full object-cover transition-transform duration-700"
        />
        
        {/* Overlay with dynamic accent */}
        <div 
          className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent" 
          style={{ backgroundImage: `linear-gradient(to top, ${theme.accent}CC, transparent, transparent)` }}
        />

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
          <h2 className="text-6xl font-serif tracking-tight drop-shadow-2xl" style={{ fontFamily: 'Georgia, serif', color: theme.bg }}>
            {item.title || item.name}
          </h2>
        </div>
      </div>
    </div>
  )
}
