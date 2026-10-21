'use client'
import type { ChildrenProps, Session, User } from '../types'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { clearSession } from './session'

interface AuthState { user: User | null; ready: boolean; signIn: (session: Session) => void; signOut: () => Promise<void>; sessionError: string }
const AuthContext = createContext<AuthState | null>(null)
async function clearServerSession() {
 const response = await fetch('/api/auth/session', {method: 'DELETE', credentials: 'same-origin', cache: 'no-store'})
 if (!response.ok) throw new Error('Unable to clear the server session. Please retry signing out.')
}
export function AuthProvider({ children }: ChildrenProps) {
 const [user, setUser] = useState<User | null>(null)
 const [ready, setReady] = useState(false)
 const [sessionError, setSessionError] = useState('')
 const generation = useRef(0)
 useEffect(() => {
  let active = true
  const version = generation.current
  const token = sessionStorage.getItem('ourhostel-token')
  async function restore() {
   if (!token) { if (active) setReady(true); return }
   try {
    const response = await fetch('/api/auth/session', {headers: {Authorization: 'Bearer ' + token}, credentials: 'same-origin', cache: 'no-store'})
    if (!response.ok) throw new Error('Please sign in again to verify your session.')
    const session = await response.json() as {user: User}
    if (active && version === generation.current) {
     // The stored JSON role is never used as authentication evidence.
     sessionStorage.setItem('ourhostel-user', JSON.stringify(session.user))
     setUser(session.user)
    }
   } catch {
    if (active && version === generation.current) {
     clearSession()
     setUser(null)
     setSessionError('Your session could not be verified. Please sign in again.')
    }
   } finally { if (active && version === generation.current) setReady(true) }
  }
  void restore()
  function expired() {
   generation.current++
   clearSession()
   setUser(null)
   setReady(true)
   setSessionError('Your session has expired. Please sign in again.')
   void clearServerSession().catch(() => {})
  }
  window.addEventListener('session-expired', expired)
  return () => {active = false; window.removeEventListener('session-expired', expired)}
 }, [])
 function signIn({ user, token }: Session) {
  generation.current++
  sessionStorage.setItem('ourhostel-token', token)
  sessionStorage.setItem('ourhostel-user', JSON.stringify(user))
  setSessionError('')
  setUser(user)
  setReady(true)
 }
 async function signOut() {
  try {
   await clearServerSession()
   generation.current++
   clearSession()
   setUser(null)
   setSessionError('')
   // Discard cached protected RSC payloads as well as client component state.
   window.location.replace('/login')
  } catch (error) {
   setSessionError(error instanceof Error ? error.message : 'Sign out failed. Please retry.')
   window.alert('Sign out failed. Please check your connection and try again.')
  }
 }
 return <AuthContext.Provider value={{user, ready, signIn, signOut, sessionError}}>{children}</AuthContext.Provider>
}
export function useAuth() {
 const context = useContext(AuthContext)
 if (!context) throw new Error('AuthProvider is required.')
 return context
}
