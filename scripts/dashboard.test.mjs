import test from 'node:test'
import assert from 'node:assert/strict'
import {init,use} from 'echarts/core'
import {PieChart,LineChart} from 'echarts/charts'
import {GridComponent,TooltipComponent,GraphicComponent} from 'echarts/components'
import {SVGRenderer} from 'echarts/renderers'
import {attendanceSummary,lastSevenDates,indiaDate,activeEvents,attendancePieOption,attendanceLineOption} from '../src/admin/utils/dashboardData.ts'
use([PieChart,LineChart,GridComponent,TooltipComponent,GraphicComponent,SVGRenderer])
// Synthetic values stay exclusively in this test; no successful API responses are mocked.
const summary=(total,present,absent)=>({totalStudentsOfTheHostel:total,totalStudentsWithatleastOnePresentDuringDateFilter:present,completelyAbsentStudentsCountDuringDates:absent})
test('attendance summary uses exact documented fields and rejects missing/inconsistent values',()=>{
 assert.deepEqual(attendanceSummary(summary(10,7,3)),{total:10,present:7,absent:3,rate:70})
 for(const data of [undefined,{},summary(10,undefined,3),summary(10,8,3),summary(10,-1,11),summary('10',7,3)])assert.equal(attendanceSummary(data),null)
 assert.deepEqual(attendanceSummary(summary(0,0,0)),{total:0,present:0,absent:0,rate:null})
})
test('report dates use the India calendar across UTC midnight and month boundaries',()=>{
 assert.equal(indiaDate(new Date('2026-10-20T20:00:00Z')),'2026-10-21')
 assert.deepEqual(lastSevenDates(new Date('2026-03-01T20:00:00Z')),['2026-02-24','2026-02-25','2026-02-26','2026-02-27','2026-02-28','2026-03-01','2026-03-02'])
})
test('upcoming events omit inactive/past entries and sort by start time',()=>{
 const now=new Date('2026-10-21T00:00:00Z')
 const events=[{id:1,isActive:true,startingAt:'2026-10-22',endingAt:'2026-10-23'},{id:2,isActive:false,startingAt:'2026-10-21',endingAt:'2026-10-25'},{id:3,isActive:true,startingAt:'2026-10-19',endingAt:'2026-10-20'},{id:4,isActive:true,startingAt:'2026-10-21',endingAt:'2026-10-22'}]
 assert.deepEqual(activeEvents(events,now).map(event=>event.id),[4,1])
})
test('line chart preserves failed reports as gaps rather than invented zeroes',()=>{
 const option=attendanceLineOption([{date:'2026-10-19',summary:summary(10,8,2)},{date:'2026-10-20',summary:null},{date:'2026-10-21',summary:summary(10,0,10)}])
 assert.deepEqual(option.series[0].data,[8,null,0]);assert.equal(option.series[0].type,'line');assert.equal(option.series[0].connectNulls,false)
})
test('Apache ECharts renders the doughnut and line options as real SVG charts',()=>{
 const options=[attendancePieOption(attendanceSummary(summary(10,7,3))),attendanceLineOption([{date:'2026-10-20',summary:summary(10,7,3)},{date:'2026-10-21',summary:summary(10,8,2)}])]
 for(const option of options){const chart=init(null,null,{renderer:'svg',ssr:true,width:380,height:180});try{chart.setOption({...option,animation:false});const svg=chart.renderToSVGString();assert.match(svg,/<svg/);assert.match(svg,/<path/);assert.doesNotMatch(svg,/NaN/)}finally{chart.dispose()}}
})
