import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import axios from 'axios'

const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE 
const SNKR_BASE = import.meta.env.VITE_XANO_STORE_BASE 
const TOKEN_TTL_SEC = Number(import.meta.env.VITE_XANO_TOKEN_TTL_SEC || '86400')

const AuthContext = createContext(null)

function decodeJwt(token) {

  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = payload.length % 4
    if (pad) payload += '='.repeat(4 - pad)
    const json = atob(payload)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  })
  const [expiresAt, setExpiresAt] = useState(() => {
    const raw = localStorage.getItem('auth_exp')
    return raw ? Number(raw) : null
  })

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('auth_token')
      setExpiresAt(null)
      localStorage.removeItem('auth_exp')
      return
    }

    localStorage.setItem('auth_token', token)

    const payload = decodeJwt(token)
    let expMs = payload?.exp ? payload.exp * 1000 : null
    if (!expMs) expMs = Date.now() + (TOKEN_TTL_SEC * 1000)

    setExpiresAt(expMs)
    localStorage.setItem('auth_exp', String(expMs))
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
  }, [user])

  const makeAuthHeader = (t) => ({ Authorization: `Bearer ${t}` })

  async function login({ email, password }) {

    const { data } = await axios.post(`${AUTH_BASE}/auth/login`, { email, password })

    const newToken = data?.authToken || data?.token || data?.jwt || ''
    const meRes = await axios.get(`${AUTH_BASE}/auth/me`, { 
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json"
      }
    })
    const newUser = meRes?.data || null

    setToken(newToken)
    setUser(newUser)

    return { token: newToken, user: newUser }
  }
  
  // Mantener axios con header Authorization sincronizado al token
  useEffect(() => {
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`
    else delete axios.defaults.headers.common.Authorization
  }, [token])

  async function logout() {
    try { await axios.post(`${AUTH_BASE}/auth/logout`, {}, { headers: makeAuthHeader(token) }) } catch {}
    setToken('')
    setUser(null)
    setExpiresAt(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_exp')
  }

  async function logoutFetch() {
    try {
      await fetch(`${AUTH_BASE}/auth/logout`, { method: 'POST', headers: makeAuthHeader(token) })
    } catch {}

    setToken('')
    setUser(null)
    setExpiresAt(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_exp')
  }

  async function refreshAxios() {
    const { data } = await axios.post(`${AUTH_BASE}/auth/refresh_token`, {}, { headers: makeAuthHeader(token) }) 
    const newToken = data?.authToken || data?.token || data?.jwt || ''
    setToken(newToken)
    return newToken
  }

  async function refreshFetch() {
    const res = await fetch(`${AUTH_BASE}/auth/refresh_token`, { method: 'POST', headers: makeAuthHeader(token) })
    if (!res.ok) throw new Error(`Refresh falló: ${res.status}`)
    const data = await res.json()
    const newToken = data?.authToken || data?.token || data?.jwt || ''
    setToken(newToken)
    return newToken
  }

  useEffect(() => {
    if (!expiresAt) return
    const MARGIN_MS = 2 * 60 * 1000
    const remaining = expiresAt - Date.now()
    const delay = Math.max(remaining - MARGIN_MS, 0)
    const id = setTimeout(async () => {
      const ok = window.confirm('Tu sesión está por expirar. ¿Deseas continuar y renovar el token?')
      if (ok) {
        try {
          await refreshAxios()
        } catch {
          try {
            await refreshFetch()
          } catch (e) {
            alert('No fue posible renovar el token. Se cerrará la sesión.')
            await logout()
          }
        }
      }
    }, delay)
    return () => clearTimeout(id)
  }, [expiresAt])

  const value = useMemo(() => ({
    token,
    user,
    expiresAt,
    setToken,
    setUser,
    login,
    logout,
    logoutFetch,
  }), [token, user, expiresAt])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}