import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { Role, Session, User } from '../types'

export const SESSION_COOKIE = 'ourhostel-session'
const MAX_AGE_SECONDS = 8 * 60 * 60
interface VerifiedSession { user: User; tokenHash: string; expiresAt: number }
function secret(): string {
 const value = process.env.AUTH_SESSION_SECRET
 if (!value || value.length < 32) throw new Error('AUTH_SESSION_SECRET must contain at least 32 characters.')
 return value
}
function signature(payload: string): Buffer {
 return createHmac('sha256', secret()).update(payload).digest()
}
export function tokenHash(token: string): string {
 return createHash('sha256').update(token).digest('hex')
}
function validUser(value: unknown): value is User {
 if (!value || typeof value !== 'object') return false
 const user = value as Partial<User>
 return (typeof user.id === 'number' || typeof user.id === 'string')
  && typeof user.email === 'string' && typeof user.status === 'string'
  && user.status === 'ACTIVE'
  && (user.role === 'HOSTEL_ADMIN' || user.role === 'STUDENT')
}
export function sessionExpiry(token: string, now = Date.now()): number {
 const maximum = now + MAX_AGE_SECONDS * 1000
 // The backend token's unverified exp can only SHORTEN the server session.
 // Neither decoded JWT roles nor any other client-supplied claims grant access.
 try {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
  if (typeof payload.exp === 'number' && Number.isFinite(payload.exp)) return Math.min(maximum, payload.exp * 1000)
 } catch { /* The existing API can also return opaque bearer tokens. */ }
 return maximum
}
/** Only call after a successful server-to-backend credential exchange. */
export function createSession(session: Session, now = Date.now()): { value: string; expires: Date } {
 if (!validUser(session.user) || typeof session.token !== 'string' || !session.token) throw new Error('The backend returned an invalid or inactive session.')
 const expiresAt = sessionExpiry(session.token, now)
 if (expiresAt <= now) throw new Error('The backend returned an expired session.')
 const payload = Buffer.from(JSON.stringify({user: session.user, tokenHash: tokenHash(session.token), expiresAt})).toString('base64url')
 return {value: payload + '.' + signature(payload).toString('base64url'), expires: new Date(expiresAt)}
}
export function verifySession(cookie?: string, now = Date.now()): VerifiedSession | null {
 if (!cookie || cookie.length > 8192) return null
 try {
  const [payload, supplied, extra] = cookie.split('.')
  if (!payload || !supplied || extra) return null
  const actual = Buffer.from(supplied, 'base64url'), expected = signature(payload)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as VerifiedSession
  if (!validUser(session.user) || !Number.isFinite(session.expiresAt) || session.expiresAt <= now
   || typeof session.tokenHash !== 'string' || !/^[a-f0-9]{64}$/.test(session.tokenHash)) return null
  return session
 } catch { return null }
}
export function protectedRouteRedirect(pathname: string, session: VerifiedSession | null): string | null {
 const role: Role | null = pathname === '/admin' || pathname.startsWith('/admin/') ? 'HOSTEL_ADMIN'
  : pathname === '/student' || pathname.startsWith('/student/') ? 'STUDENT' : null
 if (!role) return null
 if (!session) return '/login'
 if (session.user.role !== role) return session.user.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard'
 return null
}
