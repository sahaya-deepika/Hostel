'use client'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import {useEffect,useRef,useState} from 'react'
let library: Promise<typeof import('echarts/core')> | null
function loadCharts(){if(!library)library=Promise.all([import('echarts/core'),import('echarts/charts'),import('echarts/components'),import('echarts/renderers')]).then(([core,charts,components,renderers])=>{core.use([charts.PieChart,charts.LineChart,components.GridComponent,components.TooltipComponent,components.GraphicComponent,renderers.SVGRenderer]);return core}).catch(error=>{library=null;throw error});return library}
export default function DashboardChart({option,label,className=''}: {option: EChartsCoreOption | null; label: string; className?: string}) {
 const container=useRef<HTMLDivElement>(null)
 const [error,setError]=useState(false)
 useEffect(()=>{let cancelled=false; let chart: EChartsType | undefined,observer: ResizeObserver | undefined
  loadCharts().then(core=>{if(cancelled||!container.current)return;chart=core.init(container.current,null,{renderer:'svg'});chart.setOption({...option,animation:!window.matchMedia('(prefers-reduced-motion:reduce)').matches});observer=new ResizeObserver(()=>chart?.resize());observer.observe(container.current)}).catch(()=>{if(!cancelled)setError(true)})
  return()=>{cancelled=true;observer?.disconnect();chart?.dispose()}
 },[option])
 if(error)return <p className="chart-error" role="status">The chart could not load. Its data is available in the summary or table.</p>
 return <div ref={container} className={`dashboard-echart ${className}`} role="img" aria-label={label}/>
}
