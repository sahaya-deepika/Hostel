import type { HostelEvent, FormValues } from '@/common/types'
import {useNavigate} from '@/common/utils/navigation'
import {DataForm,Notice,field} from '../../common/components/UI'
import {eventService} from '@/admin/services/eventService'
import {iso,localDateTime} from '../../common/utils/hooks'
export default function EventForm({event={}}: {event?: Partial<HostelEvent>}){
 const navigate=useNavigate()
 const editing=Boolean(event.id)
 const initial={...event,startingAt:localDateTime(event.startingAt),endingAt:localDateTime(event.endingAt)}
 const fields=[field('eventName','Event name','text',!editing),field('eventDescription','Description','textarea',!editing),field('startingAt','Starts at (local time)','datetime-local',!editing),field('endingAt','Ends at (local time)','datetime-local',!editing),field('eventLink','Event link','url'),field('contactPersonName','Contact person'),field('contactPersonPhone','Contact phone'),field('eventImageKey','Existing image key','text',false,{hint:'Image upload and image URL retrieval are unavailable.'}),...(editing?[{...field('isActive','Active'),options:[{value:'true',label:'Active'},{value:'false',label:'Inactive'}]}]:[])]
 function transform(values: FormValues){
  for(const key of ['startingAt','endingAt'])if(values[key])values[key]=iso(String(values[key]))
  if('isActive' in values)values.isActive=values.isActive==='true'
  return values
 }
 return <section className="panel"><h2>{editing?'Edit event':'Create an event'}</h2><Notice>Image upload and download URL APIs are not implemented. Existing uploaded object keys may be supplied.</Notice>
  <DataForm fields={fields} initial={initial} changedOnly={editing} transform={transform}
   action={editing?payload=>eventService.update(event.id!,payload):eventService.create} onSuccess={()=>navigate('/admin/events')}/>
 </section>
}

