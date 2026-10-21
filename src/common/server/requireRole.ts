import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Role } from '../types'
import { SESSION_COOKIE, verifySession, protectedRouteRedirect } from './session'

export async function requireRole(role: Role): Promise<void> {
 const session = verifySession((await cookies()).get(SESSION_COOKIE)?.value)
 const destination = protectedRouteRedirect(role === 'HOSTEL_ADMIN' ? '/admin' : '/student', session)
 if (destination) redirect(destination)
}
