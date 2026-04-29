import { useState } from 'react'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '1234'
const SESSION_KEY = 'adminAuth'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === ADMIN_PIN
  )

  function login(pin: string): boolean {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, ADMIN_PIN)
      setIsAdmin(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
  }

  return { isAdmin, login, logout }
}
