export function dashboardPath(role) {
  if (role === 'HOSTEL_ADMIN') return '/admin/dashboard'
  if (role === 'STUDENT') return '/student/dashboard'
  return '/login'
}
export function readSession() {
  try {
    const user = JSON.parse(sessionStorage.getItem('ourhostel-user'))
    const token = sessionStorage.getItem('ourhostel-token')
    return user && token ? user : null
  } catch { return null }
}
export function clearSession() {
  sessionStorage.removeItem('ourhostel-token')
  sessionStorage.removeItem('ourhostel-user')
}


