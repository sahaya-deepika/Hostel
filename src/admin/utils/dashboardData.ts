import type { EChartsCoreOption } from 'echarts/core'
import type { AttendanceSummary, AttendanceCounts, AttendanceDay, HostelEvent, LeaveStatus } from '../../common/types'
// Derive dashboard values only from documented API fields.
export function attendanceSummary(summary?: AttendanceSummary | null): AttendanceCounts | null {
 if(!summary)return null
 const total=summary.totalStudentsOfTheHostel,present=summary.totalStudentsWithatleastOnePresentDuringDateFilter,absent=summary.completelyAbsentStudentsCountDuringDates
 if(![total,present,absent].every(n=>Number.isInteger(n)&&n>=0)||present+absent!==total)return null
 return {total,present,absent,rate:total?Math.round(present/total*1000)/10:null}
}
export function indiaDate(date=new Date()) {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Calcutta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date)
 const value=(type: Intl.DateTimeFormatPartTypes)=>parts.find(part=>part.type===type)!.value
 return `${value('year')}-${value('month')}-${value('day')}`
}
export function lastSevenDates(now=new Date()) {
 const today=new Date(indiaDate(now)+'T00:00:00Z')
 return Array.from({length:7},(_,index)=>{const day=new Date(today);day.setUTCDate(day.getUTCDate()-6+index);return day.toISOString().slice(0,10)})
}
export function activeEvents(events?: HostelEvent[],now=new Date()) {
 return (Array.isArray(events)?events:[]).filter(event=>event.isActive&&new Date(event.endingAt)>=now).sort((a,b)=>new Date(a.startingAt).getTime()-new Date(b.startingAt).getTime())
}
export function initials(name?: string) {return name?name.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase():'?'}
export const leaveLabels: Record<LeaveStatus, string>={WAITING_FOR_APPROVAL:'Pending',APPROVED:'Approved',REJECTED:'Rejected',CANCELLED:'Cancelled'}
export function attendancePieOption(summary: AttendanceCounts): EChartsCoreOption {
 return {animationDuration:450,color:['#133650','#dae4ed'],tooltip:{trigger:'item',renderMode:'richText',formatter:'{b}: {c} ({d}%)'},series:[{type:'pie',radius:['64%','91%'],center:['50%','50%'],avoidLabelOverlap:true,label:{show:false},emphasis:{scale:false},data:[{name:'Present today',value:summary.present},{name:'Absent today',value:summary.absent}]}],graphic:[{type:'text',left:'center',top:'38%',style:{text:String(summary.total),fill:'#133650',font:'bold 30px Georgia'}},{type:'text',left:'center',top:'58%',style:{text:'Total students',fill:'#64748b',font:'12px sans-serif'}}]}
}
export function attendanceLineOption(days: AttendanceDay[]): EChartsCoreOption {
 return {animationDuration:450,color:['#244e70'],tooltip:{trigger:'axis',renderMode:'richText',confine:true},grid:{top:18,right:12,bottom:25,left:30},xAxis:{type:'category',boundaryGap:false,data:days.map(day=>new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(day.date+'T00:00:00Z'))),axisLine:{lineStyle:{color:'#dfe5eb'}},axisTick:{show:false},axisLabel:{fontSize:9,color:'#6c8098',hideOverlap:true}},yAxis:{type:'value',min:0,minInterval:1,axisLabel:{fontSize:10,color:'#6c8098'},splitLine:{lineStyle:{color:'#eef0f2'}}},series:[{name:'Students present',type:'line',smooth:false,connectNulls:false,symbol:'circle',symbolSize:5,lineStyle:{width:2.5},areaStyle:{color:'#e3edf5',opacity:.6},data:days.map(day=>attendanceSummary(day.summary)?.present??null)}]}
}
