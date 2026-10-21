import {Link,useParams} from '@/common/utils/navigation'
import {Record,State} from '../../../common/components/UI'
import {studentService} from '@/admin/services/studentService'
import {useResource} from '../../../common/utils/hooks'
export default function StudentDetails(){
 const {id}=useParams()
 const r=useResource(studentService.details,id)
 const student=r.data?.data
 return <section className="panel"><div className="section-head"><h2>Student profile</h2><Link className="text-link" to={'/admin/students/'+id+'/edit'}>Edit student →</Link></div>
  <State resource={r}>{student?.studentImageUrl&&<img className="profile-image" src={student.studentImageUrl} alt={student.studentName}/>}<Record data={student}/></State>
  <Link className="text-link" to="/admin/students">← All students</Link>
 </section>
}

