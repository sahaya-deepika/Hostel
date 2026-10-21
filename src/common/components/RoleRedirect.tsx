'use client'
import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '../utils/AuthContext'
import {dashboardPath} from '../utils/session'
import Loader from './Loader'
export default function RoleRedirect({section}: {section?: string}){const {user,ready}=useAuth();const router=useRouter();useEffect(()=>{if(!ready)return;const path=section&&user&&(!['students','rooms'].includes(section)||user.role==='HOSTEL_ADMIN')?(user.role==='HOSTEL_ADMIN'?'/admin/':'/student/')+section:dashboardPath(user?.role);router.replace(path)},[ready,user,router,section]);return <Loader/>}
