import {Link} from '@/common/utils/navigation'
import {State} from '../../../common/components/UI'
import {leaveService} from '@/admin/services/leaveService'
import {useResource,dateText} from '../../../common/utils/hooks'
export default function LeaveList(){
 const r=useResource(leaveService.list)
 return <section className="panel"><div className="section-head"><h2>Leave applications</h2><span className="badge">Review & manage</span></div><State resource={r} empty={!r.data?.data?.length}>
  {r.data?.data?.map(leave=><div className="leave-row" key={leave.id}><div><span className="badge">{leave.status.replaceAll('_',' ')}</span><h3>{leave.leaveReason}</h3><p className="muted">Student #{leave.studentId} · {dateText(leave.fromDate)} – {dateText(leave.toDate)}</p></div><Link className="text-link" to={'/admin/leaves/'+leave.id}>{leave.status==='WAITING_FOR_APPROVAL'?'Review application':'View details'} →</Link></div>)}
 </State></section>
}

