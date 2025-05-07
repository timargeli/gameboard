import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

type AuthContextType = {
  userId: number | null
  setUserId: (id: number | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(() => {
    // hátha még ott van localstorageben
    const stored = localStorage.getItem('userId')
    return stored ? Number(stored) : null
  })

  const setAndStoreUserId = (id: number | null) => {
    setUserId(id)
    if (id !== null) {
      localStorage.setItem('userId', id.toString())
    } else {
      localStorage.removeItem('userId')
    }
  }

  const logout = () => setAndStoreUserId(null)

  return (
    <AuthContext.Provider value={{ userId, setUserId: setAndStoreUserId, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth()
  const location = useLocation()

  if (!userId) {
    // Átirányítás loginra, megjegyezve honnan jött
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export const HomeRedirect = () => {
  const { userId } = useAuth()
  return <Navigate to={userId ? '/lobbies' : '/login'} replace />
}
