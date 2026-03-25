import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { User, X } from 'lucide-react'
import DecryptedText from './DecryptedText.jsx'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = useMemo(
    () => [
      { label: 'WORKOUT', to: '/workout' },
      { label: 'DIET', to: '/diet' },
      { label: 'SKINCARE', to: '/skincare' },
      { label: 'MIND', to: '/mind-soul' },
      { label: 'HEALTH', to: '/health' },
      { label: 'SHOP', to: '/order-up' },
      { label: 'DIARY', to: '/diary' },
      { label: 'VOICE', to: '/voice' },
      { label: 'NEARBY', to: '/nearby' }
    ],
    []
  )

  const STAGGER_MS = 30
  const [visibleCount, setVisibleCount] = useState(0)
  const timeoutsRef = useRef([])

  useEffect(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t))
    timeoutsRef.current = []

    if (!isOpen) {
      setVisibleCount(0)
      return
    }

    setVisibleCount(0)
    navItems.forEach((_, idx) => {
      const t = window.setTimeout(() => {
        setVisibleCount((prev) => Math.max(prev, idx + 1))
      }, 50 + idx * STAGGER_MS)
      timeoutsRef.current.push(t)
    })

    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [isOpen, navItems])

  const checkAuth = () => {
    const user = localStorage.getItem('user')
    const userId = localStorage.getItem('userId')
    if (user && userId) {
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(user))
    } else {
      setIsLoggedIn(false)
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [location])

  useEffect(() => {
    window.addEventListener('authChange', checkAuth)
    return () => window.removeEventListener('authChange', checkAuth)
  }, [])

  const logout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setIsOpen(false)
    window.dispatchEvent(new Event('authChange'))
    navigate('/')
  }

  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  return (
    <>
      <header
        className="fixed left-0 top-0 z-[100] w-full bg-[#9da396]"
        style={{ height: '64px' }}
      >
        <div className="pointer-events-none absolute left-0 top-0 h-[1px] w-full bg-white/90" />

        <div className="relative h-full px-4 sm:px-6">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo Pill - Reduced size to 18px */}
              <Link
                to="/"
                onClick={close}
                className="inline-flex select-none items-center rounded-full bg-[#8c9285] px-6 py-2 text-[18px] font-bold tracking-widest text-white cursor-pointer uppercase shadow-sm"
                style={{ lineHeight: 1 }}
              >
                Nutracia
              </Link>

              {/* MENU -> CLOSE expansion */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isOpen}
                  className="inline-flex select-none items-center rounded-full bg-[#8c9285] px-5 py-2 text-xs font-semibold tracking-widest text-white cursor-pointer uppercase transition-colors hover:opacity-95"
                  style={{ lineHeight: 1 }}
                >
                  {isOpen ? 'CLOSE' : 'MENU'}
                </button>

                <motion.div
                  className="hidden lg:block overflow-hidden"
                  initial={false}
                  animate={{ scaleX: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'left' }}
                >
                  <nav className="flex items-center gap-2 whitespace-nowrap">
                    {navItems.map((item, idx) => {
                      if (idx >= visibleCount) return null
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={close}
                          className="inline-flex select-none items-center rounded-full bg-[#8c9285] px-4 py-1.5 text-[10px] font-semibold tracking-widest text-white cursor-pointer uppercase transition-all hover:bg-white/10"
                          style={{ lineHeight: 1 }}
                        >
                          <DecryptedText
                            text={item.label}
                            speed={25}
                            maxIterations={4}
                            className="text-white"
                          />
                        </Link>
                      )
                    })}
                  </nav>
                </motion.div>
              </div>
            </div>

            {/* Right side: Auth / Profile */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfile(true)}
                    className="inline-flex select-none items-center rounded-full bg-[#8c9285] px-5 py-2 text-xs font-semibold tracking-widest text-white cursor-pointer uppercase"
                  >
                    {currentUser?.name?.split(' ')[0] || 'PROFILE'}
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex select-none items-center rounded-full bg-red-900/30 border border-red-500/20 px-4 py-2 text-xs font-semibold tracking-widest text-white cursor-pointer uppercase hover:bg-red-900/50 transition-colors"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link
                  to="/get-started"
                  className="inline-flex select-none items-center rounded-full bg-[#8c9285] px-5 py-2 text-xs font-semibold tracking-widest text-white cursor-pointer uppercase"
                >
                  GET STARTED
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Expansion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden absolute top-full left-0 w-full bg-[#9da396] border-t border-white/10 overflow-hidden shadow-xl"
            >
              <div className="p-4 grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={close}
                    className="flex items-center justify-center rounded-full bg-[#8c9285] px-4 py-3 text-[11px] font-bold tracking-widest text-white uppercase"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Profile modal */}
      <AnimatePresence>
        {showProfile && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#9da396] border border-white/20 rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto relative text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-5 right-5 p-2 bg-[#8c9285] rounded-full"
              >
                <X size={16} className="text-white" />
              </button>
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#8c9285] flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="opacity-70">{currentUser.email}</p>
              </div>
              <div className="space-y-3">
                {[
                  ['Age', currentUser.age],
                  ['Gender', currentUser.gender],
                  ['Height', `${currentUser.height} ${currentUser.height_unit || 'cm'}`],
                  ['Weight', `${currentUser.weight} ${currentUser.weight_unit || 'kg'}`],
                  ['Fitness Level', currentUser.fitness_level],
                  ['Diet', currentUser.diet_type],
                  ['Skin Type', currentUser.skin_type],
                ]
                  .filter(([, v]) => v)
                  .map(([label, val]) => (
                    <div
                      key={label}
                      className="bg-[#8c9285] rounded-xl px-4 py-3 flex justify-between items-center"
                    >
                      <span className="opacity-60 text-sm">{label}</span>
                      <span className="font-medium capitalize">{val}</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
