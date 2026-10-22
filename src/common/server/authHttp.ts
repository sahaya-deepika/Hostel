import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function json(body: unknown, status = 200) {
 return NextResponse.json(body, {status, headers: {'Cache-Control': 'private, no-store'}})
}
export function sameOrigin(request: NextRequest): boolean {
 const origin = request.headers.get('origin')
 const host = request.headers.get('host')
 if (!origin || !host) return false
 try {
  const source = new URL(origin)
  return source.host === host && source.protocol === request.nextUrl.protocol
 } catch { return false }
}
export function cookieOptions(request: NextRequest) {
 return {httpOnly: true, sameSite: 'lax' as const, secure: request.nextUrl.protocol === 'https:', path: '/'}
}
