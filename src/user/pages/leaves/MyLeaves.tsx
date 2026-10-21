import {Link} from '@/common/utils/navigation'
import LeaveHistoryNotice from '../../components/LeaveHistoryNotice'
import {useAuth} from '../../../common/utils/AuthContext'
import {readLeaveSession} from '../../utils/leaveSession'
import {dateText} from '../../../common/utils/hooks'
export default function MyLeaves(){
 const {user}=useAuth()
 const records=readLeaveSession(user!.id)
 return <><LeaveHistoryNotice/><div className="toolbar"><p className="muted">A little time away, with everything in order.</p><Link className="primary" to="/student/leaves/new">+ Apply for leave</Link></div>
  <section className="panel"><h2>Your requests in this session</h2>{!records.length?<div className="state">No requests have been created in this session.</div>:records.map(leave=><div className="leave-row" key={leave.id}>
   <div><span className="badge">{leave.status.replaceAll('_',' ')}</span><h3>{leave.leaveReason}</h3><p className="muted">{dateText(leave.fromDate)} – {dateText(leave.toDate)} · Request #{leave.id}</p>{leave.rejectionReason&&<p>{leave.rejectionReason}</p>}</div>
   <Link className="text-link" to={'/student/leaves/'+leave.id}>Details & actions →</Link>
  </div>)}</section>
 </>
}

