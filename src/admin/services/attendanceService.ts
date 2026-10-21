import type { AttendanceReport, AttendanceQuery, ApiResponse, EntityId, FormValues } from '../../common/types'
import { get } from '../../common/services/api'
export const attendanceService = {
  report: (params: AttendanceQuery) => get<ApiResponse<AttendanceReport>>('/attendance_records', params),
}
