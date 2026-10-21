import {Link,useParams} from '@/common/utils/navigation'
import {Record,State} from '../../../common/components/UI'
import RoomWarning from '../../components/RoomWarning'
import {useResource} from '../../../common/utils/hooks'
import {roomService} from '@/admin/services/roomService'
export default function RoomDetails(){
 const {id}=useParams()
 const r=useResource(roomService.details,id)
 return <section className="panel"><div className="section-head"><h2>Room details</h2><Link className="text-link" to={'/admin/rooms/'+id+'/edit'}>Edit room →</Link></div><RoomWarning/>
  <State resource={r}><Record data={r.data?.data}/></State><Link className="text-link" to="/admin/rooms">← All rooms</Link>
 </section>
}

