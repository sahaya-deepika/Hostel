import type { Student, Department, ApiResponse, EntityId, FormValues } from '../../common/types'
import { get, send } from '../../common/services/api'
export const studentService = {
  list: () => get<ApiResponse<Student[]>>('/students'),
  details: (id: EntityId) => get<ApiResponse<Student>>('/students/' + id),
  create: (payload: FormValues) => send<Student>('post', '/students', payload),
  update: (id: EntityId, payload: FormValues) => send<Student>('patch', '/students/' + id, payload),
  departments: () => get<ApiResponse<Department[]>>('/students/departments'),
}
