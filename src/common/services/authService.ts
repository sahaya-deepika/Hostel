import axios from 'axios'
import type { Session, FormValues, Role } from '../types'
import { send } from './api'
export async function login({ email, password }: {email: string; password: string}, role: Role) {
  const {data: response} = await axios.post<import('../types').ApiResponse<Session>>('/api/auth/session', {email, password}, {headers: {'X-Login-Role': role}, timeout: 25000})
  if (response.status !== 'success' || !response.data?.token || !response.data?.user) {
    throw new Error('The server returned an incomplete login response.')
  }
  return response
}
export const setNewPassword = (payload: FormValues) => send('post', '/students/setup_new_password', payload)

