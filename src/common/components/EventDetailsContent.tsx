import {Link,useParams} from '@/common/utils/navigation'
import {Record,State,Notice} from './UI'
import {eventService} from '../services/eventService'
import {useResource} from '../utils/hooks'
export default function EventDetailsContent({admin=false}){
 const {id}=useParams()
 const r=useResource(eventService.details,id)
 const event=r.data?.data
 const base=admin?'/admin/events':'/student/events'
 return <section className="panel"><div className="section-head"><h2>{event?.eventName||'Event details'}</h2>{admin&&<Link className="text-link" to={base+'/'+id+'/edit'}>Edit event →</Link>}</div>
  <Notice>Event image retrieval is unavailable until /media/download_url is implemented.</Notice>
  <State resource={r}><Record data={event}/>{event?.eventLink&&/^https?:\/\//i.test(event.eventLink)&&<a className="text-link" href={event.eventLink} target="_blank" rel="noreferrer">Open event link ↗</a>}</State>
  <br/><Link className="text-link" to={base}>← All events</Link>
 </section>
}

