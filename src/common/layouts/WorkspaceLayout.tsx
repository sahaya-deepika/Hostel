import type { ReactNode } from 'react'
import type { NavigationItem } from '../types'
import {useEffect,useState} from 'react'
import {Link,NavLink,useLocation} from '@/common/utils/navigation'
import {House,CalendarDays,ArrowUpRight,LogOut,Menu,X} from 'lucide-react'
import {useAuth} from '../utils/AuthContext'
import {dashboardPath} from '../utils/session'
const titles: Record<string, [string, string]>={dashboard:['Dashboard','Have a great day at your hostel.'],students:['Students','Every student. Every detail. One community.'],rooms:['Rooms','A little room to feel at home.'],attendance:['Attendance','Keep track of every check-in.'],leaves:['Leave Applications','Your time away, thoughtfully managed.'],events:['Upcoming Events','Something to look forward to.']}
export default function WorkspaceLayout({admin=false,nav,children,headerTools=null}: {admin?: boolean; nav: NavigationItem[]; children: ReactNode; headerTools?: ReactNode}) {
 const {user,signOut:logout}=useAuth()
 const location=useLocation()
 const [menu,setMenu]=useState(false)
 const [collapsed,setCollapsed]=useState(false)
 const [toast,setToast]=useState('')
 const [title,subtitle]=titles[location.pathname.split('/')[2]]||titles.dashboard
 const dashboard=title==='Dashboard'
 const today=new Date()
 useEffect(()=>{let timer: ReturnType<typeof setTimeout>;function success(event: Event){setToast((event as CustomEvent<string>).detail);clearTimeout(timer);timer=setTimeout(()=>setToast(''),5000)}window.addEventListener('api-success',success);return()=>{clearTimeout(timer);window.removeEventListener('api-success',success)}},[])
 useEffect(()=>{if(!menu)return;function close(event: KeyboardEvent){if(event.key==='Escape')setMenu(false)}window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[menu])
 function toggleNavigation(){if(window.matchMedia('(max-width:760px)').matches)setMenu(!menu);else setCollapsed(!collapsed)}
 return <div className={`app-shell${dashboard?' is-dashboard':''}${admin?' is-admin':''}${collapsed?' sidebar-collapsed':''}`}>
  <header className="workspace-header">
   <Link to={dashboardPath(user!.role)} className="workspace-brand"><House size={34} strokeWidth={1.5}/><span><strong>OurHostel</strong><small>Live · Learn · Belong</small></span></Link>
   <button className="workspace-menu" aria-label="Toggle navigation" aria-controls="workspace-navigation" aria-expanded={menu||!collapsed} onClick={toggleNavigation}><Menu size={24}/></button>
   {headerTools}
   <div className="workspace-account"><span className="avatar" title={user!.email}>{user!.email.slice(0,1).toUpperCase()}</span><span><strong title={user!.email}>{user!.email}</strong><small>{admin?'Hostel Administrator':'Student'}</small></span><button onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={18}/></button></div>
  </header>
  {menu&&<button className="workspace-backdrop" aria-label="Close navigation" onClick={()=>setMenu(false)}/>}
  <aside id="workspace-navigation" className={menu?'sidebar mobile-open':'sidebar'}>
   <button className="workspace-close" aria-label="Close navigation" onClick={()=>setMenu(false)}><X size={20}/></button>
   <nav aria-label={admin?'Administration':'Student navigation'}>{nav.map(([Icon,label,to])=><NavLink key={to} to={to} end={to.endsWith('/dashboard')} onClick={()=>setMenu(false)}><Icon size={21} strokeWidth={1.6}/>{to.endsWith('/dashboard')?'Dashboard':label}</NavLink>)}</nav>
   <div className="sidebar-bottom">{admin&&<img className="workspace-gold-leaves" src="/images/image3.png" alt="" aria-hidden="true"/>}<div className="sidebar-home"><House size={72} strokeWidth={.8}/><span>Live · Learn · Belong</span></div><h2>A better place<br/>to belong.</h2><Link className="sidebar-events" to={admin?'/admin/events':'/student/events'}>Explore your community <ArrowUpRight size={15}/></Link></div>
  </aside>
  <div className="main-shell">{toast&&<div className="toast" role="status">{toast}<button aria-label="Dismiss message" onClick={()=>setToast('')}>×</button></div>}
   <main><div className={`page-heading${admin&&dashboard?' dashboard-date-only':''}`}>{!(admin&&dashboard)&&<div><span className="eyebrow">{dashboard?'WELCOME BACK':admin?'YOUR HOSTEL WORKSPACE':'YOUR EVERYDAY AT OURHOSTEL'}</span><h1>{dashboard?<>Hey, <span>welcome back!</span></>:title}</h1><p>{subtitle}</p></div>}<div className="date-chip"><CalendarDays size={25}/><span><strong>{today.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Calcutta'})}</strong><small>{today.toLocaleDateString('en-IN',{weekday:'long',timeZone:'Asia/Calcutta'})}</small></span></div></div>
   {children}<footer><span>© {today.getFullYear()} OurHostel</span><span>A better place to belong. <House size={13}/></span></footer></main>
  </div>
 </div>
}
