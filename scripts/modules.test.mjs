import {randomBytes} from 'node:crypto'
import {createSession,SESSION_COOKIE} from '../src/common/server/session.ts'
﻿import test,{before,after} from 'node:test'
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {createServer} from 'node:net'
import {readFile} from 'node:fs/promises'
import {adminRoutes,studentRoutes} from '../src/common/routes/routeConfig.ts'
import {dashboardPath,validateLoginRole} from '../src/common/utils/session.ts'
// Dedicated test server secret; no fixture sessions are installed in the running app.
process.env.AUTH_SESSION_SECRET=randomBytes(48).toString('base64url')
let server,base
before(async()=>{
 const port=await new Promise(resolve=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})})
 base='http://127.0.0.1:'+port
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,stdio:'ignore'})
 for(let i=0;i<100;i++){try{if((await fetch(base+'/login')).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}
 throw new Error('Next production server did not start; run npm run build first.')
})
after(()=>server?.kill())
async function page(path){const response=await fetch(base+path);assert.equal(response.status,200,path);return response.text()}
test('Next server renders the public login and its accessible controls',async()=>{
 const html=await page('/login');for(const pattern of [/Welcome Back/,/name="email"/,/name="password"/,/Remember me/,/Set Your Password/,/Show password/])assert.match(html,pattern)
 assert.doesNotMatch(html,/name="newPassword"/)
})
test('password setup is served through the public Next suspense boundary',async()=>{
 const html=await page('/setup-password?token=raw%2Btoken%2Fvalue');assert.match(html,/Loading OurHostel/);assert.match(html,/setup-password/);assert.doesNotMatch(html,/name="email"/)
})
test('every admin and student route redirects unauthenticated requests before rendering',async()=>{
 for(const [role,routes]of [['admin',adminRoutes],['student',studentRoutes]])for(const route of routes){
  const response=await fetch(base+'/'+role+'/'+route.path.replace(':id','route-smoke-id'),{redirect:'manual'})
  assert.equal(response.status,307)
  assert.equal(new URL(response.headers.get('location'),base).pathname,'/login')
  assert.doesNotMatch(await response.text(),/<aside/)
 }
})
test('server session endpoint rejects missing sessions, forged cookies, missing credentials and cross-origin writes',async()=>{
 for(const cookie of ['', 'ourhostel-session=forged.admin.cookie']){
  const response=await fetch(base+'/api/auth/session',{headers:{Cookie:cookie,Authorization:'Bearer untrusted-browser-token'}})
  assert.equal(response.status,401)
  for(const path of ['/admin/dashboard','/student/dashboard','/admin/students/1/edit']){
   const direct=await fetch(base+path,{headers:{Cookie:cookie},redirect:'manual'})
   assert.equal(direct.status,307)
   assert.equal(new URL(direct.headers.get('location'),base).pathname,'/login')
  }
 }
 const crossOrigin=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'})
 assert.equal(crossOrigin.status,403)
 const empty=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})
 assert.equal(empty.status,422)
 const logout=await fetch(base+'/api/auth/session',{method:'DELETE',headers:{Origin:base}})
 assert.equal(logout.status,200)
 assert.match(logout.headers.get('set-cookie'),/Max-Age=0/i)
 const afterLogout=await fetch(base+'/admin/dashboard',{redirect:'manual'})
 assert.equal(afterLogout.status,307)
})

test('Next serves every supplied premium login asset successfully',async()=>{
 const html=await page('/login');for(const name of ['image1','image2','image3','image4','image6']){assert.ok(html.includes('/images/'+name+'.png'));const res=await fetch(base+'/images/'+name+'.png');assert.equal(res.status,200);const bytes=new Uint8Array(await res.arrayBuffer());assert.deepEqual([...bytes.slice(0,8)],[137,80,78,71,13,10,26,10])}
})
test('role destinations and route inventories remain separate',()=>{
 assert.equal(dashboardPath('STUDENT'),'/student/dashboard');assert.equal(dashboardPath('HOSTEL_ADMIN'),'/admin/dashboard');assert.equal(dashboardPath(),'/login');assert.equal(adminRoutes.length,16);assert.equal(studentRoutes.length,7);assert.ok(!studentRoutes.some(r=>/^(students|rooms)/.test(r.path)))
})
test('unknown URLs use the native Next not-found page',async()=>{
 const response=await fetch(base+'/not-an-ourhostel-page');assert.equal(response.status,404);assert.match(await response.text(),/Page not found/)
 const pkg=JSON.parse(await readFile('package.json','utf8'));assert.ok(pkg.dependencies.next);assert.ok(!pkg.dependencies['react-router-dom']);assert.ok(!pkg.devDependencies.vite)
})

test('login selection accepts matching roles and rejects a mismatched or unsupported account',()=>{
 assert.doesNotThrow(()=>validateLoginRole('STUDENT','STUDENT'))
 assert.doesNotThrow(()=>validateLoginRole('HOSTEL_ADMIN','HOSTEL_ADMIN'))
 assert.throws(()=>validateLoginRole('HOSTEL_ADMIN','STUDENT'),/Select Admin/)
 assert.throws(()=>validateLoginRole('STUDENT','HOSTEL_ADMIN'),/Select User/)
 assert.throws(()=>validateLoginRole('OTHER','STUDENT'),/not supported/)
})

test('Proxy rejects opposite-role signed sessions on direct navigation and refresh',async()=>{
 for(const [role,wrongPath,destination] of [['STUDENT','/admin/dashboard','/student/dashboard'],['HOSTEL_ADMIN','/student/dashboard','/admin/dashboard']]){
  const input={user:{id:1,email:'isolated-policy@example.invalid',status:'ACTIVE',role},token:randomBytes(32).toString('base64url')}
  const {value}=createSession(input)
  for(let refresh=0;refresh<2;refresh++){
   const response=await fetch(base+wrongPath,{headers:{Cookie:SESSION_COOKIE+'='+value},redirect:'manual'})
   assert.equal(response.status,307)
   assert.equal(new URL(response.headers.get('location'),base).pathname,destination)
   assert.doesNotMatch(await response.text(),/<aside/)
  }
  const verified=await fetch(base+'/api/auth/session',{headers:{Cookie:SESSION_COOKIE+'='+value,Authorization:'Bearer '+input.token}})
  assert.equal(verified.status,200)
  assert.equal((await verified.json()).user.role,role)
  const wrongToken=await fetch(base+'/api/auth/session',{headers:{Cookie:SESSION_COOKIE+'='+value,Authorization:'Bearer other-token'}})
  assert.equal(wrongToken.status,401)
 }
})
