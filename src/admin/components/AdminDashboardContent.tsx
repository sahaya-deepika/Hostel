'use client'
import type { LucideIcon } from 'lucide-react'
import type { Resource, DateValue } from '@/common/types'
import {useMemo} from 'react'
import {Link} from '@/common/utils/navigation'
import {Users,BedDouble,ClipboardCheck,FileText,CalendarDays,ArrowUpRight,ArrowRight,Clock3,CheckCircle2,UserRound} from 'lucide-react'
import {useResource} from '../../common/utils/hooks'
import {studentService} from '@/admin/services/studentService'
import {roomService} from '@/admin/services/roomService'
import {leaveService} from '@/admin/services/leaveService'
import {eventService} from '../../common/services/eventService'
import {loadAttendanceTrend} from '../services/dashboardService'
import {attendanceSummary,attendancePieOption,attendanceLineOption,activeEvents,initials,leaveLabels} from '../utils/dashboardData'
import {State,Notice} from '../../common/components/UI'
import DashboardChart from './DashboardChart'
import campusImage from '../../common/assets/login1.png'

function ViewAll({to}: {to: string}){return <Link className="analytics-view-all" to={to}>View all <ArrowUpRight size={13}/></Link>}
function Stat({Icon,title,description,to,resource,value,suffix=''}: {Icon: LucideIcon; title: string; description: string; to: string; resource: Pick<Resource<unknown>, 'loading' | 'error'>; value?: number | null; suffix?: string}){return <Link className="analytics-stat" to={to}><span className="tile-icon"><Icon size={28} strokeWidth={1.6}/></span><div><strong className="analytics-stat-value" aria-label={resource.loading?'Loading':resource.error?'Unavailable':undefined}>{resource.loading?'…':resource.error?'—':value===null||value===undefined?'—':`${value}${suffix}`}</strong><h3>{title}</h3><p>{resource.error?'Temporarily unavailable':description}</p></div><span className="analytics-stat-arrow"><ArrowUpRight size={16}/></span></Link>}
function formatDate(value: DateValue,options: Intl.DateTimeFormatOptions){return new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Calcutta',...options}).format(new Date(value))}

export default function AdminDashboardContent(){
 const students=useResource(studentService.list),rooms=useResource(roomService.list),leaves=useResource(leaveService.list),events=useResource(eventService.list),trend=useResource(loadAttendanceTrend)
 const days=trend.data?.data||[]
 const current=days.at(-1)
 const summary=attendanceSummary(current?.summary)
 const today={...trend,error:trend.error||current?.error||(!trend.loading&&!summary?'Today’s attendance summary is unavailable.':'')}
 const upcoming=activeEvents(events.data?.data)
 const recent=[...(leaves.data?.data||[])].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,5)
 const studentNames=new Map((students.data?.data||[]).map(student=>[student.id,student.studentName]))
 const pie=useMemo(()=>summary?attendancePieOption(summary):null,[summary?.total,summary?.present,summary?.absent])
 const line=useMemo(()=>attendanceLineOption(trend.data?.data||[]),[trend.data])
 const lineHasData=days.some(day=>attendanceSummary(day.summary)!==null)
 return <div className="dashboard-content analytics-dashboard">
  <section className="dashboard-welcome analytics-banner"><div className="dashboard-welcome-copy"><span className="dashboard-kicker">LIVE · LEARN · BELONG</span><h2>Your hostel.<br/><span>Your second home.</span></h2><p>Care for your community, stay informed,<br/>and make every day run a little smoother.</p><Link className="analytics-explore" to="/admin/students">Explore Our Hostel <ArrowRight size={14}/></Link></div><img className="dashboard-campus-image" src={campusImage.src} alt="OurHostel campus at sunset"/><span className="analytics-banner-caption">Safe spaces.<br/>Brighter futures.</span><img className="analytics-banner-leaves" src="/images/image3.png" alt="" aria-hidden="true"/></section>
  <div className="analytics-stats">
   <Stat Icon={Users} title="Students" description="Profiles & room assignments" to="/admin/students" resource={students} value={students.data?.data?.length}/>
   <Stat Icon={BedDouble} title="Rooms" description="Rooms returned · verify hostel" to="/admin/rooms" resource={rooms} value={rooms.data?.data?.length}/>
   <Stat Icon={ClipboardCheck} title="Attendance" description="Today’s attendance reports" to="/admin/attendance" resource={today} value={summary?.rate} suffix="%"/>
   <Stat Icon={FileText} title="Leave Applications" description="Review student requests" to="/admin/leaves" resource={leaves} value={leaves.data?.data?.length}/>
   <Stat Icon={CalendarDays} title="Upcoming Events" description="Your hostel calendar" to="/admin/events" resource={events} value={upcoming.length}/>
  </div>
  <div className="analytics-panels">
   <section className="panel analytics-overview"><div className="section-head"><h2><ClipboardCheck size={21}/>Student Overview</h2><ViewAll to="/admin/students"/></div>
    <State resource={today} empty={summary?.total===0}><div className="analytics-attendance"><DashboardChart option={pie} className="analytics-donut" label={summary?`${summary.total} total students. Present today: ${summary.present}. Absent today: ${summary.absent}.`:'Attendance summary'}/><div className="analytics-attendance-numbers"><div className="present"><span><Users size={19}/></span><p><strong>{summary?.present}</strong><small>Present today</small><b>{summary?.rate}%</b></p></div><div className="absent"><span><CheckCircle2 size={19}/></span><p><strong>{summary?.absent}</strong><small>Absent today</small><b>{summary?.total?Math.round(summary.absent/summary.total*1000)/10:'—'}%</b></p></div></div></div></State>
    <div className="analytics-trend-title"><h3>Attendance · last 7 days</h3><span>Students present</span></div>
    <State resource={trend} empty={!lineHasData}><DashboardChart option={line} className="analytics-line" label="Daily number of students present over the last seven days"/><table className="sr-only"><caption>Daily attendance values</caption><thead><tr><th>Date</th><th>Present</th></tr></thead><tbody>{days.map(day=><tr key={day.date}><th>{day.date}</th><td>{attendanceSummary(day.summary)?.present??'Unavailable'}</td></tr>)}</tbody></table>{days.some(day=>!attendanceSummary(day.summary))&&<p className="analytics-data-note">Missing reports are shown as gaps.</p>}</State>
   </section>
   <section className="panel analytics-leaves"><div className="section-head"><h2><FileText size={21}/>Recent Leave Applications</h2><ViewAll to="/admin/leaves"/></div><State resource={leaves} empty={!recent.length}><div className="analytics-leave-list">{recent.map(leave=>{const name=studentNames.get(leave.studentId)||`Student #${leave.studentId}`;return <Link className="analytics-leave-row" key={leave.id} to={'/admin/leaves/'+leave.id}><span className="analytics-person" aria-hidden="true">{studentNames.has(leave.studentId)?initials(name):<UserRound size={17}/>}</span><span className="analytics-leave-person"><strong>{name}</strong><small>{leave.leaveReason}</small></span><span className={'analytics-status status-'+leave.status.toLowerCase()}>{leaveLabels[leave.status]||leave.status}</span><time dateTime={leave.createdAt}>{formatDate(leave.createdAt,{day:'2-digit',month:'short',year:'numeric'})}</time></Link>})}</div></State></section>
   <section className="panel analytics-events"><div className="section-head"><h2><CalendarDays size={21}/>Upcoming Events</h2><ViewAll to="/admin/events"/></div><State resource={events} empty={!upcoming.length}><div>{upcoming.slice(0,4).map(event=><Link key={event.id} className="analytics-event-row" to={'/admin/events/'+event.id}><time className="analytics-event-date" dateTime={event.startingAt}><strong>{formatDate(event.startingAt,{day:'2-digit'})}</strong><small>{formatDate(event.startingAt,{month:'short'})}</small></time><span className="analytics-event-detail"><h3>{event.eventName}</h3><p><Clock3 size={12}/>{formatDate(event.startingAt,{hour:'2-digit',minute:'2-digit'})} – {formatDate(event.endingAt,{hour:'2-digit',minute:'2-digit'})}</p><small>{formatDate(event.startingAt,{day:'numeric',month:'short',year:'numeric'})}</small></span><ArrowRight size={15}/></Link>)}</div></State></section>
  </div>
  <Notice>The dedicated dashboard overview is unavailable: /hostel-admin/dashboard is not implemented. Values use documented lists and attendance reports. Room results may include other hostels due to the documented backend filtering issue.</Notice>
 </div>
}
