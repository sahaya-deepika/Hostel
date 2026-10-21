import type { ApiResponse } from '../types'
import axios from 'axios'
import {validateRequest} from './contract'
export const BASE_URL = 'https://api.ourhostel.in/api/v1'
export const api = axios.create({baseURL: BASE_URL, headers:{'Content-Type':'application/json'}, timeout:20000})
api.interceptors.request.use(config => {
 let user
 try{user=JSON.parse(sessionStorage.getItem('ourhostel-user') || 'null')}catch{user=null}
 const operation=validateRequest(config.method,config.url,user?.role,config.data,config.params)
 const token=sessionStorage.getItem('ourhostel-token')
 if(operation[2].length&&token)config.headers.Authorization=`Bearer ${token}`
 return config
})
api.interceptors.response.use(response=>{
 if(response.data?.status==='failure')return Promise.reject(new Error(response.data.message))
 return response
},error=>{
 if(error.response?.status===401){
  sessionStorage.removeItem('ourhostel-token')
  sessionStorage.removeItem('ourhostel-user')
  window.dispatchEvent(new Event('session-expired'))
 }
 return Promise.reject(error)
})
export function errorText(error: unknown): string {
 const e = error as {response?: {data?: {message?: string; errors?: string | Record<string, unknown>}}; code?: string; message?: string} | null
 const d=e?.response?.data
 const details=typeof d?.errors==='string'?d.errors:Object.entries(d?.errors||{}).map(([k,v])=>`${k}: ${v}`).join(' ? ')
 if(e?.code==='ERR_NETWORK')return 'The API could not be reached from this browser. Check your connection and the backend CORS configuration for this site?s origin.'
 return [typeof d==='object'?d?.message:null,details].filter(Boolean).join(' ? ')||e?.message||'Request failed. Please try again.'
}
export const get=async<T>(path: string,params?: unknown): Promise<T>=>(await api.get<T>(path,{params})).data
export async function send<T = unknown>(method: string,path: string,data?: unknown): Promise<ApiResponse<T>> {
 const result=(await api.request<ApiResponse<T>>({method,url:path,data})).data
 if(result.status==='success')window.dispatchEvent(new CustomEvent('api-success',{detail:result.message}))
 return result
}
