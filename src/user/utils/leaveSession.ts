import type { EntityId, Leave } from '../../common/types'
const key=(userId: EntityId)=>'ourhostel-leaves-'+userId
export function readLeaveSession(userId: EntityId): Leave[]{try{return JSON.parse(sessionStorage.getItem(key(userId))||'[]')}catch{return []}}
// Store only actual create/update/cancel API responses, never fabricated history.
export function saveLeaveSession(userId: EntityId,leave: Leave){
 const records=[leave,...readLeaveSession(userId).filter(item=>item.id!==leave.id)]
 sessionStorage.setItem(key(userId),JSON.stringify(records))
 return records
}
export function findSessionLeave(userId: EntityId,id: EntityId){return readLeaveSession(userId).find(item=>String(item.id)===String(id))}

