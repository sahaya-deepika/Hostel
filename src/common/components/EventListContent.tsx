import {Link} from '@/common/utils/navigation'
import {CalendarDays,ArrowUpRight,Plus} from 'lucide-react'
import {State,Notice} from './UI'
import {eventService} from '../services/eventService'
import {useResource,dateText} from '../utils/hooks'
export default function EventListContent({admin=false}){
 const r=useResource(eventService.list)
 const base=admin?'/admin/events':'/student/events'
 return <><div className="toolbar"><p className="muted">Shared moments. A stronger community.</p>{admin&&<Link className="primary" to={base+'/new'}><Plus size={17}/>Create event</Link>}</div>
  <Notice>The list includes past and inactive events. Images cannot be loaded from object keys because /media/download_url is unavailable.</Notice>
  <State resource={r} empty={!r.data?.data?.length}><div className="event-grid">{r.data?.data?.map(event=><article className="panel event-card" key={event.id}>
   <div className="event-visual"><CalendarDays size={42}/><span>{dateText(event.startingAt)}</span></div><div className="event-body"><span className="badge">{!event.isActive?'Inactive':new Date(event.endingAt)<new Date()?'Past event':'Upcoming'}</span><h2>{event.eventName}</h2><p>{event.eventDescription}</p>
   <div className="section-head"><Link className="text-link" to={base+'/'+event.id}>View event <ArrowUpRight size={15}/></Link>{admin&&<Link className="text-link" to={base+'/'+event.id+'/edit'}>Edit</Link>}</div></div>
  </article>)}</div></State>
 </>
}

