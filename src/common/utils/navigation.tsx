'use client'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import {useRouter,usePathname,useParams as nextParams,useSearchParams as nextSearchParams} from 'next/navigation'
type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & { to: string }
export function Link({to,...props}: LinkProps){return <NextLink href={to} {...props}/>}
export function NavLink({to,end=false,className='',...props}: LinkProps & { end?: boolean }){const pathname=usePathname();const active=end?pathname===to:pathname===to||pathname.startsWith(to+'/');return <NextLink href={to} aria-current={active?'page':undefined} className={[className,active?'active':''].filter(Boolean).join(' ')} {...props}/>}
export function useNavigate(){const router=useRouter();return (to: string | number,options: {replace?: boolean}={})=>typeof to==='number'?router.back():options.replace?router.replace(to):router.push(to)}
export function useLocation(){return {pathname:usePathname()}}
export function useParams(){return nextParams<{id: string}>()}
export function useSearchParams(){return [nextSearchParams()] as const}
