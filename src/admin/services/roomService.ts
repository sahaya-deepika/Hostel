import type { Room, ApiResponse, EntityId, FormValues } from '../../common/types'
import { get, send } from '../../common/services/api'
export const roomService = {
  // Both documented room query filters are broken and deliberately omitted.
  list: () => get<ApiResponse<Room[]>>('/rooms'),
  details: (id: EntityId) => get<ApiResponse<Room>>('/rooms/' + id),
  create: (payload: FormValues) => send<Room>('post', '/rooms', payload),
  update: (id: EntityId, payload: FormValues) => send<Room>('patch', '/rooms/' + id, payload),
}

