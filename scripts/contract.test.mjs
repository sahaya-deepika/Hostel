import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {operations,findOperation,validateRequest} from '../src/common/services/contract.ts'
const source=await readFile(new URL('../docs/api-source.txt',import.meta.url),'utf8')
test('every implemented operation matches the supplied documentation and roles',()=>{
 const entries=[...source.matchAll(/^Endpoint: (GET|POST|PATCH) (\S+) \(([^)]+)\)/gm)]
 assert.equal(entries.length,24)
 assert.equal(operations.length,24)
 for(const [,method,path,roles] of entries){
  const item=operations.find(([m,p])=>m===method.toLowerCase()&&p===path)
  assert.ok(item,`${method} ${path}`)
  assert.deepEqual(item[2],roles==='Public'?[]:roles.split(' or '))
 }
})
test('unimplemented endpoints and undocumented verbs never match',()=>{
 for(const [,path]of source.matchAll(/^Endpoint: (\S+) \(HTTP method not defined/gm))for(const method of ['get','post','patch'])assert.equal(findOperation(method,path),undefined)
 for(const path of ['/students','/rooms','/leave_applications','/upcoming_events'])assert.equal(findOperation('delete',path),undefined)
})
test('student and admin privileges cannot cross',()=>{
 for(const [method,path,roles] of operations){
  const concretePath=path.replace('{id}','1')
  for(const role of ['STUDENT','HOSTEL_ADMIN']){
   if(roles.length&&!roles.includes(role))assert.throws(()=>validateRequest(method,concretePath,role))
   else assert.doesNotThrow(()=>validateRequest(method,concretePath,role))
  }
 }
})
test('broken room filters and undocumented fields are rejected',()=>{
 assert.throws(()=>validateRequest('get','/rooms','HOSTEL_ADMIN',undefined,{starts_with:''}))
 assert.throws(()=>validateRequest('get','/rooms','HOSTEL_ADMIN',undefined,{only_vacancy:true}))
 assert.throws(()=>validateRequest('post','/rooms','HOSTEL_ADMIN',{hostelId:1}))
 assert.equal(findOperation('get','/students/0'),undefined)
})
