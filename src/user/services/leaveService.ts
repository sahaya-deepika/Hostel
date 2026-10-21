import type { Leave, ApiResponse, EntityId, FormValues } from '../../common/types'
import { send } from '../../common/services/api'
export const leaveService = {
  create: (payload: FormValues) => send<Leave>('post', '/leave_applications', payload),
  update: (id: EntityId, payload: FormValues) => send<Leave>('patch', '/leave_applications/' + id, payload),
  cancel: (id: EntityId) => send<Leave>('patch', '/leave_applications/' + id + '/cancel'),
}
