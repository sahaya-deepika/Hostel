import { requireRole } from '@/common/server/requireRole'
import type { ChildrenProps } from '@/common/types'
import ProtectedRoute from '../../common/components/ProtectedRoute'
import Layout from '../../user/layouts/StudentLayout'
export default async function RoleLayout({children}: ChildrenProps){await requireRole('STUDENT');return <ProtectedRoute allowedRoles={['STUDENT']}><Layout>{children}</Layout></ProtectedRoute>}
