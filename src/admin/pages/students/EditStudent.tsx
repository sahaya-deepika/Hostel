import {useParams} from '@/common/utils/navigation'
import StudentForm from '../../components/StudentForm'
import {State} from '../../../common/components/UI'
import {studentService} from '@/admin/services/studentService'
import {useResource} from '../../../common/utils/hooks'
export default function EditStudent(){const {id}=useParams();const r=useResource(studentService.details,id);return <State resource={r}><StudentForm key={id} student={r.data?.data}/></State>}

