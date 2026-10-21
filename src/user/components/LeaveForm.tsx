import type { Leave, FormValues } from '@/common/types'
import {useNavigate} from '@/common/utils/navigation'
import {DataForm,field} from '../../common/components/UI'
import {leaveService} from '../services/leaveService'
import {useAuth} from '../../common/utils/AuthContext'
import {saveLeaveSession} from '../utils/leaveSession'
import {iso} from '../../common/utils/hooks'
export default function LeaveForm({leave={}}: {leave?: Partial<Leave>}){
 const {user}=useAuth()
 const navigate=useNavigate()
 const editing=Boolean(leave.id)
 const initial={...leave,fromDate:leave.fromDate?.slice(0,10),toDate:leave.toDate?.slice(0,10)}
 function transform(values: FormValues){
  if(!editing||values.fromDate||values.toDate){
   const from=values.fromDate||initial.fromDate
   const to=values.toDate||initial.toDate
   if(!from||!to||from>to)throw new Error('Provide both dates with the start on or before the end.')
   values.fromDate=iso(String(from))
   values.toDate=iso(String(to))
  }
  return values
 }
 return <DataForm fields={[field('leaveReason','Reason for leave','textarea',true),field('fromDate','From','date',true),field('toDate','To','date',true)]}
  initial={initial} changedOnly={editing} transform={transform}
  action={editing?payload=>leaveService.update(leave.id!,payload):leaveService.create}
  submitLabel={editing?'Update request':'Send leave request'} onSuccess={r=>{saveLeaveSession(user!.id,r.data);navigate('/student/leaves')}}/>
}

