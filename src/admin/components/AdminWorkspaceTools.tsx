'use client'
import type { NavigationItem } from '@/common/types'
import {useState,useRef,useEffect} from 'react'
import {Search,Bell,X,ArrowUpRight} from 'lucide-react'
import {Link} from '@/common/utils/navigation'
export default function AdminWorkspaceTools({nav}: {nav: NavigationItem[]}) {
 const [query,setQuery]=useState(''),[focused,setFocused]=useState(false),[notice,setNotice]=useState(false)
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null)
 const matches=nav.filter(([,label])=>label.toLowerCase().includes(query.trim().toLowerCase()))
 useEffect(()=>{function close(event: PointerEvent){if(!root.current?.contains(event.target as Node | null)){setFocused(false);setNotice(false)}}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[])
 return <div className="workspace-tools" ref={root} onKeyDown={event=>{if(event.key==='Escape'){setFocused(false);setNotice(false)}}}>
  <div className="workspace-search"><button type="button" className="workspace-search-toggle" aria-label="Search workspace pages" onClick={()=>input.current?.focus()}><Search size={17}/></button><input ref={input} type="search" aria-label="Find a workspace page" placeholder="Search workspace…" value={query} onChange={event=>setQuery(event.target.value)} onFocus={()=>setFocused(true)} aria-controls="workspace-search-results" aria-expanded={focused}/>{focused&&<div className="workspace-search-results" id="workspace-search-results"><p>Workspace pages</p>{matches.length?matches.map(([,label,to])=><Link key={to} to={to} onClick={()=>{setFocused(false);setQuery('')}}>{label}<ArrowUpRight size={14}/></Link>):<p>No matching pages.</p>}</div>}</div>
  <button className="workspace-notifications" aria-label="Notification availability" aria-expanded={notice} aria-controls="workspace-notification-notice" onClick={()=>setNotice(!notice)}><Bell size={23}/></button>
  {notice&&<div className="workspace-notification-notice" id="workspace-notification-notice" role="status"><button aria-label="Close notification notice" onClick={()=>setNotice(false)}><X size={16}/></button><strong>Notifications unavailable</strong><p>The supplied API guide does not include a notifications endpoint. Check your dashboard for events and announcements.</p></div>}
 </div>
}
