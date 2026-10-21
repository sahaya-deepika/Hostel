import {Link,useSearchParams} from '@/common/utils/navigation'
import AuthLayout from '../../layouts/AuthLayout'
import {DataForm,Notice,field} from '../../components/UI'
import {setNewPassword} from '../../services/authService'
export default function SetNewPassword() {
 const [params]=useSearchParams()
 return <AuthLayout setup title="Set up your password" description="Your first step to a more connected hostel life.">
  <Notice>Use the raw token from your emailed setup link. It expires after 5 minutes.</Notice>
  <DataForm fields={[field('token','Setup token','text',true),field('newPassword','New password','password',true)]}
   initial={{token:params.get('token')||''}} action={setNewPassword} submitLabel="Set password"/>
  <Link className="text-link" to="/login">Back to sign in →</Link>
 </AuthLayout>
}

