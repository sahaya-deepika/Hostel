import {useState} from 'react'
import {Link,useParams} from '@/common/utils/navigation'
import {Notice,Record} from '../../../common/components/UI'
import Button from '../../../common/components/Button'
import LeaveForm from '../../components/LeaveForm'
import LeaveHistoryNotice from '../../components/LeaveHistoryNotice'
import {useAuth} from '../../../common/utils/AuthContext'
import {findSessionLeave,saveLeaveSession} from '../../utils/leaveSession'
import {leaveService} from '../../services/leaveService'
import {errorText} from '../../../common/services/api'
export default function LeaveDetails(){
 const {id}=useParams()
 const {user}=useAuth()
 const [leave,setLeave]=useState(()=>findSessionLeave(user!.id,id))
 const [editing,setEditing]=useState(false)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function cancel(){
  setBusy(true);setError('')
  try{const response=await leaveService.cancel(leave!.id);saveLeaveSession(user!.id,response.data);setLeave(response.data);setEditing(false)}
  catch(e){setError(errorText(e))}finally{setBusy(false)}
 }
 return <section className="panel"><h2>Leave request #{id}</h2><LeaveHistoryNotice/>
  {!leave?<Notice>This request is not available in this browser session. Its detail cannot be fetched until the student detail endpoint is implemented.</Notice>:<>
   <Record data={leave}/>{error&&<div className="error message" role="alert">{error}</div>}
   {leave.status==='WAITING_FOR_APPROVAL'&&<div className="toolbar"><Button onClick={()=>setEditing(!editing)}>Edit request</Button><Button disabled={busy} onClick={cancel}>{busy?'Cancelling…':'Cancel request'}</Button></div>}
   {editing&&leave.status==='WAITING_FOR_APPROVAL'&&<LeaveForm leave={leave}/>}
  </>}
  <Link className="text-link" to="/student/leaves">← Session requests</Link>
 </section>
}

