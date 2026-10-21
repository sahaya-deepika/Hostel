import type { ChildrenProps } from '@/common/types'
import {Suspense} from 'react'
import '../common/styles/index.css'
import '../common/styles/auth.css'
import '../common/styles/workspace.css'
import Providers from './providers'
export const metadata={title:'OurHostel | A better place to belong',description:'Your hostel. All in one place.'}
export default function RootLayout({children}: ChildrenProps){return <html lang="en"><body><Suspense fallback={<div role="status">Loading OurHostel…</div>}><Providers>{children}</Providers></Suspense></body></html>}
