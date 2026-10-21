import type { Room, FormValues } from '@/common/types'
import {useNavigate} from '@/common/utils/navigation'
import {DataForm,field} from '../../common/components/UI'
import RoomWarning from './RoomWarning'
import {roomService} from '@/admin/services/roomService'
export default function RoomForm({room={}}: {room?: Partial<Room>}){
 const navigate=useNavigate()
 const editing=Boolean(room.id)
 return <section className="panel"><h2>{editing?'Edit room':'Add room'}</h2><RoomWarning/>
  {editing&&<p className="muted">Hostel ID: {room.hostelId} · Occupied beds: {room._count?.studentProfiles}</p>}
  <DataForm fields={[field('roomNumber','Room number','text',!editing),field('capacity','Capacity','number',!editing,{min:Math.max(1,room._count?.studentProfiles||1),step:1})]}
   initial={room} changedOnly={editing} action={editing?payload=>roomService.update(room.id!,payload):roomService.create}
   onSuccess={()=>navigate('/admin/rooms')} submitLabel={editing?'Update room':'Create room'}/>
 </section>
}

