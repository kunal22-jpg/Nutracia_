import { useEffect, useRef } from 'react'

// Fallback grid gallery since OGL might have import issues in some setups
// Will attempt WebGL, gracefully falls back to CSS grid

export default function CircularGallery({ items = [], onItemClick, type }) {
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const stateRef = useRef({ scroll: 0, target: 0, velocity: 0, dragging: false, lastX: 0, startX: 0 })

  useEffect(() => {
    if (!items.length) return
    const el = containerRef.current
    if (!el) return

    const state = stateRef.current

    const onDown = (e) => {
      state.dragging = true
      state.startX = state.lastX = e.touches ? e.touches[0].clientX : e.clientX
      state.velocity = 0
      el.style.cursor = 'grabbing'
    }
    const onMove = (e) => {
      if (!state.dragging) return
      const x = e.touches ? e.touches[0].clientX : e.clientX
      const dx = x - state.lastX
      state.target += dx * 0.5
      state.velocity = dx * 0.5
      state.lastX = x
    }
    const onUp = (e) => {
      if (!state.dragging) return
      state.dragging = false
      el.style.cursor = 'grab'
      const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
      if (Math.abs(x - state.startX) < 8 && onItemClick) {
        const rect = el.getBoundingClientRect()
        const relX = x - rect.left - state.scroll
        const cardWidth = 200 + 16
        const idx = Math.floor(relX / cardWidth)
        if (idx >= 0 && idx < items.length) {
          onItemClick(items[idx].originalItem || items[idx])
        }
      }
    }
    const onWheel = (e) => { state.target -= e.deltaX * 0.5; e.preventDefault() }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })

    const cardWidth = 200 + 16
    const maxScroll = -(items.length * cardWidth - el.offsetWidth + cardWidth)

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick)
      if (!state.dragging) {
        state.target += state.velocity
        state.velocity *= 0.93
        state.target = Math.max(Math.min(state.target, 0), maxScroll)
      }
      state.scroll += (state.target - state.scroll) * 0.1
      const track = el.querySelector('.gallery-track')
      if (track) track.style.transform = `translateX(${state.scroll}px)`
    }
    tick()

    return () => {
      cancelAnimationFrame(rafRef.current)
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [items, onItemClick])

  const IMAGES = {
    workout: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=280&fit=crop&auto=format&q=80',
    skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=280&fit=crop&auto=format&q=80',
    diet: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=280&fit=crop&auto=format&q=80',
    health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=280&fit=crop&auto=format&q=80',
    meditation: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&auto=format&q=80',
  }

  const getImage = (item, idx) => {
    if (item.image_url?.startsWith('http')) return item.image_url
    if (item.image?.startsWith('http')) return item.image
    return IMAGES[type] || `https://picsum.photos/seed/${idx + type}/400/280`
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: '380px', cursor: 'grab' }}
    >
      <div
        className="gallery-track flex gap-4 items-center h-full px-8"
        style={{ willChange: 'transform', width: 'max-content' }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex-shrink-0 rounded-2xl overflow-hidden relative group"
            style={{ width: 200, height: 300 }}
            onClick={() => onItemClick && onItemClick(item.originalItem || item)}
          >
            <img
              src={getImage(item, idx)}
              alt={item.text || item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-semibold text-sm leading-tight line-clamp-2">
                {item.text || item.title}
              </p>
            </div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/60 rounded-2xl transition-all duration-300" />
          </div>
        ))}
      </div>
    </div>
  )
}
