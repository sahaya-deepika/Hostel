import {useParams} from '@/common/utils/navigation'
import RoomForm from '../../components/RoomForm'
import {State} from '../../../common/components/UI'
import {useResource} from '../../../common/utils/hooks'
import {roomService} from '@/admin/services/roomService'
export default function EditRoom(){const {id}=useParams();const r=useResource(roomService.details,id);return <State resource={r}><RoomForm room={r.data?.data}/></State>}

