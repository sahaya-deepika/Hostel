import {useState} from 'react'
import {Link} from '@/common/utils/navigation'
import {Search,Plus} from 'lucide-react'
import {State} from '../../../common/components/UI'
import Input from '../../../common/components/Input'
import {useResource} from '../../../common/utils/hooks'
import {studentService} from '@/admin/services/studentService'
export default function StudentList(){
 const r=useResource(studentService.list)
 const [search,setSearch]=useState('')
 const rows=(r.data?.data||[]).filter(s=>(s.studentName+' '+s.rollNumber).toLowerCase().includes(search.toLowerCase()))
 return <><div className="toolbar"><div className="search"><Search size={18}/><Input placeholder="Search name or roll number…" value={search} onChange={e=>setSearch(e.target.value)}/></div><Link className="primary" to="/admin/students/new"><Plus size={17}/>Add student</Link></div>
  <section className="panel"><div className="section-head"><h2>All students <span className="count">{r.data?.data?.length??'—'}</span></h2><span className="muted">Your hostel directory</span></div>
   <State resource={r} empty={!rows.length}><div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Room ID</th><th>Contact</th><th/></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><div className="person"><span className="avatar">{s.studentName?.slice(0,2).toUpperCase()}</span><Link to={'/admin/students/'+s.id}>{s.studentName}</Link></div></td><td>{s.rollNumber}</td><td>{s.roomId??'Unassigned'}</td><td>{s.contactNumber}</td><td><Link className="text-link" to={'/admin/students/'+s.id+'/edit'}>Edit</Link></td></tr>)}</tbody></table></div></State>
  </section>
 </>
}

