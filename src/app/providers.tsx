'use client'
import type { ChildrenProps } from '@/common/types'
import {AuthProvider} from '../common/utils/AuthContext'
export default function Providers({children}: ChildrenProps){return <AuthProvider>{children}</AuthProvider>}
