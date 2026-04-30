import { useState } from 'react'

const ADMIN_HASH = import.meta.env.VITE_ADMIN_HASH ?? ''
const SESSION_KEY = 'adminAuth'
const SESSION_TOKEN = 'authenticated'

async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === SESSION_TOKEN
  )

  async function login(pin: string): Promise<boolean> {
    const hash = await hashPin(pin)
    if (hash === ADMIN_HASH) {
      sessionStorage.setItem(SESSION_KEY, SESSION_TOKEN)
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
