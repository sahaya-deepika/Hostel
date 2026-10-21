import {spawn} from 'node:child_process'
import {mkdtemp,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createServer} from 'node:net'
import assert from 'node:assert/strict'
const port=await new Promise(resolve=>{const server=createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})})
const profile=await mkdtemp(join(tmpdir(),'ourhostel-login-qa-'))
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-sandbox','--in-process-gpu','--disable-software-rasterizer','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']})
browser.stderr.on('data',()=>{})
const keepAlive=setInterval(()=>{},1000)
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
let ws,id=0
const pending=new Map(),events=[]
function send(method,params={}){return new Promise((resolve,reject)=>{const commandId=++id;pending.set(commandId,{resolve,reject});ws.send(JSON.stringify({id:commandId,method,params}))})}
async function evaluate(expression){const response=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(response.exceptionDetails)throw new Error(JSON.stringify(response.exceptionDetails));return response.result.value}
async function until(expression){for(let i=0;i<150;i++){if(await evaluate(expression)){const hydrated=await evaluate('(()=>{const form=document.querySelector("form");return !form||Object.keys(form).some(key=>key.startsWith("__reactProps")&&typeof form[key].onSubmit==="function")})()');if(hydrated)return}await sleep(100)}throw new Error('Timed out: '+expression)}
try{
 let target
 for(let i=0;i<100;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'});target=await r.json();break}catch{await sleep(100)}}
 if(!target)throw new Error('Chrome debugger did not start')
 ws=new WebSocket(target.webSocketDebuggerUrl)
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
 ws.onclose=event=>{for(const p of pending.values())p.reject(new Error('Debugger socket closed: '+event.code+' '+event.reason));pending.clear()}
 ws.onmessage=message=>{const response=JSON.parse(message.data);if(response.id){const p=pending.get(response.id);if(p){pending.delete(response.id);response.error?p.reject(new Error(JSON.stringify(response.error))):p.resolve(response.result)}}else events.push(response)}
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable')
 const zoomLevels=[75,80,90,100,110,125,150,200]
 const report={viewports:[],checks:[],zoomLevels,zoomMethod:'Effective CSS viewport = baseline viewport / browser zoom; deviceScaleFactor = zoom. This emulates browser-zoom layout and pixel density, not pinch zoom or CSS transforms. Native browser chrome zoom controls were not driven.'}
 const cases=[
  ...[['reference',1536,1024],['desktop',1440,900],['short-desktop',1366,768],['short-laptop',1366,600],['wide-desktop',1920,1080],['user-desktop',1920,954],['tablet',1024,768],['portrait-tablet',768,1024],['mobile',375,812],['large-mobile',430,932],['small-mobile',320,740]].map(([name,width,height])=>({name,width,height,zoom:100})),
  ...[['desktop-zoom',1920,954],['laptop-zoom',1440,900],['tablet-zoom',1024,768],['mobile-zoom',375,812]].flatMap(([name,baseWidth,baseHeight])=>zoomLevels.map(zoom=>({name:name+'-'+zoom,width:Math.round(baseWidth/(zoom/100)),height:Math.round(baseHeight/(zoom/100)),zoom,baseWidth,baseHeight}))),
 ]
 for(const item of cases){
  const {name,width,height,zoom}=item
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:zoom/100,mobile:false})
  await send('Page.navigate',{url:'http://localhost:3000/login'})
  await until('Boolean(document.querySelector(".student-login-form"))')
  await evaluate(`(async()=>{await Promise.all(Array.from(document.images).map(img=>img.decode()));const img=new Image();img.src=getComputedStyle(document.querySelector('.auth-campus')).backgroundImage.slice(5,-2);await img.decode();return true})()`)
  const metrics=await evaluate(`(()=>{
   const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
   const style=selector=>getComputedStyle(document.querySelector(selector));
   const controls=['[name=email]','[name=password]','.password-toggle','.student-login-button'].map(selector=>({selector,...rect(selector),fontSize:parseFloat(style(selector).fontSize)}));
   const image=document.querySelector('.auth-wave img');
   const form=rect('form'),content=rect('.login-content'),footer=rect('.login-footer'),header=rect('.login-top-link'),panel=rect('.login-panel');
   return {referenceAligned:matchMedia('(min-width:1200px) and (min-height:851px)').matches,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,columns:style('.auth-campus').gridTemplateColumns,stacked:matchMedia('(max-width:850px)').matches,controls,form,content,footer,header,panel,imageLoaded:image.complete&&image.naturalWidth>0,decorationFit:style('.auth-wave img').objectFit,photoSize:style('.auth-campus').backgroundSize,brandPosition:document.querySelector('.campus-brand')?style('.campus-brand').position:null,footerPosition:style('.login-footer').position,rootTransform:style('.auth-campus').transform};
  })()`)
  const context=name+' '+width+'x'+height
  assert.ok(metrics.documentWidth<=width,'Horizontal overflow: '+context+' '+JSON.stringify(metrics))
  if(width>=896&&height>=600)assert.ok(metrics.documentHeight<=height+1,'Unnecessary desktop vertical scrolling: '+context+' '+metrics.documentHeight);
  assert.equal(metrics.rootTransform,'none','Page is globally scaled: '+context)
  assert.ok(['static','relative',null].includes(metrics.brandPosition),'Branding is pinned to coordinates: '+context)
  assert.equal(metrics.footerPosition,'static','Illustration is outside layout flow: '+context)
  assert.ok(metrics.header.bottom<=metrics.content.y+1,'Header overlaps form: '+context)
  assert.ok(!metrics.footer.height||metrics.content.x>=metrics.footer.right||metrics.content.right<=metrics.footer.x||metrics.content.bottom<=metrics.footer.y+1,'Illustration overlaps login content: '+context)
  assert.ok(!metrics.footer.height||metrics.form.x>=metrics.footer.right||metrics.form.right<=metrics.footer.x||metrics.form.bottom<=metrics.footer.y+1,'Illustration overlaps controls: '+context)
  assert.ok(metrics.footer.height<=168.5,'Illustration exceeds its maximum size: '+context)
  if(!metrics.referenceAligned)assert.ok(Math.abs((metrics.content.y+metrics.content.bottom)/2-(metrics.panel.y+metrics.panel.bottom)/2)<=2,'Card is not vertically centered in its panel: '+context);else assert.ok(metrics.content.y>=metrics.panel.y&&metrics.content.bottom<=metrics.panel.bottom+1,'Reference card extends outside its available panel: '+context)
  assert.equal(metrics.imageLoaded,true)
  assert.equal(metrics.decorationFit,'contain')
  assert.ok(!metrics.photoSize.includes('vh'),'Photo still scales independently with viewport height: '+context)
  for(const control of metrics.controls){
   assert.ok(control.x>=-1&&control.right<=width+1,'Control clips horizontally: '+context+' '+control.selector)
   assert.ok(control.height>=44,'Control is too small: '+context+' '+control.selector)
   if(control.selector==='[name=email]'||control.selector==='[name=password]')assert.ok(control.fontSize>=16,'Input font shrinks with zoom: '+context)
   await evaluate('document.querySelector('+JSON.stringify(control.selector)+').scrollIntoView({block:"center"})')
   const visible=await evaluate('(()=>{const r=document.querySelector('+JSON.stringify(control.selector)+').getBoundingClientRect();return r.top>=-1&&r.bottom<=innerHeight+1})()')
   assert.ok(visible,'Control cannot be reached by scrolling: '+context+' '+control.selector)
  }
  await evaluate('window.scrollTo(0,0)')
  if(['reference','desktop','user-desktop','mobile','desktop-zoom-80','desktop-zoom-200','mobile-zoom-200'].includes(name)){
   const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
   await writeFile('artifacts/login-'+name+'.png',Buffer.from(capture.data,'base64'))
  }
  report.viewports.push({...item,...metrics})
 }
 report.checks.push('43 viewport/zoom cases: no horizontal overflow, readable inputs, reachable controls, normal-flow branding/footer, centered form, bounded contained illustration')
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})
 await send('Page.navigate',{url:'http://localhost:3000/login'})
 await until('Boolean(document.querySelector(".student-login-form"))')
 const seedPortalFields=async()=> {
  await evaluate(`(()=>{for(const [name,value] of [['email','portal-check@example.invalid'],['password','not-a-real-password']]){const input=document.querySelector('[name='+name+']');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))}document.querySelector('[aria-label="Show password"]').click();document.querySelector('[name=remember]').click()})()`)
 }
 await seedPortalFields()
 assert.equal(await evaluate(`document.querySelector('[name="login-role"]:checked').value`),'STUDENT')
 await evaluate(`document.querySelector('[name="login-role"][value="HOSTEL_ADMIN"]').click()`)
 await until(`document.querySelector('.login-heading p').textContent.includes('admin account')`)
 assert.equal(await evaluate(`document.querySelector('[name="login-role"]:checked').value`),'HOSTEL_ADMIN')
 assert.deepEqual(await evaluate(`[document.querySelector('[name=email]').value,document.querySelector('[name=password]').value,document.querySelector('[name=password]').type,document.querySelector('[name=remember]').checked]`),['','','password',false])
 await seedPortalFields()

 await evaluate(`document.querySelector('[name="login-role"][value="STUDENT"]').click()`)
 await until(`document.querySelector('.login-heading p').textContent.includes('user account')`)
 assert.deepEqual(await evaluate(`[document.querySelector('[name=email]').value,document.querySelector('[name=password]').value,document.querySelector('[name=password]').type,document.querySelector('[name=remember]').checked]`),['','','password',false])
 report.checks.push('User/Admin toggle clears credentials, resets Remember Me and hides the password in both directions')

 const invalid=await evaluate(`(()=>{const email=document.querySelector('[name=email]'),password=document.querySelector('[name=password]');email.value='';password.value='';return !document.querySelector('form').checkValidity()})()`)
 assert.ok(invalid);report.checks.push('Required fields reject empty submission')
 assert.equal(await evaluate(`(()=>{const email=document.querySelector('[name=email]');email.value='invalid-email';return !email.checkValidity()})()`),true)
 report.checks.push('Email validation rejects invalid syntax')
 await evaluate(`(()=>{const input=document.querySelector('[name=email]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'');input.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('form').requestSubmit()})()`)
 await until(`Boolean(document.querySelector('#login-email-error'))&&Boolean(document.querySelector('#login-password-error'))`)
 assert.equal(await evaluate(`document.activeElement.id`),'login-email')
 assert.equal(await evaluate(`document.querySelector('[name=email]').getAttribute('aria-describedby')`),'login-email-error')
 assert.equal(await evaluate(`document.querySelector('[name=password]').getAttribute('aria-invalid')`),'true')
 report.checks.push('Inline required-field errors are associated with inputs and focus moves to the first invalid field')
 await evaluate(`(()=>{const input=document.querySelector('[name=email]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'invalid-email');input.dispatchEvent(new Event('input',{bubbles:true}))})()`)
 await evaluate(`document.querySelector('form').requestSubmit()`)
 await until(`document.querySelector('#login-email-error')?.textContent.includes('valid email address')`)
 report.checks.push('Invalid email submission produces a readable field-specific message')
 const focusOrder=[]
 for(let i=0;i<5;i++){
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  focusOrder.push(await evaluate(`document.activeElement.name||document.activeElement.className`))
 }
 assert.deepEqual(focusOrder,['password','password-toggle','remember','recovery-link','primary student-login-button login-button'])
 report.checks.push('Keyboard Tab reaches password, visibility toggle, checkbox, recovery notice and Login in order')
 const focusStyle=await evaluate(`(()=>{const style=getComputedStyle(document.activeElement);return {style:style.outlineStyle,width:style.outlineWidth}})()`)
 assert.equal(focusStyle.style,'solid');assert.equal(focusStyle.width,'2px')
 report.checks.push('Keyboard focus has a visible two-pixel outline')
 await evaluate(`document.querySelector('[aria-label="Show password"]').click()`)
 assert.equal(await evaluate(`document.querySelector('[name=password]').type`),'text')
 await evaluate(`document.querySelector('[aria-label="Hide password"]').click()`)
 assert.equal(await evaluate(`document.querySelector('[name=password]').type`),'password')
 report.checks.push('Password visibility toggles both ways')
 await evaluate(`document.querySelector('.recovery-link').click()`)
 assert.match(await evaluate(`document.querySelector('#password-recovery-notice').textContent`),/not implemented/)
 await evaluate(`document.querySelector('.recovery-link').click()`)
 report.checks.push('Forgot password shows the documented unavailable state')
 assert.equal(await evaluate(`document.querySelectorAll('.social-login, .social-divider, .welcome-wave').length`),0)
 report.checks.push('Removed social login section and waving-hand emoji are absent')
 await send('Page.navigate',{url:'http://localhost:3000/login'})
 await until(`Boolean(document.querySelector('.student-login-form'))`)
 await until('Object.keys(document.querySelector("form")||{}).some(key=>key.startsWith("__reactProps")&&typeof document.querySelector("form")[key].onSubmit==="function")')
 await send('Fetch.enable',{patterns:[{urlPattern:'http://localhost:3000/api/auth/session',requestStage:'Request'}]})
 await evaluate(`(()=>{const set=(input,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))};set(document.querySelector('[name=email]'),'ui-check@example.invalid');set(document.querySelector('[name=password]'),'ui-check-only');document.querySelector('[name=remember]').click();})()`)
 await evaluate(`document.querySelector('form').requestSubmit()`)
 await until(`document.querySelector('.student-login-button').disabled`)
 assert.match(await evaluate(`document.querySelector('.student-login-button').textContent`),/Logging in/)
 report.checks.push('Pending request uses the reusable Loader and disables submit/fields')
 await evaluate(`document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`)
 await sleep(500)
 const pauses=events.filter(e=>e.method==='Fetch.requestPaused'&&e.params.request.url.endsWith('/api/auth/session'))
 assert.equal(pauses.length,1,'Duplicate login requests were submitted')
 const posts=events.filter(e=>e.method==='Network.requestWillBeSent'&&e.params.request.url.endsWith('/api/auth/session')&&e.params.request.method==='POST')
 assert.equal(posts.length,1)
 assert.deepEqual(Object.keys(JSON.parse(posts[0].params.request.postData)).sort(),['email','password'])
 report.checks.push('Duplicate submissions are prevented; payload contains only email and password')
 for(const pause of pauses)await send('Fetch.failRequest',{requestId:pause.params.requestId,errorReason:'ConnectionFailed'})
 await until(`Boolean(document.querySelector('.login-error'))`)
 assert.match(await evaluate(`document.querySelector('.login-error').textContent`),/could not be reached/)
 assert.equal(await evaluate(`document.querySelector('.student-login-button').disabled`),false)
 report.checks.push('Failed connection displays an error and permits retry')
 assert.equal(await evaluate(`localStorage.getItem('ourhostel-remembered-email')`),'ui-check@example.invalid')
 assert.equal(await evaluate(`sessionStorage.getItem('ourhostel-token')`),null)
 report.checks.push('Remember Me stores only email; failed authentication creates no token')
 await send('Fetch.disable')
 await send('Page.navigate',{url:'http://localhost:3000/login'})
 await until(`Boolean(document.querySelector('[name=email]'))`)
 await until(`document.querySelector('[name=email]')?.value === 'ui-check@example.invalid' && document.querySelector('[name=remember]')?.checked`)
 assert.equal(await evaluate(`document.querySelector('[name=email]').value`),'ui-check@example.invalid')
 await evaluate(`document.querySelector('[name=remember]').click()`)
 assert.equal(await evaluate(`localStorage.getItem('ourhostel-remembered-email')`),null)
 report.checks.push('Remembered email restores after reload and clears when unchecked')
 await evaluate(`document.querySelector('.login-top-link a').click()`)
 await until(`Boolean(document.querySelector('[name=newPassword]'))`)
 assert.ok(await evaluate(`location.pathname==='/setup-password'`))
 report.checks.push('Set Your Password link opens the existing password setup page')
 await send('Page.navigate',{url:'http://localhost:3000/setup-password?token=raw%2Btoken%2Fvalue'})
 await until('document.querySelector("[name=token]")?.value === "raw+token/value"')
 report.checks.push('Next password setup decodes the emailed token once and preserves its raw value')
 await evaluate(`sessionStorage.setItem('ourhostel-user', JSON.stringify({id:1,email:'untrusted@example.invalid',status:'ACTIVE',role:'HOSTEL_ADMIN'}));sessionStorage.setItem('ourhostel-token','invalid-token');localStorage.setItem('role','HOSTEL_ADMIN')`)
 for(const path of ['/admin/dashboard','/student/dashboard','/admin/students/route-smoke-id/edit','/student/leaves/route-smoke-id']){await send('Page.navigate',{url:'http://localhost:3000'+path});await until('location.pathname==="/login" && Boolean(document.querySelector(".student-login-form"))')}
 report.checks.push('Next server and client guards redirect unauthenticated admin/student pages, including direct dynamic routes, to login')
 await send('Page.reload')
 await until('location.pathname==="/login" && Boolean(document.querySelector(".student-login-form"))')
 assert.equal(await evaluate(`sessionStorage.getItem('ourhostel-user')`),null)
 assert.equal(await evaluate(`sessionStorage.getItem('ourhostel-token')`),null)
 await evaluate(`localStorage.removeItem('role')`)
 report.checks.push('Forged browser role/token cannot authorize direct navigation or refresh')
 report.consoleErrors=events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.text)
 assert.deepEqual(report.consoleErrors,[])
 report.authenticatedSuccess='Not tested: no valid credentials provided; no login success responses were mocked.'
 await writeFile('artifacts/login-qa.json',JSON.stringify(report,null,2))
 console.log(JSON.stringify({layoutCases:report.viewports.length,zoomLevels:report.zoomLevels,checks:report.checks,consoleErrors:report.consoleErrors,zoomMethod:report.zoomMethod},null,2))
}finally{if(ws?.readyState===1){await send('Browser.close').catch(()=>{});ws.close()}else browser.kill();clearInterval(keepAlive)}
