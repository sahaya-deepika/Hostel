import type { Role, User } from '../types'
export function dashboardPath(role?: Role) {
  if (role === 'HOSTEL_ADMIN') return '/admin/dashboard'
  if (role === 'STUDENT') return '/student/dashboard'
  return '/login'
}
export function readSession(): User | null {
  try {
    const user = JSON.parse(sessionStorage.getItem('ourhostel-user') || 'null') as User | null
    const token = sessionStorage.getItem('ourhostel-token')
    return user && token ? user : null
  } catch { return null }
}
export function clearSession() {
  sessionStorage.removeItem('ourhostel-token')
  sessionStorage.removeItem('ourhostel-user')
}


/** The UI selection never grants a role; the server response must match it. */
export function validateLoginRole(actualRole: string, selectedRole: Role): void {
 if (actualRole !== 'STUDENT' && actualRole !== 'HOSTEL_ADMIN') {
  throw new Error('Your role is not supported by the documented application APIs.')
 }
 if (actualRole !== selectedRole) {
  throw new Error(actualRole === 'HOSTEL_ADMIN'
   ? 'This is an admin account. Select Admin and log in again.'
   : 'This is a user account. Select User and log in again.')
 }
}
