import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type Role = 'HOSTEL_ADMIN' | 'STUDENT'
export type EntityId = number | string
export type DateValue = string | number | Date
export interface User { id: EntityId; email: string; status: string; role: Role }
export interface Session { user: User; token: string }
export interface ChildrenProps { children: ReactNode }
export type NavigationItem = [icon: LucideIcon, label: string, to: string]
export interface ApiResponse<T> { status: string; message: string; data: T; meta?: { page: number; totalPages: number } }
export type FormValue = string | number | boolean | null | undefined
export type FormValues = Record<string, FormValue>
export interface Department { id: number; departmentName: string }
export interface Student {
 id: number; studentName: string; email: string; rollNumber: string; roomId: number | null;
 contactNumber: string; parentMobileNumber: string; departmentId: number; studentImageKey?: string; studentImageUrl?: string;
 room?: { roomNumber: string }
}
export interface Room {
 id: number; roomNumber: string; hostelId: number; occupied: number; capacity: number; remaining: number;
 _count?: { studentProfiles: number }
}
export interface HostelEvent {
 id: number; eventName: string; eventDescription: string; startingAt: string; endingAt: string;
 isActive: boolean; eventLink?: string; eventImageKey?: string; contactPersonName?: string; contactPersonPhone?: string
}
export type LeaveStatus = 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export interface Leave {
 id: number; studentId: number; leaveReason: string; fromDate: string; toDate: string;
 createdAt: string; status: LeaveStatus; rejectionReason?: string
}
export interface AttendanceSummary {
 totalStudentsOfTheHostel: number; totalStudentsWithatleastOnePresentDuringDateFilter: number;
 completelyAbsentStudentsCountDuringDates: number
}
export interface AttendanceCounts { total: number; present: number; absent: number; rate: number | null }
export interface AttendanceDay { date: string; summary: AttendanceSummary | null | undefined; error: string | null }
export interface AttendanceRecord {
 id?: number; student?: Student; studentName?: string; rollNumber?: string; roomNumber?: string;
 attendanceDate: string; reportedTime?: string; absentDates?: string[]; faceMatchingPercentage?: number;
 isLocatedWithinHostelRadius?: boolean; locationDeviationFromHostel?: number;
 contactNumber?: string; parentMobileNumber?: string; department?: string
}
export interface AttendanceReport { summary: AttendanceSummary; attendanceRecords: AttendanceRecord[] }
export interface StudentHome { canMarkAttendance: boolean; announcementsData: unknown[] }
export interface AttendanceQuery {
 page: number; pageSize: number; status: string; date?: string; fromDate?: string; toDate?: string
}
export interface Resource<T> { loading: boolean; data: T | null; error: string; reload: () => void }
