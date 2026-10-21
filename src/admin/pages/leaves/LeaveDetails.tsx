import type { FormValues } from '@/common/types'
import {Link,useParams} from '@/common/utils/navigation'
import {DataForm,Record,State,field} from '../../../common/components/UI'
import {useResource} from '../../../common/utils/hooks'
import {leaveService} from '@/admin/services/leaveService'
export default function LeaveDetails(){
 const {id}=useParams()
 const r=useResource(leaveService.details,id)
 const leave=r.data?.data
 function transform(values: FormValues){
  if(values.status==='REJECTED'&&!String(values.rejectionReason || '').trim())throw new Error('A rejection reason is required.')
  return values.status==='APPROVED'?{status:'APPROVED'}:values
 }
 return <section className="panel"><h2>Leave application #{id}</h2><State resource={r}>
  <Record data={leave}/>{leave?.status==='WAITING_FOR_APPROVAL'&&<DataForm fields={[{...field('status','Decision','text',true),options:[{value:'APPROVED',label:'Approve'},{value:'REJECTED',label:'Reject'}]},field('rejectionReason','Rejection reason','textarea',false,{hint:'Required when rejecting.'})]} transform={transform} action={payload=>leaveService.review(id,payload)} onSuccess={r.reload} submitLabel="Submit review"/>}
 </State><Link className="text-link" to="/admin/leaves">← All applications</Link></section>
}

