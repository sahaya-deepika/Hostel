import type { Student, FormValues } from '@/common/types'
import {useNavigate} from '@/common/utils/navigation'
import {DataForm,Notice,State,field} from '../../common/components/UI'
import {studentService} from '@/admin/services/studentService'
import {useResource} from '../../common/utils/hooks'
export default function StudentForm({student={}}: {student?: Partial<Student>}) {
 const navigate=useNavigate()
 const departments=useResource(studentService.departments)
 const editing=Boolean(student.id)
 const fields=[
  field('email','Email','email',!editing),
  field('studentName','Student name','text',!editing),
  field('contactNumber','Contact number','tel',!editing,{length:10}),
  field('parentMobileNumber','Parent mobile number','tel',!editing,{length:10}),
  {...field('departmentId','Department','number',!editing),options:(departments.data?.data||[]).map(d=>({value:d.id,label:d.departmentName}))},
  ...(!editing?[field('rollNumber','Roll number','text',true)]:[]),
  field('roomId','Room ID','number',false,{min:1,step:1}),
  field('studentImageKey','Existing profile image key','text',false,{hint:'Optional. Photo upload is unavailable.'}),
 ]
 return <section className="panel"><h2>{editing?'Edit student':'Add a student'}</h2>
  <Notice>New students receive an emailed setup link. Verify room and hostel IDs before assignment: backend room filtering is unreliable. Roll number updates are ignored by the backend.</Notice>
  <State resource={departments}>
   <DataForm fields={fields} initial={student} changedOnly={editing}
    action={editing?payload=>studentService.update(student.id!,payload):studentService.create}
    submitLabel={editing?'Update student':'Create student'} onSuccess={()=>navigate('/admin/students')}/>
  </State>
 </section>
}

