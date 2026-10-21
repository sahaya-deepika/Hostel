import {attendanceService} from '@/admin/services/attendanceService'
import {errorText} from '../../common/services/api'
import {lastSevenDates} from '../utils/dashboardData'
// The API exposes daily summaries, not a dedicated analytics endpoint.
export async function loadAttendanceTrend() {
 const dates=lastSevenDates()
 const results=await Promise.allSettled(dates.map(date=>attendanceService.report({date,status:'present',page:1,pageSize:1})))
 if(results.every(result=>result.status==='rejected'))throw new Error(errorText(results[0].reason))
 return {data:results.map((result,index)=>result.status==='fulfilled'?{date:dates[index],summary:result.value.data?.summary,error:null}:{date:dates[index],summary:null,error:errorText(result.reason)})}
}
