import type { StudentHome, ApiResponse, EntityId, FormValues } from '../../common/types'
import { get } from '../../common/services/api'
export const studentService = {
  home: () => get<ApiResponse<StudentHome>>('/students/home'),
}
