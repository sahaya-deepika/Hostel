import type { ButtonHTMLAttributes } from 'react'
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' }
export default function Button({ variant, className = '', type = 'button', ...props }: ButtonProps) {
 return <button type={type} className={[variant === 'primary' ? 'primary' : '', className].filter(Boolean).join(' ')} {...props} />
}
