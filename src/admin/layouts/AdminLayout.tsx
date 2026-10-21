'use client'
import type { ChildrenProps, NavigationItem } from '@/common/types'
import AdminWorkspaceTools from '../components/AdminWorkspaceTools'
import {House,Users,BedDouble,ClipboardCheck,FileText,CalendarDays} from 'lucide-react'
import WorkspaceLayout from '../../common/layouts/WorkspaceLayout'
const navigation: NavigationItem[]=[[House,'Overview','/admin/dashboard'],[Users,'Students','/admin/students'],[BedDouble,'Rooms','/admin/rooms'],[ClipboardCheck,'Attendance reports','/admin/attendance'],[FileText,'Leave applications','/admin/leaves'],[CalendarDays,'Upcoming events','/admin/events']]
export default function AdminLayout({children}: ChildrenProps){return <WorkspaceLayout admin nav={navigation} headerTools={<AdminWorkspaceTools nav={navigation}/>}>{children}</WorkspaceLayout>}

