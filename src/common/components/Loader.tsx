import { LoaderCircle } from 'lucide-react'
export default function Loader({ inline = false, label = 'Loading your hostel data…' }) {
  if (inline) return <span className="inline-loader" role="status"><LoaderCircle className="spin" size={18} aria-hidden="true" />{label}</span>
  return <div className="state" role="status"><LoaderCircle className="spin" aria-hidden="true" />{label}</div>
}
