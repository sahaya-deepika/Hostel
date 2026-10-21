import {useEffect,useState} from 'react'
import {get,errorText} from '../services/api'
import type { DateValue, Resource } from '../types'
export function useResource<T, P = undefined>(path: ((params: P) => Promise<T>) | string, params?: P): Resource<T> {
 const [state,setState]=useState<Omit<Resource<T>, 'reload'>>({loading:true,data:null,error:''})
 const [version,setVersion]=useState(0)
 const key=JSON.stringify(params)
 useEffect(()=>{
  let active=true
  setState(s=>({...s,loading:true,error:''}))
  const parsed=JSON.parse(key||'null') as P
  const request=typeof path === 'function' ? path(parsed) : get<T>(path,parsed)
  request.then(r=>{if(active)setState({loading:false,data:r,error:''})}).catch((e: unknown)=>{if(active)setState({loading:false,data:null,error:errorText(e)})})
  return()=>{active=false}
 },[path,key,version])
 return {...state,reload:()=>setVersion(v=>v+1)}
}
export const dateText=(v?: DateValue | null)=>v?new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'?'
export const iso=(v: DateValue)=>new Date(v).toISOString()
export function localDateTime(value?: DateValue | null){if(!value)return "";const date=new Date(value);return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)}
