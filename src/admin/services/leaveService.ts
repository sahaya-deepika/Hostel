import type { Leave, ApiResponse, EntityId, FormValues } from '../../common/types'
import { get, send } from '../../common/services/api'
export const leaveService = {
  list: () => get<ApiResponse<Leave[]>>('/leave_applications'), // HOSTEL_ADMIN only
  details: (id: EntityId) => get<ApiResponse<Leave>>('/leave_applications/' + id), // HOSTEL_ADMIN only
  review: (id: EntityId, payload: FormValues) => send<Leave>('patch', '/leave_applications/' + id + '/review', payload),
}
