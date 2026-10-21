import {writeFile} from 'node:fs/promises'
const base='https://api.ourhostel.in/api/v1'
// Read-only protected probes and empty public validation requests only.
// No student, attendance, room, leave or event records are created or changed.
const checks=[['POST','/auth/login',{}],['POST','/students/setup_new_password',{}],...['/students/home','/attendance_records','/students','/students/departments','/rooms','/leave_applications','/upcoming_events'].map(p=>['GET',p])]
const results=await Promise.all(checks.map(async([method,path,payload])=>{try{const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json','Origin':'http://localhost:3000'},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(15000)});const text=await response.text();let body;try{body=JSON.parse(text)}catch{body=text.slice(0,180)}return {method,path,httpStatus:response.status,allowOrigin:response.headers.get('access-control-allow-origin'),body}}catch(e){return {method,path,error:e.message,cause:e.cause?.code}}}))
let preflight;try{const response=await fetch(base+'/auth/login',{method:'OPTIONS',headers:{Origin:'http://localhost:3000','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'},signal:AbortSignal.timeout(15000)});preflight={path:'/auth/login',httpStatus:response.status,allowOrigin:response.headers.get('access-control-allow-origin'),allowMethods:response.headers.get('access-control-allow-methods'),allowHeaders:response.headers.get('access-control-allow-headers')}}catch(e){preflight={error:e.message}}
const report={preflight,checkedAt:new Date().toISOString(),baseURL:base,scope:'Unauthenticated connectivity and validation only. No valid credentials supplied; protected successful reads and mutations NOT verified.',results}
await writeFile('docs/api-verification.json',JSON.stringify(report,null,2))
for(const r of results)console.log(`${r.method} ${r.path}: ${r.httpStatus??r.error}${r.cause?' ('+r.cause+')':''}`)
