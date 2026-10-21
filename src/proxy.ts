import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession, protectedRouteRedirect } from './common/server/session'

export function proxy(request: NextRequest) {
 const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value)
 const destination = protectedRouteRedirect(request.nextUrl.pathname, session)
 const response = destination ? NextResponse.redirect(new URL(destination, request.url)) : NextResponse.next()
 response.headers.set('Cache-Control', 'private, no-store')
 return response
}
export const config = { matcher: ['/admin/:path*', '/student/:path*'] }
