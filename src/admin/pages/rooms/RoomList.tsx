import {Link} from '@/common/utils/navigation'
import {BedDouble,Plus} from 'lucide-react'
import {State} from '../../../common/components/UI'
import RoomWarning from '../../components/RoomWarning'
import {useResource} from '../../../common/utils/hooks'
import {roomService} from '@/admin/services/roomService'
export default function RoomList(){
 const r=useResource(roomService.list)
 return <><RoomWarning/><div className="toolbar"><span className="muted">Capacity, occupancy, and a little room to grow.</span><Link className="primary" to="/admin/rooms/new"><Plus size={17}/>Add room</Link></div>
  <State resource={r} empty={!r.data?.data?.length}><div className="room-grid">{r.data?.data?.map(room=><section className="panel room-card" key={room.id}>
   <div className="section-head"><span className="tile-icon"><BedDouble/></span><span className="badge">Hostel {room.hostelId}</span></div><h2>Room {room.roomNumber}</h2><p className="muted">{room.occupied} occupied · {room.capacity} beds</p><progress value={room.occupied} max={room.capacity}/>
   <div className="section-head"><span className="green">{room.remaining} beds available</span><div><Link className="text-link" to={'/admin/rooms/'+room.id}>Details</Link> · <Link className="text-link" to={'/admin/rooms/'+room.id+'/edit'}>Edit</Link></div></div>
  </section>)}</div></State>
 </>
}

