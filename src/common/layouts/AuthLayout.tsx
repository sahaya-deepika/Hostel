import type { ReactNode } from 'react'
import {Link} from '@/common/utils/navigation'
import '../styles/auth.css'

const features=[
 ['Safe & Secure','Your Safety, Our Priority'],
 ['Vibrant Community','Friends for Life'],
 ['Comfortable Stay','A Place to Call Home'],
 ['Better Tomorrow','Learn, Grow and Shine'],
]
function Brand({className=''}) {
 return <Link to="/login" className={`auth-logo ${className}`} aria-label="OurHostel ? More Than a Stay, A Second Home"><span className="auth-logo-mark" aria-hidden="true"><img src="/images/image2.png" alt="" width="1774" height="887"/></span><span className="auth-logo-copy"><strong>OurHostel</strong><small>More Than a Stay<br/>A Second Home</small></span></Link>
}
export default function AuthLayout({title,description,children,setup=false}: {title: ReactNode; description: string; children: ReactNode; setup?: boolean}) {
 return <div className={`auth-campus${setup?' auth-password-setup':''}`} style={{backgroundImage:'url("/images/image1.png")'}}>
  <div className="login-top-link"><span>{setup?'Already set up?':'New here?'}</span><Link to={setup?'/login':'/setup-password'}>{setup?'Login':'Set Your Password'}</Link></div>
  <section className="campus-scene" aria-label="Welcome to OurHostel">
   <div className="campus-welcome"><p className="welcome-script">Welcome to</p><h1>OurHostel</h1><p>More Than a Stay, A Second Home</p><span className="welcome-rule" aria-hidden="true"/></div>
  </section>
  <section className="login-panel min-w-0 flex items-center justify-center" aria-labelledby="auth-heading">
   <div className="login-content relative w-full">
    <img className="auth-card-leaves" src="/images/image3.png" alt="" aria-hidden="true" width="1536" height="1024"/>
    <Brand className="card-brand"/>
    <div className="login-heading"><h2 id="auth-heading">{title}</h2><p>{description}</p></div>
    {children}
   </div>
  </section>
  <div className="login-footer" aria-label="Life at OurHostel">
   {features.map(([title,detail],index)=><div className="auth-feature" key={title}><span className="auth-feature-icon" aria-hidden="true"><img src="/images/image4.png" alt="" width="2172" height="724" style={{left:`${-56*index}px`}}/></span><span><strong>{title}</strong><small>{detail}</small></span></div>)}
  </div>
  <div className="auth-wave" aria-hidden="true"><img src="/images/image6.png" alt="" width="2172" height="724"/></div>
 </div>
}
