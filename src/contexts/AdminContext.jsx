import { createContext, useContext, useState, useCallback } from 'react'
import { verifyAdminPin } from '../services/database'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true')
  const [showLogin, setShowLogin] = useState(false)

  const login = useCallback(async (pin) => {
    const valid = await verifyAdminPin(pin)
    if (valid) {
      setIsAdmin(true)
      sessionStorage.setItem('isAdmin', 'true')
      setShowLogin(false)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAdmin(false)
    sessionStorage.removeItem('isAdmin')
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, showLogin, setShowLogin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
