import type { LucideIcon } from 'lucide-react'
import {Link} from '@/common/utils/navigation'
import {ArrowUpRight,CalendarDays,ClipboardCheck,FileText,Megaphone} from 'lucide-react'
import {useResource,dateText} from '../../common/utils/hooks'
import {studentService} from '../services/studentService'
import {eventService} from '../../common/services/eventService'
import {State,Record} from '../../common/components/UI'
import {useAuth} from '../../common/utils/AuthContext'
import {readLeaveSession} from '../utils/leaveSession'
import campusImage from '../../common/assets/login1.png'
const links: [LucideIcon, string, string, string][]=[
 [ClipboardCheck,'Mark Attendance','View your attendance availability','/student/attendance'],
 [FileText,'Apply for Leave','Submit a new leave application','/student/leaves/new'],
 [CalendarDays,'Upcoming Events','Check hostel events and activities','/student/events'],
 [Megaphone,'Announcements','Latest announcements and updates','#announcements'],
]
export default function StudentDashboardContent(){
 const {user}=useAuth()
 const requests=user?readLeaveSession(user.id):[]
 const recentRequests=[...requests].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,2)
 const resource=useResource(studentService.home)
 const events=useResource(eventService.list)
 const upcoming=(events.data?.data||[]).filter(event=>event.isActive&&new Date(event.endingAt)>=new Date()).sort((a,b)=>new Date(a.startingAt).getTime()-new Date(b.startingAt).getTime()).slice(0,2)
 return <div className="dashboard-content student-dashboard">
  <section className="dashboard-welcome"><div className="dashboard-welcome-copy"><span className="dashboard-kicker">LIVE · LEARN · BELONG</span><h2>Your hostel.<br/><span>Your second home.</span></h2><p>Stay connected, stay informed, and make the most of your hostel life.</p></div><img src={campusImage.src} className="dashboard-campus-image" alt="OurHostel campus with landscaped gardens"/></section>
  <div className="dashboard-actions">{links.map(([Icon,title,description,to])=><Link className="quick-card" key={to} to={to}><span className="tile-icon"><Icon size={29} strokeWidth={1.6}/></span><span className="corner"><ArrowUpRight size={17}/></span><h3>{title}</h3><p>{description}</p></Link>)}</div>
  <div className="dashboard-summary-grid">
   <section className="panel"><div className="section-head"><h2><ClipboardCheck size={22}/>Attendance</h2></div><State resource={resource}><div className={`dashboard-attendance-flag${resource.data?.data?.canMarkAttendance?' available':''}`}><ClipboardCheck size={34}/><strong>{resource.data?.data?.canMarkAttendance?'Ready to check in':'Check-in unavailable'}</strong></div><p className="muted">{resource.data?.data?.canMarkAttendance?'Attendance marking is currently open for you.':'Attendance marking is currently closed. View attendance for more details.'}</p><Link className="text-link" to="/student/attendance">View attendance <ArrowUpRight size={16}/></Link></State></section>
   <section className="panel dashboard-leave-panel">
    <div className="section-head"><h2><FileText size={22}/>My Leave Requests</h2><Link className="text-link" to="/student/leaves">View all</Link></div>
    {recentRequests.length?<ul className="student-recent-leaves">{recentRequests.map(leave=><li key={leave.id}><Link to={'/student/leaves/'+leave.id}><span><strong>{leave.leaveReason}</strong><small>{dateText(leave.fromDate)} ? {dateText(leave.toDate)}</small></span><span className="badge">{leave.status.replaceAll('_',' ')}</span></Link></li>)}</ul>:<><span className="dashboard-leave-icon"><FileText size={32} strokeWidth={1.4}/></span><h3>Plan your time away.</h3><p className="muted">No leave requests saved in this tab yet.</p></>}
    <p className="student-session-note">Requests shown are saved in this tab. Complete leave history is not available yet.</p>
    <Link className="text-link" to="/student/leaves/new">Apply for leave <ArrowUpRight size={16}/></Link>
   </section>
   <section className="panel dashboard-events"><div className="section-head"><h2><CalendarDays size={22}/>Upcoming Events</h2><Link className="text-link" to="/student/events">View all</Link></div><State resource={events} empty={!upcoming.length}><div className="dashboard-event-list">{upcoming.map(event=><Link key={event.id} to={'/student/events/'+event.id} className="dashboard-event-row"><span className="dashboard-event-date"><strong>{new Date(event.startingAt).toLocaleDateString('en-IN',{day:'2-digit'})}</strong><small>{new Date(event.startingAt).toLocaleDateString('en-IN',{month:'short'})}</small></span><span><h3>{event.eventName}</h3><p>{dateText(event.startingAt)}</p></span><ArrowUpRight size={16}/></Link>)}</div></State></section>
  </div>
  <section id="announcements" tabIndex={-1} className="panel dashboard-announcements"><div className="section-head"><h2><Megaphone size={21}/>Announcements</h2><span className="badge">Noticeboard</span></div><State resource={resource}>{resource.data?.data?.announcementsData?.length?<details><summary>View {resource.data.data.announcementsData.length} announcements</summary>{resource.data.data.announcementsData.map((item,index)=><article key={index}>{typeof item==='object'&&item!==null?<Record data={item}/>:<p>{String(item)}</p>}</article>)}</details>:<p className="muted">You’re all caught up. No announcements at the moment.</p>}</State></section>
 </div>
}
