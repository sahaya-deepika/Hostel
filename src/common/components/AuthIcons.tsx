import { useId } from 'react'

export function HostelBrandIcon() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M5 28 32 5l27 23M13 24v34h38V24" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="23" y="29" width="8" height="8" rx="1.5" fill="currentColor" /><rect x="35" y="29" width="8" height="8" rx="1.5" fill="currentColor" />
    <rect x="23" y="41" width="8" height="8" rx="1.5" fill="currentColor" /><rect x="35" y="41" width="8" height="8" rx="1.5" fill="currentColor" />
  </svg>
}

export function LoginFeatureIcon({ type }: {type: 'secure' | 'community' | 'learning' | 'facilities'}) {
  const id = useId()
  const fill = `url(#${id})`
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    <defs><linearGradient id={id} x1="5" y1="5" x2="44" y2="43" gradientUnits="userSpaceOnUse"><stop stopColor="#59a6ff" /><stop offset="1" stopColor="#0060ff" /></linearGradient></defs>
    {type === 'secure' && <><path d="M24 3c-5 4-11 6-18 7v13c0 10 7 17 18 22 11-5 18-12 18-22V10c-7-1-13-3-18-7Z" fill={fill} /><path d="m16 23 6 6 11-12" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></>}
    {type === 'community' && <><circle cx="12" cy="15" r="6" fill="#82baff" /><circle cx="36" cy="15" r="6" fill="#2282ff" /><path d="M2 35v-5a10 10 0 0 1 20 0v5c-5 3-15 3-20 0Z" fill="#7ab6ff" /><path d="M26 35v-5a10 10 0 0 1 20 0v5c-5 3-15 3-20 0Z" fill="#1675f9" /><circle cx="24" cy="13" r="7" fill={fill} /><path d="M12 40v-9a12 12 0 0 1 24 0v9c-6 3-18 3-24 0Z" fill={fill} stroke="white" strokeWidth="1.4" /></>}
    {type === 'learning' && <><path d="m2 18 22-10 22 10-22 10L2 18Z" fill={fill} /><path d="M10 24v12c8 6 20 6 28 0V24l-14 7-14-7Z" fill={fill} /><path d="M43 20v15" stroke="#0068ff" strokeWidth="2.5" strokeLinecap="round" /><circle cx="43" cy="36" r="2.5" fill="#0068ff" /></>}
    {type === 'facilities' && <><path d="M6 5h23v39H6z" fill={fill} /><path d="M29 17h14v27H29z" fill="#71adff" /><path d="M3 44h43" stroke="#347fff" strokeWidth="3" strokeLinecap="round" />{[10,18,26].map(y=><g key={y}><rect x="12" y={y} width="4" height="5" rx="1" fill="white" /><rect x="21" y={y} width="4" height="5" rx="1" fill="white" /></g>)}<path d="M16 44V34h5v10" fill="white" /><path d="M34 22h4v5h-4zm0 10h4v5h-4z" fill="#eaf4ff" /></>}
  </svg>
}

export function LoginPasswordIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2.2" /><rect x="3" y="9" width="18" height="14" rx="3" fill="currentColor" /><circle cx="12" cy="15" r="1.7" fill="white" /><path d="M12 16v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
