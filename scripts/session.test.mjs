import test from 'node:test'
import assert from 'node:assert/strict'
import {randomBytes} from 'node:crypto'
import {createSession, verifySession, protectedRouteRedirect, tokenHash, sessionExpiry} from '../src/common/server/session.ts'

// Isolated cryptographic/policy fixtures, never sent to the backend or installed in a browser.
process.env.AUTH_SESSION_SECRET=randomBytes(48).toString('base64url')
const now=Date.now()
const policySession=role=>({user:{id:1,email:'policy-fixture@example.invalid',status:'ACTIVE',role},token:randomBytes(32).toString('base64url')})
test('signed sessions authenticate the issuing server, bind the token and expire',()=>{
 const input=policySession('STUDENT')
 const created=createSession(input,now)
 const verified=verifySession(created.value,now)
 assert.equal(verified.user.role,'STUDENT')
 assert.equal(verified.tokenHash,tokenHash(input.token))
 assert.equal(verifySession(created.value,created.expires.getTime()),null)
 const [payload,signature]=created.value.split('.')
 const altered=JSON.parse(Buffer.from(payload,'base64url').toString())
 altered.user.role='HOSTEL_ADMIN'
 assert.equal(verifySession(Buffer.from(JSON.stringify(altered)).toString('base64url')+'.'+signature,now),null)
 assert.equal(verifySession(created.value+'x',now),null)
 assert.equal(verifySession('forged.admin.cookie',now),null)
 assert.equal(verifySession(undefined,now),null)
})
test('each verified role is confined to its route group, including direct URLs and nested paths',()=>{
 const student=verifySession(createSession(policySession('STUDENT'),now).value,now)
 const admin=verifySession(createSession(policySession('HOSTEL_ADMIN'),now).value,now)
 for(const path of ['/admin','/admin/dashboard','/admin/students/12/edit','/admin/rooms/new']){
  assert.equal(protectedRouteRedirect(path,student),'/student/dashboard')
  assert.equal(protectedRouteRedirect(path,admin),null)
  assert.equal(protectedRouteRedirect(path,null),'/login')
 }
 for(const path of ['/student','/student/dashboard','/student/leaves/12','/student/events']){
  assert.equal(protectedRouteRedirect(path,admin),'/admin/dashboard')
  assert.equal(protectedRouteRedirect(path,student),null)
  assert.equal(protectedRouteRedirect(path,null),'/login')
 }
 assert.equal(protectedRouteRedirect('/login',null),null)
})
test('inactive or unsupported backend accounts cannot establish sessions; JWT exp only shortens lifetime',()=>{
 assert.throws(()=>createSession({...policySession('STUDENT'),user:{...policySession('STUDENT').user,status:'INACTIVE'}},now))
 assert.throws(()=>createSession(policySession('OTHER'),now))
 const expires=Math.floor(now/1000)+120
 const token='header.'+Buffer.from(JSON.stringify({exp:expires,role:'HOSTEL_ADMIN'})).toString('base64url')+'.opaque'
 assert.equal(sessionExpiry(token,now),expires*1000)
 const created=createSession({...policySession('STUDENT'),token},now)
 assert.equal(verifySession(created.value,now).user.role,'STUDENT')
 assert.throws(()=>createSession({...policySession('STUDENT'),token:'header.'+Buffer.from(JSON.stringify({exp:1})).toString('base64url')+'.opaque'},now))
})
test('missing signing configuration fails closed',()=>{
 const secret=process.env.AUTH_SESSION_SECRET
 try {
  delete process.env.AUTH_SESSION_SECRET
  assert.throws(()=>createSession(policySession('STUDENT'),now),/AUTH_SESSION_SECRET/)
  assert.equal(verifySession('untrusted.signature',now),null)
 } finally {process.env.AUTH_SESSION_SECRET=secret}
})
