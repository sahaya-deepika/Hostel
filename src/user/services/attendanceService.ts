import type { AttendanceRecord, ApiResponse, EntityId, FormValues } from '../../common/types'
import { send } from '../../common/services/api'
export const attendanceService = {
  mark: (payload: FormValues) => send<AttendanceRecord>('post', '/attendance_records', payload),
}
