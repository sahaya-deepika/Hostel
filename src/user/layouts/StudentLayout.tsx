'use client'
import type { ChildrenProps, NavigationItem } from '@/common/types'
import {House,ClipboardCheck,FileText,CalendarDays} from 'lucide-react'
import '../styles/dashboard.css'
import WorkspaceLayout from '../../common/layouts/WorkspaceLayout'
const navigation: NavigationItem[]=[[House,'Overview','/student/dashboard'],[ClipboardCheck,'My attendance','/student/attendance'],[FileText,'Leave applications','/student/leaves'],[CalendarDays,'Upcoming events','/student/events']]
export default function StudentLayout({children}: ChildrenProps){return <WorkspaceLayout nav={navigation}>{children}</WorkspaceLayout>}

