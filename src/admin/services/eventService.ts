import type { HostelEvent, ApiResponse, EntityId, FormValues } from '../../common/types'
import { send } from '../../common/services/api'
export const eventService = {
  create: (payload: FormValues) => send<HostelEvent>('post', '/upcoming_events', payload),
  update: (id: EntityId, payload: FormValues) => send<HostelEvent>('patch', '/upcoming_events/' + id, payload),
}
