import {useParams} from '@/common/utils/navigation'
import EventForm from '../../components/EventForm'
import {State} from '../../../common/components/UI'
import {useResource} from '../../../common/utils/hooks'
import {eventService} from '../../../common/services/eventService'
export default function EditEvent(){const {id}=useParams();const r=useResource(eventService.details,id);return <State resource={r}><EventForm event={r.data?.data}/></State>}

