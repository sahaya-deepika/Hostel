import type { Role } from '../../types'
import type { ChangeEvent, FormEvent } from 'react'
import { isAxiosError } from 'axios'
type FieldErrors = Partial<Record<'email' | 'password', string>>
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Mail } from 'lucide-react'
import AuthLayout from '../../layouts/AuthLayout'
import { LoginPasswordIcon } from '../../components/AuthIcons'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Loader from '../../components/Loader'
import { Notice } from '../../components/UI'
import { login } from '../../services/authService'
import { errorText } from '../../services/api'
import { useAuth } from '../../utils/AuthContext'
import { dashboardPath, validateLoginRole } from '../../utils/session'

const EMAIL_STORAGE_KEY = 'ourhostel-remembered-email'
function rememberedEmail() {
  try { return localStorage.getItem(EMAIL_STORAGE_KEY) || '' } catch { return '' }
}

export default function Login() {
  const { signIn, sessionError } = useAuth()
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRecoveryNotice, setShowRecoveryNotice] = useState(false)
  const submitting = useRef(false)
  const errorSummary = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedEmail = rememberedEmail()
    setEmail(savedEmail)
    setRemember(Boolean(savedEmail))
  }, [])

  useEffect(() => {
    if (error) errorSummary.current?.focus()
  }, [error])

  function switchPortal(role: Role) {
    if (busy || role === selectedRole) return
    setSelectedRole(role)
    setEmail('')
    setRemember(false)
    setShowPassword(false)
    setError('')
    setFieldErrors({})
    setShowRecoveryNotice(false)
  }

  function clearFieldError(name: keyof FieldErrors) {
    setFieldErrors(previous => ({ ...previous, [name]: '' }))
  }

  function toggleRemember(event: ChangeEvent<HTMLInputElement>) {
    setRemember(event.target.checked)
    if (!event.target.checked) {
      try { localStorage.removeItem(EMAIL_STORAGE_KEY) } catch { /* Storage may be unavailable. */ }
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const validation: FieldErrors = {}
    if (!email.trim()) validation.email = 'Enter your email address.'
    else if ((formElement.elements.namedItem('email') as HTMLInputElement).validity.typeMismatch) {
      validation.email = 'Enter a valid email address, such as name@college.edu.'
    }
    if (!form.get('password')) validation.password = 'Enter your password.'
    setFieldErrors(validation)
    setError('')
    if (Object.keys(validation).length) {
      (formElement.elements.namedItem(Object.keys(validation)[0]) as HTMLInputElement).focus()
      return
    }

    submitting.current = true
    setBusy(true)
    try {
      // Remember only the email; keep the established session-based token handling.
      try {
        if (remember) localStorage.setItem(EMAIL_STORAGE_KEY, email.trim())
        else localStorage.removeItem(EMAIL_STORAGE_KEY)
      } catch { /* Login remains available if preference storage is restricted. */ }
      const response = await login({ email: email.trim(), password: String(form.get('password')) }, selectedRole)
      validateLoginRole(response.data.user.role, selectedRole)
      signIn(response.data)
      window.location.replace(dashboardPath(response.data.user.role))
    } catch (requestError) {
      const backendErrors = (isAxiosError(requestError) ? requestError.response?.data?.errors : undefined)
      if (backendErrors && typeof backendErrors === 'object') {
        setFieldErrors(Object.fromEntries(
          ['email', 'password'].filter(name => backendErrors[name]).map(name => [name, String(backendErrors[name])]),
        ))
      }
      setError(errorText(requestError))
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" description={selectedRole === 'HOSTEL_ADMIN' ? 'Login to your OurHostel admin account' : 'Login to your OurHostel user account'}>
      <fieldset className="login-role-toggle" disabled={busy}>
        <legend className="sr-only">Choose your login</legend>
        {([['STUDENT', 'User'], ['HOSTEL_ADMIN', 'Admin']] as const).map(([role, label]) => (
          <label key={role}>
            <input type="radio" name="login-role" value={role} checked={selectedRole === role}
              onChange={() => switchPortal(role)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      {sessionError && <Notice>{sessionError}</Notice>}
      <form key={selectedRole} onSubmit={handleLogin} className="student-login-form" aria-busy={busy} noValidate>
        <div className="login-field">
          <label htmlFor="login-email">Email Address</label>
          <div className="login-input-wrap">
            <Mail size={20} aria-hidden="true" />
            <Input id="login-email" name="email" type="email" required value={email}
              onChange={event => { setEmail(event.target.value); clearFieldError('email') }}
              placeholder="Enter your email" autoComplete="username" autoCapitalize="none" spellCheck={false}
              disabled={busy} aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined} />
          </div>
          {fieldErrors.email && <p id="login-email-error" className="login-field-error">{fieldErrors.email}</p>}
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Password</label>
          <div className="login-input-wrap">
            <LoginPasswordIcon />
            <Input id="login-password" name="password" type={showPassword ? 'text' : 'password'} required
              onChange={() => clearFieldError('password')} placeholder="Enter your password" autoComplete="current-password"
              disabled={busy} aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined} />
            <Button className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword} aria-controls="login-password" disabled={busy}
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </Button>
          </div>
          {fieldErrors.password && <p id="login-password-error" className="login-field-error">{fieldErrors.password}</p>}
        </div>

        <div className="login-options">
          <label className="remember-option" title="Remember your email on this device">
            <Input type="checkbox" name="remember" checked={remember} onChange={toggleRemember} disabled={busy} aria-describedby="remember-hint" />
            <span>Remember me</span>
          </label>
          <Button className="recovery-link" onClick={() => setShowRecoveryNotice(!showRecoveryNotice)}
            aria-expanded={showRecoveryNotice} aria-controls="password-recovery-notice">Forgot Password?</Button>
        </div>
        <small id="remember-hint" className="sr-only">Remembers your email on this device.</small>
        <div id="password-recovery-notice" hidden={!showRecoveryNotice}>
          {showRecoveryNotice && <Notice>First time signing in? Use “Set Your Password” with your welcome email. Password recovery is not available yet because the documented /students/forgot_password endpoint is not implemented. Contact your hostel administrator for help.</Notice>}
        </div>
        {error && <div ref={errorSummary} className="login-error" role="alert" tabIndex={-1}>{error}</div>}
        <Button type="submit" variant="primary" className="student-login-button login-button" disabled={busy}>
          {busy ? <Loader inline label="Logging in…" /> : <>Login <ArrowRight size={21} aria-hidden="true" /></>}
        </Button>
      </form>

    </AuthLayout>
  )
}
