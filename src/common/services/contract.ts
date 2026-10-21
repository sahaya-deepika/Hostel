import type { Role } from '../types'
type Operation = [method: string, path: string, roles: string[], fields?: string[], queries?: string[]]
// Only operations in docs/api-source.txt are allowed through the API client.
const A=['HOSTEL_ADMIN'],S=['STUDENT'],B=['HOSTEL_ADMIN','STUDENT'],P: string[]=[]
const studentFields=['email','studentName','contactNumber','parentMobileNumber','departmentId','rollNumber','studentImageKey','roomId']
const eventFields=['eventName','eventDescription','startingAt','endingAt','eventImageKey','eventLink','contactPersonName','contactPersonPhone']
export const operations: Operation[]=[
 ['post','/auth/login',P,['email','password']],
 ['post','/students/setup_new_password',P,['token','newPassword']],
 ['get','/students/home',S],
 ['post','/attendance_records',S,['capturedImageKey','latitude','longitude']],
 ['get','/attendance_records',A,[],['page','pageSize','date','fromDate','toDate','status']],
 ['post','/students',A,studentFields],
 ['get','/students',A],
 ['get','/students/{id}',A],
 ['patch','/students/{id}',A,studentFields],
 ['get','/students/departments',A],
 ['post','/rooms',A,['roomNumber','capacity']],
 ['get','/rooms',A],
 ['get','/rooms/{id}',A],
 ['patch','/rooms/{id}',A,['roomNumber','capacity']],
 ['post','/leave_applications',S,['leaveReason','fromDate','toDate']],
 ['get','/leave_applications',A],
 ['get','/leave_applications/{id}',A],
 ['patch','/leave_applications/{id}',S,['leaveReason','fromDate','toDate']],
 ['patch','/leave_applications/{id}/review',A,['status','rejectionReason']],
 ['patch','/leave_applications/{id}/cancel',S],
 ['post','/upcoming_events',A,eventFields],
 ['get','/upcoming_events',B],
 ['get','/upcoming_events/{id}',B],
 ['patch','/upcoming_events/{id}',A,[...eventFields,'isActive']],
]
export function findOperation(method: string, path: string){return operations.find(([m,p])=>m===method.toLowerCase()&&new RegExp('^'+p.replace('{id}','[1-9][0-9]*')+'$').test(path))}
export function validateRequest(method: string = 'get',path: string = '',role?: Role,body?: unknown,params?: unknown){
 const operation=findOperation(method,path)
 if(!operation)throw new Error('This API operation is not documented or implemented.')
 const [,,roles,fields=[],queries=[]]=operation
 if(roles.length&&!roles.includes(role || ''))throw new Error('Your role cannot use this API operation.')
 if(Object.keys(body||{}).some(k=>!fields.includes(k)))throw new Error('The request contains an undocumented field.')
 if(Object.keys(params||{}).some(k=>!queries.includes(k)))throw new Error('The request contains an unsupported query parameter.')
 return operation
}
