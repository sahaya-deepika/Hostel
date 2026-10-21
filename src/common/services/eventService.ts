import type { HostelEvent, ApiResponse, EntityId, FormValues } from '../types'
import { get } from './api'
export const eventService = {
  list: () => get<ApiResponse<HostelEvent[]>>('/upcoming_events'),
  details: (id: EntityId) => get<ApiResponse<HostelEvent>>('/upcoming_events/' + id),
}
