import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { ApiResponse, Session } from '@/common/types'
import { SESSION_COOKIE, createSession, verifySession, tokenHash } from '@/common/server/session'
import { validateLoginRole } from '@/common/utils/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const backend = 'https://api.ourhostel.in/api/v1/auth/login'
function json(body: unknown, status = 200) {
 return NextResponse.json(body, {status, headers: {'Cache-Control': 'private, no-store'}})
}
function sameOrigin(request: NextRequest): boolean {
 const origin = request.headers.get('origin')
 const host = request.headers.get('host')
 if (!origin || !host) return false
 try {
  const source = new URL(origin)
  return source.host === host && source.protocol === request.nextUrl.protocol
 } catch { return false }
}
function cookieOptions(request: NextRequest) {
 return {httpOnly: true, sameSite: 'lax' as const, secure: request.nextUrl.protocol === 'https:', path: '/'}
}
export async function POST(request: NextRequest) {
 if (!sameOrigin(request)) return json({message: 'Invalid request origin.'}, 403)
 let payload: unknown
 try { payload = await request.json() } catch { return json({message: 'A JSON login request is required.'}, 400) }
 if (!payload || typeof payload !== 'object') return json({message: 'Email and password are required.'}, 422)
 const {email, password} = payload as {email?: unknown; password?: unknown}
 const portal = request.headers.get('x-login-role')
 if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password
  || (portal !== 'STUDENT' && portal !== 'HOSTEL_ADMIN')) return json({message: 'Choose a portal and enter your email and password.'}, 422)
 try {
  const upstream = await fetch(backend, {
   method: 'POST', headers: {'Content-Type': 'application/json'},
   body: JSON.stringify({email: email.trim(), password}), cache: 'no-store',
   signal: AbortSignal.timeout(20000),
  })
  const result = await upstream.json() as ApiResponse<Session>
  if (!upstream.ok) return json(result, upstream.status)
  if (result.status !== 'success' || !result.data?.user || !result.data?.token) return json({message: 'The backend returned an incomplete login response.'}, 502)
  try { validateLoginRole(result.data.user.role, portal) } catch (error) {
   return json({message: error instanceof Error ? error.message : 'Account role does not match the selected portal.'}, 403)
  }
  const session = createSession(result.data)
  const response = json(result)
  response.cookies.set(SESSION_COOKIE, session.value, {...cookieOptions(request), expires: session.expires})
  return response
 } catch {
  return json({message: 'Unable to establish a verified session. Please try again.'}, 502)
 }
}
export async function GET(request: NextRequest) {
 const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value)
 const authorization = request.headers.get('authorization') || ''
 const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
 if (!session || !token || tokenHash(token) !== session.tokenHash) return json({message: 'Sign in again to verify your session.'}, 401)
 return json({user: session.user})
}
export async function DELETE(request: NextRequest) {
 if (!sameOrigin(request)) return json({message: 'Invalid request origin.'}, 403)
 const response = json({message: 'Signed out.'})
 response.cookies.set(SESSION_COOKIE, '', {...cookieOptions(request), maxAge: 0})
 return response
}
