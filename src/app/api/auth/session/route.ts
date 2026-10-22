import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession, tokenHash } from '@/common/server/session'
import { json, sameOrigin, cookieOptions } from '@/common/server/authHttp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
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
