import { requireRole } from '@/common/server/requireRole'
import type { ChildrenProps } from '@/common/types'
import '../../admin/styles/dashboard.css'
import ProtectedRoute from '../../common/components/ProtectedRoute'
import Layout from '../../admin/layouts/AdminLayout'
export default async function RoleLayout({children}: ChildrenProps){await requireRole('HOSTEL_ADMIN');return <ProtectedRoute allowedRoles={['HOSTEL_ADMIN']}><Layout>{children}</Layout></ProtectedRoute>}
