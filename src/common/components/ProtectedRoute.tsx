'use client'
import type { ReactNode } from 'react'
import type { Role } from '../types'
import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '../utils/AuthContext'
import {dashboardPath} from '../utils/session'
import Loader from './Loader'
export default function ProtectedRoute({allowedRoles,children}: {allowedRoles: Role[]; children: ReactNode}){const {user,ready}=useAuth();const router=useRouter();const allowed=ready&&user&&allowedRoles.includes(user.role);useEffect(()=>{if(ready&&!allowed)router.replace(dashboardPath(user?.role))},[ready,allowed,user,router]);return allowed?children:<Loader/>}
