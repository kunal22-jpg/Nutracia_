import { useState, useEffect } from 'react'

export default function AuthRoute({ children, fallback }) {
  const [auth, setAuth] = useState(null)

  const check = () => {
    const user = localStorage.getItem('user')
    const userId = localStorage.getItem('userId')
    setAuth(!!(user && userId))
  }

  useEffect(() => {
    check()
    window.addEventListener('authChange', check)
    return () => window.removeEventListener('authChange', check)
  }, [])

  if (auth === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50">Loading...</p>
      </div>
    </div>
  )

  return auth ? children : (fallback || children)
}
